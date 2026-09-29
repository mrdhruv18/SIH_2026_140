import { AcademyMission } from './academy-types'

export interface ValidationResult {
  passed: boolean
  missing?: string
  expectedGate?: string
}

export function validateMission(mission: AcademyMission, placedGates: any[]): ValidationResult {
  // Simple gate-pattern validation based on V1 requirements
  
  const getTypes = () => placedGates.map(g => g.type)
  const types = getTypes()

  switch(mission.id) {
    case 'T-01':
      if (!types.includes('X')) return { passed: false, missing: 'Missing Pauli-X gate.', expectedGate: 'X' }
      break;
    case 'T-02':
      if (!types.includes('H')) return { passed: false, missing: 'Missing Hadamard gate.', expectedGate: 'H' }
      break;
    case 'T-03':
      // H then Z
      if (!types.includes('H')) return { passed: false, missing: 'Start with a Hadamard gate.', expectedGate: 'H' }
      if (!types.includes('Z')) return { passed: false, missing: 'Add a Pauli-Z gate after the Hadamard.', expectedGate: 'Z' }
      if (types.indexOf('H') > types.indexOf('Z')) return { passed: false, missing: 'Hadamard must come before Z.', expectedGate: 'H' }
      break;
    case 'T-04':
      // X then H
      if (!types.includes('X')) return { passed: false, missing: 'Start with an X gate.', expectedGate: 'X' }
      if (!types.includes('H')) return { passed: false, missing: 'Add an H gate after X.', expectedGate: 'H' }
      if (types.indexOf('X') > types.indexOf('H')) return { passed: false, missing: 'X must come before H.', expectedGate: 'X' }
      break;
    case 'T-05':
      // H then M
      if (!types.includes('H')) return { passed: false, missing: 'Start with a Hadamard gate.', expectedGate: 'H' }
      if (!types.includes('M')) return { passed: false, missing: 'Measure the qubit.', expectedGate: 'M' }
      break;
    case 'T-06':
      // H on q0
      const hGate = placedGates.find(g => g.type === 'H' && g.qubitIndex === 0)
      if (!hGate) return { passed: false, missing: 'Place a Hadamard gate on Qubit 0.', expectedGate: 'H' }
      break;
    case 'T-07':
      // H then CNOT
      if (!types.includes('H')) return { passed: false, missing: 'Start with a Hadamard gate on Qubit 0.', expectedGate: 'H' }
      if (!types.includes('CNOT')) return { passed: false, missing: 'Add a CNOT gate to entangle.', expectedGate: 'CNOT' }
      break;
    case 'T-08':
      // H + CNOT + Measurement
      if (!types.includes('H') || !types.includes('CNOT')) return { passed: false, missing: 'Create the Bell state first (H + CNOT).', expectedGate: 'CNOT' }
      const measures = placedGates.filter(g => g.type === 'M')
      if (measures.length < 2) return { passed: false, missing: 'Measure both qubits to prove entanglement.', expectedGate: 'M' }
      break;
    default:
      return { passed: true }
  }
  
  return { passed: true }
}
