import React from 'react'
import { AcademyState } from '@/lib/academy/academy-types'
import { getAcademyCompletionPercent } from '@/lib/academy/academy-progress'

export function MissionProgress({ state }: { state: AcademyState }) {
  const percent = getAcademyCompletionPercent(state)
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 mt-2">
      <div
        className="h-full transition-all duration-500"
        style={{
          width: `${percent}%`,
          background: 'linear-gradient(90deg, var(--q-cyan), var(--q-violet))',
        }}
      />
    </div>
  )
}
