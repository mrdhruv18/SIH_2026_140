import React from 'react'
import { AcademyState } from '@/lib/academy/academy-types'
import { getAcademyCompletionPercent } from '@/lib/academy/academy-progress'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function AcademyStats({ state }: { state: AcademyState }) {
  const percent = getAcademyCompletionPercent(state)
  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <h3 className="font-heading text-lg font-bold text-white mb-4">Academy Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-[var(--q-cyan)]">Completion</p>
          <p className="text-2xl font-bold text-white">{percent}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[var(--q-violet)]">Completed</p>
          <p className="text-2xl font-bold text-white">{state.completedMissions.length}</p>
        </div>
      </div>
    </div>
  )
}
