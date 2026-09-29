// ==============================================================================
// QUANTIFY — tests/statevector.test.ts
// ==============================================================================
// Simulator test suite as specified in the implementation plan (§3.2).
// Tests the pure statevector engine (lib/quantum/statevector.ts) without any
// React, Next.js or Supabase dependencies — no mocking needed.
//
// These tests serve as:
//   1. Safety net before and after the Phase 2 refactor.
//   2. Evidence that the SWAP rewrite was equivalent to the original loop.
//   3. Contract tests confirming the bit-order convention (qubit 0 = LSB).
// ==============================================================================

import { describe, it, expect } from 'vitest'
import {
  applySingleQubitGate,
  applyCNOT,
  applySWAP,
  computeProbabilities,
  runCircuit,
} from '../lib/quantum/statevector'
import { GATE_MATRICES } from '../lib/quantum/gates'
import type { Complex } from '../lib/quantum/complex'
import type { PlacedGate } from '../types/quantify'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a PlacedGate for a single-qubit gate at the given step. */
function gate(type: PlacedGate['type'], targetQubit: number, step = 0): PlacedGate {
  return { id: `${type}-${targetQubit}-${step}`, type, targetQubit, step }
}

/** Builds a CNOT PlacedGate. */
function cnot(controlQubit: number, targetQubit: number, step = 0): PlacedGate {
  return { id: `CNOT-${controlQubit}-${targetQubit}-${step}`, type: 'CNOT', targetQubit, controlQubit, step }
}

/** Builds a SWAP PlacedGate. */
function swap(qubitA: number, qubitB: number, step = 0): PlacedGate {
  return { id: `SWAP-${qubitA}-${qubitB}-${step}`, type: 'SWAP', targetQubit: qubitB, controlQubit: qubitA, step }
}

/** Asserts a probability is within tolerance. */
const TOLERANCE = 1e-9
function expectProb(state: Complex[], idx: number, expected: number): void {
  const mag2 = state[idx].r ** 2 + state[idx].i ** 2
  expect(Math.abs(mag2 - expected)).toBeLessThan(TOLERANCE)
}

/** Asserts probabilities sum to 1. */
function expectNormalised(state: Complex[]): void {
  const total = state.reduce((acc, c) => acc + c.r ** 2 + c.i ** 2, 0)
  expect(Math.abs(total - 1.0)).toBeLessThan(TOLERANCE)
}

/** Returns the initial |00…0⟩ statevector for n qubits. */
function initState(n: number): Complex[] {
  return Array.from({ length: 1 << n }, (_, i) => i === 0 ? { r: 1, i: 0 } : { r: 0, i: 0 })
}

// ---------------------------------------------------------------------------
// Single-qubit gate tests
// ---------------------------------------------------------------------------

describe('Identity (no gates)', () => {
  it('1 qubit: |0⟩ stays at probability 1', () => {
    const result = runCircuit(1, [])
    expect(result.basisStates[0].probability).toBeCloseTo(1)
    expect(result.basisStates[1].probability).toBeCloseTo(0)
  })
})

describe('Pauli-X (NOT)', () => {
  it('flips |0⟩ to |1⟩ on q0', () => {
    const result = runCircuit(1, [gate('X', 0)])
    expect(result.basisStates[0].probability).toBeCloseTo(0) // |0⟩
    expect(result.basisStates[1].probability).toBeCloseTo(1) // |1⟩
  })
})

describe('Hadamard', () => {
  it('creates 50/50 superposition from |0⟩', () => {
    const result = runCircuit(1, [gate('H', 0)])
    expect(result.basisStates[0].probability).toBeCloseTo(0.5)
    expect(result.basisStates[1].probability).toBeCloseTo(0.5)
  })

  it('H · H = identity (|0⟩ restored)', () => {
    const result = runCircuit(1, [gate('H', 0, 0), gate('H', 0, 1)])
    expect(result.basisStates[0].probability).toBeCloseTo(1)
    expect(result.basisStates[1].probability).toBeCloseTo(0)
  })
})

describe('Pauli-Z', () => {
  it('has no visible effect on |0⟩ (Z|0⟩ = |0⟩)', () => {
    const result = runCircuit(1, [gate('Z', 0)])
    expect(result.basisStates[0].probability).toBeCloseTo(1)
  })

  it('negates amplitude of |1⟩ but probability stays 1', () => {
    // Apply X first (→|1⟩), then Z (→−|1⟩); probability must still be 1
    const result = runCircuit(1, [gate('X', 0, 0), gate('Z', 0, 1)])
    expect(result.basisStates[1].probability).toBeCloseTo(1)
  })
})

// ---------------------------------------------------------------------------
// Two-qubit gate tests
// ---------------------------------------------------------------------------

describe('Bell state: H q0, CNOT(q0 → q1)', () => {
  it('produces 50% |00⟩ and 50% |11⟩, isEntangled = true', () => {
    const result = runCircuit(2, [gate('H', 0, 0), cnot(0, 1, 1)])
    const p = result.basisStates
    // LSB convention: |q1 q0⟩
    // After H on q0: (|00⟩ + |01⟩)/√2
    // After CNOT(ctrl=0, tgt=1): (|00⟩ + |11⟩)/√2
    // index 0 = |00⟩, index 3 = |11⟩
    expect(p[0].probability).toBeCloseTo(0.5) // |00⟩
    expect(p[3].probability).toBeCloseTo(0.5) // |11⟩
    expect(p[1].probability).toBeCloseTo(0)   // |01⟩
    expect(p[2].probability).toBeCloseTo(0)   // |10⟩
    expect(result.isEntangled).toBe(true)
  })
})

