import { BeginnerJourneyState } from './learning-state'

export interface LearningMilestone {
  id: string
  title: string
  description: string
  condition: (state: BeginnerJourneyState) => boolean
}

export const BEGINNER_MILESTONES: LearningMilestone[] = [
  {
    id: 'm1_intro',
    title: 'Completed Introduction',
    description: 'Learned the basic concepts and why quantum matters.',
    condition: (state) => !!state.activities['intro_completed'],
  },
  {
    id: 'm2_classical',
    title: 'Completed Classical vs Quantum',
    description: 'Explored the difference between bits and qubits.',
    condition: (state) => !!state.activities['coin_flip_explored'],
  },
  {
    id: 'm3_playground',
    title: 'Completed Playground',
    description: 'Interacted with superposition and probability.',
    condition: (state) =>
      !!state.activities['superposition_explored'] && !!state.activities['probability_explored'],
  },
  {
    id: 'm4_simulation_concept',
    title: 'Completed First Simulation Concept',
    description: 'Watched a quantum state collapse.',
    condition: (state) => !!state.activities['quantum_bit_explored'],
  },
  {
    id: 'm5_journey',
    title: 'Completed Beginner Journey',
    description: 'Finished all beginner modules.',
    condition: (state) =>
      !!state.activities['intro_completed'] &&
      !!state.activities['coin_flip_explored'] &&
      !!state.activities['quantum_bit_explored'] &&
      !!state.activities['superposition_explored'] &&
      !!state.activities['probability_explored'],
  },
]

export function calculateOverallProgress(state: BeginnerJourneyState): number {
  let score = 0
  const maxScore = 100
  
  if (state.activities['intro_started']) score += 10
  if (state.activities['intro_completed']) score += 30
  if (state.activities['coin_flip_explored']) score += 15
  if (state.activities['superposition_explored']) score += 15
  if (state.activities['quantum_bit_explored']) score += 15
  if (state.activities['probability_explored']) score += 15
  
  return Math.min(score, maxScore)
}

export function determineNextStep(state: BeginnerJourneyState): { title: string; href: string } {
  if (!state.activities['intro_completed']) {
    return { title: 'Finish Introduction', href: '/learn/intro' }
  }
  if (
    !state.activities['coin_flip_explored'] ||
    !state.activities['superposition_explored'] ||
    !state.activities['quantum_bit_explored'] ||
    !state.activities['probability_explored']
  ) {
    return { title: 'Complete Playground', href: '/learn/playground' }
  }
  return { title: 'Proceed to Topics', href: '/dashboard' } // Future integration
}
