import React from 'react'
import { ACADEMY_MISSIONS } from '@/lib/academy/academy-content'
import { AcademyState } from '@/lib/academy/academy-types'
import { MissionGrid } from './MissionGrid'

export function MissionPath({ state }: { state: AcademyState }) {
  // Only displaying Tutorial missions for now as defined
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-white">Tutorial Missions</h2>
      <MissionGrid missions={ACADEMY_MISSIONS.filter(m => m.difficulty === 'Tutorial')} state={state} />
    </div>
  )
}
