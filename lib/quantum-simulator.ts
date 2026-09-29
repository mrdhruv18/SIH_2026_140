// ==============================================================================
// QUANTIFY — lib/quantum-simulator.ts
// ==============================================================================
// Public re-export shim. Callers (app/simulator/page.tsx, lib/api/circuits.ts,
// tests/) import from this file and nothing breaks when the internal modules
// are reorganised.
//
// Internal implementation is split across three focused modules:
//   lib/quantum/complex.ts   — Complex type and arithmetic
//   lib/quantum/gates.ts     — 2×2 unitary gate matrices
//   lib/quantum/statevector.ts — Gate application and probability extraction
//
// BIT-ORDERING CONVENTION: Qubit 0 = LSB (rightmost) — matches Qiskit's own
// bitstring printing. See lib/quantum/statevector.ts for the full explanation.
// ==============================================================================

// Re-export the primary simulation entry-point under its original name so that
// every existing import continues to work without any changes.
export { runCircuit as simulateQuantumCircuit } from './quantum/statevector'

// Re-export types used by callers that previously imported from here
export type { Complex } from './quantum/complex'
export { GATE_MATRICES } from './quantum/gates'
export {
  applySingleQubitGate,
  applyCNOT,
  applySWAP,
  computeProbabilities,
  formatStateVector,
} from './quantum/statevector'
