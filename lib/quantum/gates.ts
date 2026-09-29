// ==============================================================================
// QUANTIFY — lib/quantum/gates.ts
// ==============================================================================
// 2×2 unitary gate matrices for single-qubit gates.
//
// WHY: Isolating the gate definitions from the application loop lets us
// add new gates (Rx, Ry, Rz, Toffoli) in one place without touching the
// statevector evolution code. It also makes the matrices easy to unit-test.
//
// CONVENTION: Every matrix U must satisfy U†U = I (unitarity).
// ==============================================================================

import type { Complex } from './complex'

/** A 2×2 unitary gate matrix [[u00, u01], [u10, u11]] */
export type GateMatrix = [[Complex, Complex], [Complex, Complex]]

const r = (re: number, im = 0): Complex => ({ r: re, i: im })
const INV_SQRT2 = 1 / Math.SQRT2
// T gate phase: e^(iπ/4) = cos(π/4) + i·sin(π/4) = 1/√2 + i/√2
const T_PHASE: Complex = { r: Math.SQRT1_2, i: Math.SQRT1_2 }

/**
 * Named 2×2 unitary matrices for the supported single-qubit gate set.
 * Keys must match GateType values from types/quantify.ts.
 */
export const GATE_MATRICES: Record<string, GateMatrix> = {
  /** Pauli-X (NOT): flips |0⟩ ↔ |1⟩ */
  X: [
    [r(0), r(1)],
    [r(1), r(0)],
  ],
  /** Pauli-Y: combines bit-flip and phase-flip */
  Y: [
    [r(0),    r(0, -1)],
    [r(0, 1), r(0)    ],
  ],
  /** Pauli-Z: phase-flip only; leaves |0⟩ unchanged, negates |1⟩ */
  Z: [
    [r(1), r(0) ],
    [r(0), r(-1)],
  ],
  /** Hadamard: maps |0⟩ → |+⟩ and |1⟩ → |−⟩ (equal superposition) */
  H: [
    [r(INV_SQRT2),  r(INV_SQRT2)],
    [r(INV_SQRT2),  r(-INV_SQRT2)],
  ],
  /** Phase (S): applies a π/2 phase to |1⟩; S = √Z */
  S: [
    [r(1), r(0)   ],
    [r(0), r(0, 1)],
  ],
  /** T gate: applies a π/4 phase to |1⟩; T = √S = Z^(1/4) */
  T: [
    [r(1), r(0)  ],
    [r(0), T_PHASE],
  ],
}
