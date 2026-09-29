import React from 'react'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE, LEARNING_GRADIENT_BUTTON_STYLE } from '@/lib/learning/styles'

export function LearningProgressCard({
  percent,
  timeSpentSeconds,
  continueHref,
  continueLabel,
}: {
  percent: number
  timeSpentSeconds: number
  continueHref: string
  continueLabel: string
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  const minutes = Math.floor(timeSpentSeconds / 60)

  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-base font-bold text-white">Beginner journey progress</h3>
        <span className="font-heading text-lg font-bold text-white">{clamped}%</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--q-muted)] mb-3">
        <Clock className="h-3 w-3" />
        <span>Time spent: {minutes} min</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, var(--q-cyan), var(--q-violet))',
          }}
        />
      </div>
      <Link
        href={continueHref}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 shadow-xl shadow-cyan-500/20"
        style={LEARNING_GRADIENT_BUTTON_STYLE}
      >
        {continueLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
