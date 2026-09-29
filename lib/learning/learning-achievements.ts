import { BeginnerJourneyState } from './learning-state'

export interface LearningAchievement {
  id: string
  title: string
  description: string
  icon: string
  condition: (state: BeginnerJourneyState) => boolean
}

export const BEGINNER_ACHIEVEMENTS: LearningAchievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Began the learning journey.',
    icon: '🚀',
    condition: (state) => Object.keys(state.activities).length > 0,
  },
  {
    id: 'quantum_curious',
    title: 'Quantum Curious',
    description: 'Read the Introduction module.',
    icon: '📖',
    condition: (state) => !!state.activities['intro_completed'],
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Spent over 5 minutes exploring concepts.',
    icon: '🧭',
    condition: (state) => state.timeSpentSeconds >= 300,
  },
  {
    id: 'probability_master',
    title: 'Probability Master',
    description: 'Explored the Probability Visualizer.',
    icon: '🎲',
    condition: (state) => !!state.activities['probability_explored'],
  },
  {
    id: 'superposition_pioneer',
    title: 'Superposition Pioneer',
    description: 'Interacted with the Superposition slider.',
    icon: '🌊',
    condition: (state) => !!state.activities['superposition_explored'],
  },
  {
    id: 'quantum_rookie',
    title: 'Quantum Rookie',
    description: 'Completed all interactive playground activities.',
    icon: '🏆',
    condition: (state) =>
      !!state.activities['coin_flip_explored'] &&
      !!state.activities['quantum_bit_explored'] &&
      !!state.activities['probability_explored'] &&
      !!state.activities['superposition_explored'],
  },
]

export function checkAchievements(state: BeginnerJourneyState): string[] {
  const newlyUnlocked: string[] = []
  
  for (const achievement of BEGINNER_ACHIEVEMENTS) {
    if (!state.unlockedAchievements.includes(achievement.id)) {
      if (achievement.condition(state)) {
        newlyUnlocked.push(achievement.id)
      }
    }
  }
  
  return newlyUnlocked
}
