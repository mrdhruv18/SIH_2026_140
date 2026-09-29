import React from 'react'
import Link from 'next/link'
import { CheckCircle2, Lock, PlayCircle, Clock } from 'lucide-react'
import { AcademyMission } from '@/lib/academy/academy-types'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE, LEARNING_GRADIENT_BUTTON_STYLE } from '@/lib/learning/styles'

export function MissionCard({ mission, unlocked, completed }: { mission: AcademyMission, unlocked: boolean, completed: boolean }) {
  return (
    <div className={`${LEARNING_CARD_CLASS} flex flex-col`} style={{...LEARNING_CARD_STYLE, opacity: unlocked ? 1 : 0.6}}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--q-cyan)]">{mission.id} · {mission.difficulty}</span>
        {completed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : !unlocked ? <Lock className="h-4 w-4 text-slate-500" /> : <PlayCircle className="h-4 w-4 text-[var(--q-cyan)]" />}
      </div>
      <h3 className="font-heading text-base font-bold text-white mb-2">{mission.title}</h3>
      <p className="text-xs text-[var(--q-muted)] leading-relaxed mb-4 flex-grow">{mission.description}</p>
      
      <div className="flex items-center gap-2 text-[10px] text-[var(--q-muted)] mb-4">
        <Clock className="h-3 w-3" />
        <span>{mission.estimatedMinutes} min</span>
      </div>
      
      {unlocked ? (
        <Link href={`/simulator?mission=${mission.id}`} className="mt-auto inline-flex justify-center items-center gap-2 rounded-xl py-2 text-xs font-bold text-black" style={LEARNING_GRADIENT_BUTTON_STYLE}>
          Start Mission
        </Link>
      ) : (
        <button disabled className="mt-auto w-full rounded-xl py-2 text-xs font-bold bg-white/5 text-white/40 cursor-not-allowed">
          Locked
        </button>
      )}
    </div>
  )
}
