import React from 'react'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function QuantumConceptCard({
  icon,
  title,
  body,
  accent = 'cyan',
}: {
  icon: React.ReactNode
  title: string
  body: string
  accent?: 'cyan' | 'violet' | 'amber' | 'emerald'
}) {
  const accentClass =
    accent === 'violet'
      ? 'border-violet-500/30 bg-violet-500/10 text-violet-400'
      : accent === 'amber'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
        : accent === 'emerald'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-cyan-500/30 bg-cyan-500/10 text-[var(--q-cyan)]'

  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border ${accentClass}`}>
        {icon}
      </div>
      <h3 className="font-heading text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[var(--q-muted)] leading-relaxed">{body}</p>
    </div>
  )
}
