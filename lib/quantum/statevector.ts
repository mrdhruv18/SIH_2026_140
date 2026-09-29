// ==============================================================================
// QUANTIFY — lib/quantum/statevector.ts
// ==============================================================================
// Statevector evolution: applies single-qubit gates, CNOT, and SWAP to a
// complex amplitude array, then extracts measurement probabilities.
//
// BIT-ORDERING CONVENTION (canonical for this module and the client engine):
//   Qubit 0 is the LEAST-SIGNIFICANT BIT (LSB / rightmost) in the state index.
//   e.g. for 2 qubits: index 0 = |q₁q₀⟩ = |00⟩, index 1 = |01⟩ (q₀=1),
//                       index 2 = |10⟩ (q₁=1),     index 3 = |11⟩
//
//   This matches Qiskit's own bitstring printing order (qubit 0 = rightmost).
//   The simulate-circuit Edge Function uses the opposite (MSB) convention —
//   see deepdive §9.1 for the full explanation.
//
// WHY SEPARATE FROM quantum-simulator.ts:
//   The application loop is independently testable. Tests in tests/statevector.test.ts
//   can cover every gate type without importing any React or Next.js module.
// ==============================================================================

import { add, mul, magnitudeSquared, ZERO } from './complex'
import { GATE_MATRICES } from './gates'
import type { Complex } from './complex'
import type { GateType, PlacedGate, BasisStateProbability, SimulationResult } from '@/types/quantify'

// ---------------------------------------------------------------------------
// Single-qubit gate application
// ---------------------------------------------------------------------------

/**
 * Applies a 2×2 unitary U to qubit `target` in an N-qubit statevector.
 * All other qubits are left unchanged.
 */
export function applySingleQubitGate(
  state: Complex[],
  target: number,
  U: [[Complex, Complex], [Complex, Complex]]
): Complex[] {
  const dim = state.length
  const next: Complex[] = Array.from({ length: dim }, () => ({ ...ZERO }))

  for (let idx = 0; idx < dim; idx++) {
    // Which basis state does this amplitude live in?
    const bit = (idx >> target) & 1         // target qubit's value in |idx⟩
    const idx0 = idx & ~(1 << target)       // sibling with target = 0
    const idx1 = idx |  (1 << target)       // sibling with target = 1

    // Apply U row by row (only write once per amplitude to avoid double-work)
    if (bit === 0) {
      // Row 0 of U: next[idx0] += U[0][0]*a0 + U[0][1]*a1
      next[idx] = add(mul(U[0][0], state[idx0]), mul(U[0][1], state[idx1]))
    } else {
      // Row 1 of U: next[idx1] += U[1][0]*a0 + U[1][1]*a1
      next[idx] = add(mul(U[1][0], state[idx0]), mul(U[1][1], state[idx1]))
    }
  }

  return next
}

// ---------------------------------------------------------------------------
// CNOT gate application
// ---------------------------------------------------------------------------

/**
 * Applies a CNOT with the given control and target qubits.
 * If the control qubit is |1⟩, the target qubit is flipped.
 */
