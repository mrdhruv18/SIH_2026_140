import { AcademyState, AcademyStorageProvider } from './academy-types'
import { ACADEMY_MISSIONS } from './academy-content'

const STORAGE_KEY = 'quantify_academy_progress_v1'

export const defaultAcademyState = (): AcademyState => ({
  startedMissions: [],
  completedMissions: [],
  currentLevel: 'Tutorial',
  timeSpentSeconds: 0,
})

export const LocalAcademyStorage: AcademyStorageProvider = {
  async getState() {
    if (typeof window === 'undefined') return defaultAcademyState()
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultAcademyState()
      return { ...defaultAcademyState(), ...JSON.parse(raw) }
    } catch {
      return defaultAcademyState()
    }
  },
  async saveState(state: AcademyState) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

export function getAcademyCompletionPercent(state: AcademyState): number {
  if (ACADEMY_MISSIONS.length === 0) return 0
  return Math.round((state.completedMissions.length / ACADEMY_MISSIONS.length) * 100)
}

export function isMissionUnlocked(missionId: string, state: AcademyState): boolean {
  const mission = ACADEMY_MISSIONS.find((m) => m.id === missionId)
  if (!mission) return false
  if (!mission.prerequisiteId) return true
  return state.completedMissions.includes(mission.prerequisiteId)
}
