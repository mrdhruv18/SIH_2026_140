import React, { useState } from 'react'
import { Check, X, ChevronRight, HelpCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { AcademyMission } from '@/lib/academy/academy-types'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE, LEARNING_GRADIENT_BUTTON_STYLE } from '@/lib/learning/styles'

interface MissionOverlayProps {
  mission: AcademyMission
  onSubmit: () => void
  errorFeedback?: { missing: string, expectedGate: string } | null
}

export function MissionOverlay({ mission, onSubmit, errorFeedback }: MissionOverlayProps) {
  const [showHint, setShowHint] = useState(false)

  return (
    <div className={`${LEARNING_CARD_CLASS} absolute top-4 right-4 z-50 w-80 shadow-2xl`} style={LEARNING_CARD_STYLE}>
      <div className="flex items-center justify-between border-b pb-3 mb-3" style={{ borderColor: 'var(--q-line)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--q-cyan)]" />
          <h2 className="font-heading text-sm font-bold text-white">Active Mission</h2>
        </div>
        <span className="text-[10px] uppercase font-bold text-[var(--q-cyan)]">{mission.id}</span>
      </div>
      
      <h3 className="font-heading text-base font-bold text-white mb-2">{mission.title}</h3>
      <p className="text-xs text-[var(--q-muted)] mb-4 leading-relaxed">{mission.description}</p>
      
      <div className="rounded-xl bg-white/5 p-3 mb-4 border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--q-violet)] mb-1">Objective</p>
        <p className="text-xs text-white">{mission.learningObjective}</p>
      </div>

      {errorFeedback && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 mb-4">
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-xs font-bold">Validation Failed</p>
          </div>
          <p className="text-xs text-red-200">{errorFeedback.missing}</p>
        </div>
      )}

      {showHint && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 mb-4">
          <p className="text-xs text-amber-200">Hint: Try looking at the available gates in your palette. You need to use the right combination to reach the target state.</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button 
          onClick={() => setShowHint(true)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-[var(--q-muted)] hover:text-white"
        >
          <HelpCircle className="h-4 w-4" /> Hint
        </button>
        <button 
          onClick={onSubmit}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105"
          style={LEARNING_GRADIENT_BUTTON_STYLE}
        >
          <Check className="h-4 w-4" /> Submit
        </button>
      </div>
    </div>
  )
}
