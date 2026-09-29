import React from 'react'
import Link from 'next/link'
import { Trophy, ArrowRight, Sparkles } from 'lucide-react'
import { AcademyMission } from '@/lib/academy/academy-types'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE, LEARNING_GRADIENT_BUTTON_STYLE } from '@/lib/learning/styles'

export function MissionSuccessModal({ mission, onNext }: { mission: AcademyMission, onNext: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${LEARNING_CARD_CLASS} w-full max-w-sm relative overflow-hidden`} style={LEARNING_CARD_STYLE}>
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, var(--q-cyan), var(--q-violet))' }} />
        
        <div className="flex flex-col items-center text-center pt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mb-4">
            <Trophy className="h-8 w-8" />
          </div>
          
          <h2 className="font-heading text-xl font-bold text-white mb-2">Mission Accomplished!</h2>
          <p className="text-xs text-[var(--q-muted)] mb-6">You successfully completed {mission.title}</p>
          
          <div className="w-full rounded-2xl bg-white/5 p-4 mb-6 border border-white/10 text-left">
            <div className="flex items-center gap-2 text-[var(--q-cyan)] mb-1">
              <Sparkles className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Concept Mastered</p>
            </div>
            <p className="text-sm text-white font-medium">{mission.learningObjective}</p>
          </div>
          
          <div className="flex w-full gap-3">
            <Link 
              href="/academy" 
              className="flex-1 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-[var(--q-muted)] hover:text-white transition-colors"
            >
              Academy Hub
            </Link>
            <button 
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105"
              style={LEARNING_GRADIENT_BUTTON_STYLE}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
