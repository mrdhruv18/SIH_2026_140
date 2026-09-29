import React from 'react'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function AcademyHero() {
  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <h1 className="font-heading text-3xl font-bold text-white mb-2">Simulator Academy</h1>
      <p className="text-sm text-[var(--q-muted)] max-w-2xl">
        Master quantum computing by building circuits. Complete guided missions to learn the simulator mechanics, then tackle open-ended algorithms and challenges.
      </p>
    </div>
  )
}
