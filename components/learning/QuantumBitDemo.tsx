'use client'

import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function QuantumBitDemo({
  chanceOfOne,
  onLook,
}: {
  chanceOfOne: number
  onLook?: (result: 0 | 1) => void
}) {
  const [result, setResult] = useState<0 | 1 | null>(null)

  const look = () => {
    const next: 0 | 1 = Math.random() < chanceOfOne ? 1 : 0
    setResult(next)
    onLook?.(next)
  }

  const reset = () => setResult(null)

  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[var(--q-violet)]" />
        <h3 className="font-heading text-base font-bold text-white">Quantum switch</h3>
      </div>
      <p className="text-xs text-[var(--q-muted)] leading-relaxed mb-4">
        A quantum switch can hold a mix of off and on at the same time. When you look, nature picks one answer. After you look, it behaves like an ordinary switch again.
      </p>

      {result === null ? (
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--q-line)', background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--q-cyan)]">Before you look</p>
          <p className="font-heading mt-1 text-xl font-bold text-white">A blend of 0 and 1</p>
          <p className="mt-1 text-xs text-[var(--q-muted)]">
            Chance of 1: {Math.round(chanceOfOne * 100)}% · Chance of 0: {Math.round((1 - chanceOfOne) * 100)}%
          </p>
          <button
            type="button"
            onClick={look}
            className="mt-4 rounded-2xl px-5 py-2.5 text-xs font-bold text-black"
            style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}
          >
            Look now
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--q-line)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">After you look</p>
          <p className="font-heading mt-1 text-3xl font-bold text-white">{result}  ·  {result === 1 ? 'On' : 'Off'}</p>
          <p className="mt-2 text-xs text-[var(--q-muted)]">The mix is gone. You now have a definite answer.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-2xl border px-5 py-2 text-xs font-semibold text-white hover:bg-white/5"
            style={{ borderColor: 'var(--q-line)' }}
          >
            Mix it again
          </button>
        </div>
      )}
    </div>
  )
}