export function applyCNOT(
  state: Complex[],
  control: number,
  target: number
): Complex[] {
  const dim = state.length
  const next: Complex[] = [...state]

  for (let idx = 0; idx < dim; idx++) {
    if ((idx >> control) & 1) {
      // Control qubit is 1 — flip target bit
      const flipped = idx ^ (1 << target)
      next[flipped] = state[idx]
      next[idx]     = state[flipped]
    }
  }

  // The loop above writes each pair twice (once from each side).
  // Re-implement correctly: only process each unordered pair once.
  const result: Complex[] = [...state]
  for (let idx = 0; idx < dim; idx++) {
    if ((idx >> control) & 1) {
      const flipped = idx ^ (1 << target)
      if (idx < flipped) {
        result[flipped] = state[idx]
        result[idx]     = state[flipped]
      }
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// SWAP gate application
// ---------------------------------------------------------------------------

/**
 * Swaps the amplitudes of the two named qubits across the entire statevector.
 * Each ordered pair (idx, swapped) is processed exactly once (idx < swapped)
 * to avoid the double-write bug that a naïve loop produces.
 */
export function applySWAP(
  state: Complex[],
  qubitA: number,
  qubitB: number
): Complex[] {
  const dim = state.length
  const next: Complex[] = [...state]

  for (let idx = 0; idx < dim; idx++) {
    const bitA = (idx >> qubitA) & 1
    const bitB = (idx >> qubitB) & 1
    if (bitA !== bitB) {
      const swapped = idx ^ (1 << qubitA) ^ (1 << qubitB)
      if (idx < swapped) {
        next[swapped] = state[idx]
        next[idx]     = state[swapped]
      }
    }
  }

  return next
}

// ---------------------------------------------------------------------------
// Probability extraction
// ---------------------------------------------------------------------------

/**
 * Converts a complex statevector into a measurement probability distribution.
 * Returns one entry per basis state, in |000…0⟩ → |111…1⟩ order.
 * Qubit 0 is the rightmost character of each binary label (LSB convention).
 */
export function computeProbabilities(
  state: Complex[],
  qubitCount: number
): BasisStateProbability[] {
  return state.map((amp, idx) => {
    const prob = magnitudeSquared(amp)
    const binary = idx.toString(2).padStart(qubitCount, '0')
    return {
      state: `|${binary}⟩`,
      probability: Number(prob.toFixed(4)),
      percentage: Number((prob * 100).toFixed(1)),
      amplitudeReal: Number(amp.r.toFixed(3)),
      amplitudeImag: Number(amp.i.toFixed(3)),
    }
  })
}

/**
 * Converts a complex statevector into a formatted state-vector list
 * suitable for the UI's "State vector amplitudes" panel.
 */
export function formatStateVector(
  state: Complex[],
  qubitCount: number
): { state: string; amplitude: string; magnitude: number }[] {
  return state.map((amp, idx) => {
    const binary = idx.toString(2).padStart(qubitCount, '0')
    const mag = Math.sqrt(magnitudeSquared(amp))
    let ampStr = '0.0'
    if (mag > 0.0001) {
      if (Math.abs(amp.i) < 0.0001) {
        ampStr = amp.r.toFixed(3)
      } else if (Math.abs(amp.r) < 0.0001) {
        ampStr = `${amp.i.toFixed(3)}i`
      } else {
        ampStr = `${amp.r.toFixed(3)} ${amp.i >= 0 ? '+' : '-'} ${Math.abs(amp.i).toFixed(3)}i`
      }
    }
    return { state: `|${binary}⟩`, amplitude: ampStr, magnitude: Number(mag.toFixed(3)) }
  })
}

// ---------------------------------------------------------------------------
// Full circuit simulation
// ---------------------------------------------------------------------------

/**
 * Runs a full N-qubit circuit simulation using statevector evolution.
 * Gates are applied in ascending step (column) order.
 *
 * Returns measurement probabilities, statevector amplitudes, execution time,
 * and a heuristic entanglement flag.
 *
 * This is the canonical client-side simulation. See `lib/quantum-simulator.ts`
 * for the re-export that backward-compatible callers use.
 */
export function runCircuit(qubitCount: number, gates: PlacedGate[]): SimulationResult {
  const startTime = performance.now()
  const dim = 1 << qubitCount

  // Initialise to |0…0⟩ = [1, 0, 0, … 0]
  let state: Complex[] = Array.from({ length: dim }, (_, idx) =>
    idx === 0 ? { r: 1, i: 0 } : { r: 0, i: 0 }
  )

  let hasCnot = false

  // Sort gates by step column first, then by qubit index for determinism
  const sortedGates = [...gates].sort((a, b) => a.step - b.step || a.targetQubit - b.targetQubit)

  for (const gate of sortedGates) {
    if (gate.type === 'M') continue // Measurement marker — no amplitude effect

    if (gate.type === 'CNOT') {
      hasCnot = true
      const control = gate.controlQubit ?? 0
      const target  = gate.targetQubit
      if (control === target || control >= qubitCount || target >= qubitCount) continue
      state = applyCNOT(state, control, target)

    } else if (gate.type === 'SWAP') {
      const qubitA = gate.controlQubit ?? 0
      const qubitB = gate.targetQubit
      if (qubitA === qubitB || qubitA >= qubitCount || qubitB >= qubitCount) continue
      state = applySWAP(state, qubitA, qubitB)

    } else {
      const U = GATE_MATRICES[gate.type as GateType]
      if (!U || gate.targetQubit >= qubitCount) continue
      state = applySingleQubitGate(state, gate.targetQubit, U)
    }
  }

  const basisStates = computeProbabilities(state, qubitCount)
  const stateVector = formatStateVector(state, qubitCount)

  // Entanglement heuristic: a CNOT was used AND at least two basis states
  // each carry more than 30% probability (i.e. we're in a superposition of
  // entangled states, not just a product state with one dominant outcome).
  const nonZero = basisStates.filter((s) => s.probability > 0.01)
  const isEntangled =
    hasCnot && nonZero.length > 1 && nonZero.every((s) => s.probability > 0.3)

  return {
    qubitCount,
    basisStates,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
    isEntangled,
    stateVector,
  }
}
