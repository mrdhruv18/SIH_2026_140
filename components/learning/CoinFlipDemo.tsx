'use client'

import React, { useState } from 'react'
import { Coins, RotateCcw } from 'lucide-react'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function CoinFlipDemo({ onInteract }: { onInteract?: () => void }) {
  const [face, setFace] = useState<'Heads' | 'Tails' | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [heads, setHeads] = useState(0)
  const [tails, setTails] = useState(0)

  const total = heads + tails
  const headsPct = total === 0 ? 50 : Math.round((heads / total) * 100)
  const tailsPct = total === 0 ? 50 : 100 - headsPct

  const flip = () => {
    if (spinning) return
    setSpinning(true)
    onInteract?.()
    window.setTimeout(() => {
      const next: 'Heads' | 'Tails' = Math.random() < 0.5 ? 'Heads' : 'Tails'
      setFace(next)
      if (next === 'Heads') setHeads((n) => n + 1)
      else setTails((n) => n + 1)
      setSpinning(false)
    }, 450)
  }

  const reset = () => {
    setFace(null)
    setHeads(0)
    setTails(0)
    setSpinning(false)
  }

  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-[var(--q-cyan)]" />
          <h3 className="font-heading text-base font-bold text-white">Coin flip</h3>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg p-1.5 text-[var(--q-muted)] hover:text-white hover:bg-white/5"
          aria-label="Reset coin flip"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-[var(--q-muted)] leading-relaxed mb-4">
        A fair coin is not decided in advance. Each flip lands one of two ways. After many flips, the two sides even out.
      </p>

      <div className="flex flex-col items-center gap-4">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full border text-lg font-heading font-bold ${spinning ? 'animate-pulse' : ''}`}
          style={{
            borderColor: 'color-mix(in oklch, var(--q-cyan) 40%, transparent)',
            background: 'color-mix(in oklch, var(--q-cyan) 10%, transparent)',
            color: 'var(--q-cyan)',
          }}
        >
          {spinning ? '…' : face ?? '?'}
        </div>
        <button
          type="button"
          onClick={flip}
          disabled={spinning}
          className="rounded-2xl border px-5 py-2 text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-60"
          style={{ borderColor: 'var(--q-line)' }}
        >
          Flip the coin
        </button>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-[10px] font-semibold text-[var(--q-muted)]">
          <span>Heads {heads}</span>
          <span>Tails {tails}</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-[var(--q-cyan)]" style={{ width: `${headsPct}%` }} />
          <div className="h-full bg-[var(--q-violet)]" style={{ width: `${tailsPct}%` }} />
        </div>
        <p className="text-[10px] text-[var(--q-muted)]">Total flips: {total}</p>
      </div>
    </div>
  )
}
