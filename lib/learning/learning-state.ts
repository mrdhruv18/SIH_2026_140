export interface BeginnerJourneyState {
  activities: Record<string, boolean>
  timeSpentSeconds: number
  unlockedAchievements: string[]
  lastActiveAt: number
}

export interface BeginnerStorageProvider {
  getState(): Promise<BeginnerJourneyState>
  saveState(state: BeginnerJourneyState): Promise<void>
}

const STORAGE_KEY = 'quantify_beginner_journey_state_v2'

export function defaultBeginnerState(): BeginnerJourneyState {
  return {
    activities: {},
    timeSpentSeconds: 0,
    unlockedAchievements: [],
    lastActiveAt: Date.now(),
  }
}

export const LocalStorageProvider: BeginnerStorageProvider = {
  async getState() {
    if (typeof window === 'undefined') return defaultBeginnerState()
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultBeginnerState()
      return { ...defaultBeginnerState(), ...JSON.parse(raw) }
    } catch {
      return defaultBeginnerState()
    }
  },
  async saveState(state: BeginnerJourneyState) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error('Failed to save learning state', e)
    }
  },
}

// Future Supabase Provider template (unused currently)
export class SupabaseStorageProvider implements BeginnerStorageProvider {
  async getState(): Promise<BeginnerJourneyState> {
    throw new Error('Not connected to Supabase yet')
  }
  async saveState(state: BeginnerJourneyState): Promise<void> {
    throw new Error('Not connected to Supabase yet')
  }
}
