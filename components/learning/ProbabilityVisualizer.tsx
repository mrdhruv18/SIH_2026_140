'use client'

import React from 'react'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function ProbabilityVisualizer({
  chanceOfOne,
  lookHistory,
}: {
  chanceOfOne: number
  lookHistory: Array<0 | 1>
}) {
  const zeros = lookHistory.filter((v) => v === 0).length
  const ones = lookHistory.filter((v) => v === 1).length
  const total = lookHistory.length
  const expectedOne = Math.round(chanceOfOne * 100)
  const observedOne = total === 0 ? 0 : Math.round((ones / total) * 100)

  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <h3 className="font-heading text-base font-bold text-white">Chance vs. what you saw</h3>
      <p className="mt-1 mb-4 text-xs text-[var(--q-muted)] leading-relaxed">
        The left bars are the mix you set. The right bars are real looks. They get closer after many tries.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--q-muted)] mb-2">Expected</p>
          <Bar label="0" value={100 - expectedOne} color="var(--q-cyan)" />
          <Bar label="1" value={expectedOne} color="var(--q-violet)" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--q-muted)] mb-2">
            Observed · {total} look{total === 1 ? '' : 's'}
          </p>
          <Bar label="0" value={total === 0 ? 0 : 100 - observedOne} color="var(--q-cyan)" />
          <Bar label="1" value={observedOne} color="var(--q-violet)" />
        </div>
      </div>
      <p className="mt-3 text-[10px] text-[var(--q-muted)]">
        Recorded answers: {zeros} off · {ones} on
      </p>
    </div>
  )
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-[10px] font-semibold text-[var(--q-muted)]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}
