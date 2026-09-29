'use client'

import React from 'react'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function SuperpositionVisualizer({ chanceOfOne }: { chanceOfOne: number }) {
  const offOpacity = 0.25 + (1 - chanceOfOne) * 0.75
  const onOpacity = 0.25 + chanceOfOne * 0.75

  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <h3 className="font-heading text-base font-bold text-white">The mix, made visible</h3>
      <p className="mt-1 mb-5 text-xs text-[var(--q-muted)] leading-relaxed">
        Drag the slider on the playground. Brighter means that option is more likely when you look.
      </p>
      <div className="relative mx-auto h-40 w-full max-w-sm">
        <div
          className="absolute left-1/4 top-6 flex h-28 w-28 -translate-x-1/2 items-center justify-center rounded-full border text-2xl font-heading font-bold q-float"
          style={{
            opacity: offOpacity,
            borderColor: 'color-mix(in oklch, var(--q-cyan) 50%, transparent)',
            background: 'color-mix(in oklch, var(--q-cyan) 18%, transparent)',
            color: 'var(--q-cyan)',
          }}
        >
          0
        </div>
        <div
          className="absolute right-1/4 top-6 flex h-28 w-28 translate-x-1/2 items-center justify-center rounded-full border text-2xl font-heading font-bold"
          style={{
            opacity: onOpacity,
            borderColor: 'color-mix(in oklch, var(--q-violet) 50%, transparent)',
            background: 'color-mix(in oklch, var(--q-violet) 18%, transparent)',
            color: 'var(--q-violet)',
            animation: 'q-float 6s ease-in-out infinite reverse',
          }}
        >
          1
        </div>
      </div>
    </div>
  )
}
