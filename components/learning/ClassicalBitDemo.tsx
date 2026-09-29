'use client'

import React, { useState } from 'react'
import { ToggleLeft } from 'lucide-react'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function ClassicalBitDemo({ onInteract }: { onInteract?: () => void }) {
  const [isOn, setIsOn] = useState(false)

  const toggle = () => {
    onInteract?.()
    setIsOn((v) => !v)
  }

  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <div className="flex items-center gap-2 mb-3">
        <ToggleLeft className="h-4 w-4 text-[var(--q-cyan)]" />
        <h3 className="font-heading text-base font-bold text-white">Everyday bit</h3>
      </div>
      <p className="text-xs text-[var(--q-muted)] leading-relaxed mb-4">
        Today&apos;s computers store information as tiny switches. Each switch is either off or on. Never both. Never in between.
      </p>

      <button
        type="button"
        onClick={toggle}
        className="w-full rounded-2xl border p-5 text-left hover:bg-white/5"
        style={{ borderColor: 'var(--q-line)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--q-muted)]">Current value</p>
        <p className="font-heading mt-1 text-3xl font-bold text-white">{isOn ? '1  ·  On' : '0  ·  Off'}</p>
        <p className="mt-2 text-xs text-[var(--q-cyan)]">Tap to flip the switch</p>
      </button>
    </div>
  )
}
