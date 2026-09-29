'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_LEARNING_PROGRESS,
  LearningProgress,
  mergeLearningProgress,
  readLearningProgress,
} from '@/lib/learning/progress'

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress>(DEFAULT_LEARNING_PROGRESS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setProgress(readLearningProgress())
    setReady(true)
  }, [])

  const patch = useCallback((update: Partial<LearningProgress>) => {
    setProgress(mergeLearningProgress(update))
  }, [])

  return { progress, ready, patch }
}
