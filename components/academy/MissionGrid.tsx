import React from 'react'
import { AcademyMission, AcademyState } from '@/lib/academy/academy-types'
import { isMissionUnlocked } from '@/lib/academy/academy-progress'
import { MissionCard } from './MissionCard'

export function MissionGrid({ missions, state }: { missions: AcademyMission[], state: AcademyState }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {missions.map(mission => (
        <MissionCard 
          key={mission.id} 
          mission={mission} 
          unlocked={isMissionUnlocked(mission.id, state)} 
          completed={state.completedMissions.includes(mission.id)} 
        />
      ))}
    </div>
  )
}
