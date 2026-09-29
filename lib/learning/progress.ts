export type LearningStageId = 'intro' | 'classical-quantum' | 'playground' | 'qubits'

export type LearningStageStatus = 'completed' | 'available' | 'locked'

export interface LearningProgress {
  introStarted: boolean
  introCompleted: boolean
  playgroundVisited: boolean
  playgroundExplored: boolean
}

export interface LearningStage {
  id: LearningStageId
  stageLabel: string
  title: string
  description: string
  href: string | null
  comingSoon?: boolean
}

export const LEARNING_STORAGE_KEY = 'quantify_beginner_journey_v1'

export const DEFAULT_LEARNING_PROGRESS: LearningProgress = {
  introStarted: false,
  introCompleted: false,
  playgroundVisited: false,
  playgroundExplored: false,
}

export const LEARNING_STAGES: LearningStage[] = [
  {
    id: 'intro',
    stageLabel: 'Stage 0',
    title: 'Introduction',
    description: 'What this new kind of computing is, and why people care.',
    href: '/learn/intro',
  },
  {
    id: 'classical-quantum',
    stageLabel: 'Stage 1',
    title: 'Classical vs Quantum',
    description: 'See how everyday on/off switches differ from a quantum switch.',
    href: '/learn/playground',
  },
  {
    id: 'playground',
    stageLabel: 'Stage 2',
    title: 'Interactive Playground',
    description: 'Flip coins, toggle bits, and watch chance in motion.',
    href: '/learn/playground',
  },
  {
    id: 'qubits',
    stageLabel: 'Stage 3',
    title: 'Qubit Fundamentals',
    description: 'The next chapter of the journey. Opening soon.',
    href: null,
    comingSoon: true,
  },
]

export function readLearningProgress(): LearningProgress {
  if (typeof window === 'undefined') return { ...DEFAULT_LEARNING_PROGRESS }
  try {
    const raw = localStorage.getItem(LEARNING_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_LEARNING_PROGRESS }
    const parsed = JSON.parse(raw) as Partial<LearningProgress>
    return { ...DEFAULT_LEARNING_PROGRESS, ...parsed }
  } catch {
    return { ...DEFAULT_LEARNING_PROGRESS }
  }
}

export function writeLearningProgress(next: LearningProgress): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(next))
}

export function mergeLearningProgress(patch: Partial<LearningProgress>): LearningProgress {
  const merged = { ...readLearningProgress(), ...patch }
  writeLearningProgress(merged)
  return merged
}

export function getStageStatus(stage: LearningStage, progress: LearningProgress): LearningStageStatus {
  if (stage.id === 'intro') {
    return progress.introCompleted ? 'completed' : 'available'
  }
  if (stage.id === 'classical-quantum' || stage.id === 'playground') {
    if (!progress.introCompleted) return 'locked'
    if (progress.playgroundExplored) return 'completed'
    if (progress.playgroundVisited) return 'available'
    return 'available'
  }
  return 'locked'
}

export function getLearningPercent(progress: LearningProgress): number {
  let score = 0
  if (progress.introStarted) score += 10
  if (progress.introCompleted) score += 40
  if (progress.playgroundVisited) score += 20
  if (progress.playgroundExplored) score += 30
  return score
}

export function getContinueHref(progress: LearningProgress): string {
  if (!progress.introCompleted) return '/learn/intro'
  return '/learn/playground'
}

export function getContinueLabel(progress: LearningProgress): string {
  if (!progress.introStarted && !progress.introCompleted) return 'Start Learning'
  if (progress.introCompleted && progress.playgroundExplored) return 'Review Playground'
  return 'Continue Learning'
}
