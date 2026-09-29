export type AcademyDifficulty = 'Tutorial' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export interface AcademyMission {
  id: string
  title: string
  description: string
  difficulty: AcademyDifficulty
  prerequisiteId: string | null
  initialQubits: number
  maxSteps: number
  allowedGates: string[] | 'all'
  learningObjective: string
  estimatedMinutes: number
}

export interface AcademyState {
  startedMissions: string[]
  completedMissions: string[]
  currentLevel: AcademyDifficulty
  timeSpentSeconds: number
}

export interface AcademyStorageProvider {
  getState(): Promise<AcademyState>
  saveState(state: AcademyState): Promise<void>
}