describe('CNOT no-op (control at |0⟩)', () => {
  it('leaves state unchanged when control qubit is |0⟩', () => {
    // Control is q0 = 0, so CNOT should do nothing
    const result = runCircuit(2, [cnot(0, 1, 0)])
    expect(result.basisStates[0].probability).toBeCloseTo(1) // |00⟩ unchanged
  })
})

// ---------------------------------------------------------------------------
// SWAP gate tests
// ---------------------------------------------------------------------------

describe('SWAP gate', () => {
  it('moves amplitude from q0 to q1: X q0 then SWAP(0,1)', () => {
    // Start |00⟩, apply X on q0 → |01⟩ (index 1 in LSB)
    // SWAP(q0, q1) → |10⟩ (index 2 in LSB)
    const result = runCircuit(2, [gate('X', 0, 0), swap(0, 1, 1)])
    expect(result.basisStates[2].probability).toBeCloseTo(1) // |10⟩
    expect(result.basisStates[1].probability).toBeCloseTo(0)
  })

  it('SWAP equivalence: new implementation matches reference for all basis states', () => {
    // Reference SWAP (naive loop — kept here as evidence of equivalence)
    function swapRef(state: Complex[], a: number, b: number): Complex[] {
      const next = [...state]
      const dim = state.length
      for (let i = 0; i < dim; i++) {
        const ba = (i >> a) & 1
        const bb = (i >> b) & 1
        if (ba !== bb) {
          const j = i ^ (1 << a) ^ (1 << b)
          next[j] = state[i]
          next[i] = state[j]
        }
      }
      return next
    }

    // Test all 4 basis states of a 2-qubit system
    const bases = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
    for (const basis of bases) {
      const s: Complex[] = basis.map((r) => ({ r, i: 0 }))
      const ref = swapRef(s, 0, 1)
      const actual = applySWAP(s, 0, 1)
      for (let i = 0; i < 4; i++) {
        expect(Math.abs(actual[i].r - ref[i].r)).toBeLessThan(TOLERANCE)
        expect(Math.abs(actual[i].i - ref[i].i)).toBeLessThan(TOLERANCE)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('Invalid inputs — graceful skip', () => {
  it('CNOT with control === target is skipped, no crash', () => {
    // Should silently skip the gate and leave state unchanged
    const result = runCircuit(2, [{ id: 'bad', type: 'CNOT', targetQubit: 0, controlQubit: 0, step: 0 }])
    expect(result.basisStates[0].probability).toBeCloseTo(1)
  })

  it('Qubit index out of range is skipped', () => {
    // qubit 5 doesn't exist in a 2-qubit system
    const result = runCircuit(2, [gate('X', 5, 0)])
    expect(result.basisStates[0].probability).toBeCloseTo(1)
  })

  it('Measurement gate (M) has no amplitude effect', () => {
    const result = runCircuit(1, [gate('M', 0, 0)])
    expect(result.basisStates[0].probability).toBeCloseTo(1)
  })
})

// ---------------------------------------------------------------------------
// Normalisation (any random circuit)
// ---------------------------------------------------------------------------

describe('Normalisation', () => {
  it('probabilities always sum to 1 — Bell state', () => {
    const result = runCircuit(2, [gate('H', 0, 0), cnot(0, 1, 1)])
    const total = result.basisStates.reduce((acc, s) => acc + s.probability, 0)
    expect(Math.abs(total - 1)).toBeLessThan(1e-3) // allow for rounding in display
  })

  it('probabilities always sum to 1 — 3-qubit mixed circuit', () => {
    const result = runCircuit(3, [
      gate('H', 0, 0), gate('H', 1, 0), gate('H', 2, 0),
      cnot(0, 1, 1), cnot(1, 2, 2),
    ])
    const total = result.basisStates.reduce((acc, s) => acc + s.probability, 0)
    expect(Math.abs(total - 1)).toBeLessThan(1e-3)
  })
})

// ---------------------------------------------------------------------------
// Bit-order convention contract test (§3.3 reference)
// ---------------------------------------------------------------------------

describe('Bit-order convention (LSB: qubit 0 = rightmost)', () => {
  it('X on q0 (2-qubit system) → state |01⟩ at index 1', () => {
    // qubit 0 is the LSB. X flips bit 0. |00⟩ (idx 0) → |01⟩ (idx 1)
    const result = runCircuit(2, [gate('X', 0, 0)])
    expect(result.basisStates[1].state).toBe('|01⟩') // '01' → q1=0, q0=1
    expect(result.basisStates[1].probability).toBeCloseTo(1)
  })

  it('X on q1 (2-qubit system) → state |10⟩ at index 2', () => {
    // X flips bit 1. |00⟩ (idx 0) → |10⟩ (idx 2)
    const result = runCircuit(2, [gate('X', 1, 0)])
    expect(result.basisStates[2].state).toBe('|10⟩') // '10' → q1=1, q0=0
    expect(result.basisStates[2].probability).toBeCloseTo(1)
  })
})
