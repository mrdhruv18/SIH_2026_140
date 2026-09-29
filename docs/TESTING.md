# QUANTIFY — Testing Guide

## What Is Tested

| Area | Test file | Notes |
|------|-----------|-------|
| Statevector engine | `tests/statevector.test.ts` | Pure function tests, no mocks |
| Bit-order convention | `tests/statevector.test.ts` | LSB contract tests (§3.3 reference) |
| SWAP equivalence | `tests/statevector.test.ts` | Old loop vs new implementation |
| Gate normalisation | `tests/statevector.test.ts` | Probabilities sum to 1 |

## What Is Not Yet Tested

| Area | Reason | Priority |
|------|--------|----------|
| Grading logic (`submit-assessment`) | Runs in Deno Edge Function, needs extraction to pure functions | High |
| Learning path assignment | Same as above | High |
| `parseQiskitOrQasmToCircuit` | Parser function — pure, could be unit-tested | Medium |
| Auth flow | Requires Supabase test project | Low for demo |

## How to Run

```bash
# Run all tests once
npm test

# Run in watch mode (re-runs on file save)
npm run test:watch
```

## Expected Output (all passing)

```
✓ tests/statevector.test.ts (15 tests)
  ✓ Identity (no gates) > 1 qubit: |0⟩ stays at probability 1
  ✓ Pauli-X (NOT) > flips |0⟩ to |1⟩ on q0
  ✓ Hadamard > creates 50/50 superposition from |0⟩
  ✓ Hadamard > H · H = identity (|0⟩ restored)
  ✓ Pauli-Z > has no visible effect on |0⟩
  ✓ Pauli-Z > negates amplitude of |1⟩ but probability stays 1
  ✓ Bell state > produces 50% |00⟩ and 50% |11⟩, isEntangled = true
  ✓ CNOT no-op > leaves state unchanged when control qubit is |0⟩
  ✓ SWAP gate > moves amplitude from q0 to q1
  ✓ SWAP gate > equivalence: new matches reference for all basis states
  ✓ Invalid inputs > CNOT with control === target is skipped
  ✓ Invalid inputs > Qubit index out of range is skipped
  ✓ Invalid inputs > Measurement gate has no amplitude effect
  ✓ Normalisation > Bell state
  ✓ Normalisation > 3-qubit mixed circuit
  ✓ Bit-order convention > X on q0 → |01⟩ at index 1
  ✓ Bit-order convention > X on q1 → |10⟩ at index 2
```
