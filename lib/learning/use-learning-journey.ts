'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BeginnerJourneyState,
  LocalStorageProvider,
  defaultBeginnerState,
} from './learning-state'
import { checkAchievements } from './learning-achievements'

export function useLearningJourney() {
  const [state, setState] = useState<BeginnerJourneyState>(defaultBeginnerState())
  const [ready, setReady] = useState(false)
  const [sessionStartTime] = useState(Date.now())

  useEffect(() => {
    LocalStorageProvider.getState().then((s) => {
      setState(s)
      setReady(true)
    })
  }, [])

  // Periodically update time spent
  useEffect(() => {
    if (!ready) return
    const interval = setInterval(() => {
      setState((prev) => {
        const addedTime = Math.floor((Date.now() - sessionStartTime) / 1000)
        return {
          ...prev,
          timeSpentSeconds: prev.timeSpentSeconds + 10,
          lastActiveAt: Date.now(),
        }
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [ready, sessionStartTime])

  const markActivity = useCallback((activityId: string) => {
    setState((prev) => {
      if (prev.activities[activityId]) return prev

      const next = {
        ...prev,
        activities: {
          ...prev.activities,
          [activityId]: true,
        },
      }
      
      const newlyUnlocked = checkAchievements(next)
      if (newlyUnlocked.length > 0) {
        next.unlockedAchievements = [...next.unlockedAchievements, ...newlyUnlocked]
        // Could dispatch a toast event here
      }
      
      LocalStorageProvider.saveState(next)
      return next
    })
  }, [])

  return {
    state,
    ready,
    markActivity,
  }
}
