import React from 'react'
import Link from 'next/link'
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react'
import { BeginnerJourneyState } from '@/lib/learning/learning-state'
import { BEGINNER_MILESTONES } from '@/lib/learning/learning-milestones'

function StageIcon({ completed }: { completed: boolean }) {
  if (completed) return <CheckCircle2 className="h-3.5 w-3.5" />
  return <PlayCircle className="h-3.5 w-3.5" />
}

export function JourneyTimeline({ state }: { state: BeginnerJourneyState }) {
  return (
    <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
      {BEGINNER_MILESTONES.map((milestone) => {
        const completed = milestone.condition(state)
        return (
          <div key={milestone.id} className="relative group">
            <div
              className={`absolute -left-6 sm:-left-8 top-6 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 ${completed ? 'border-[var(--q-cyan)] bg-[var(--q-cyan)]/10 text-[var(--q-cyan)]' : 'border-white/20 bg-white/5 text-white/40'}`}
            >
              <StageIcon completed={completed} />
            </div>
            <div
              className="rounded-3xl border p-5 backdrop-blur-xl"
              style={{
                borderColor: 'var(--q-line)',
                background: 'var(--q-bg-deep)',
              }}
            >
              <h3 className="font-heading mt-1 text-base font-bold text-white">{milestone.title}</h3>
              <p className="mt-1 text-xs text-[var(--q-muted)] leading-relaxed">{milestone.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
