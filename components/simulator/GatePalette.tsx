'use client'

// ==============================================================================
// QUANTIFY — components/simulator/GatePalette.tsx
// ==============================================================================
// Left sidebar: the clickable gate tile grid and qubit-count stepper.
// Receives selected gate type and qubit count from the parent page and
// calls callbacks on change — no internal state, fully controlled.
// ==============================================================================

import React from 'react'
import { Minus, Plus } from 'lucide-react'
import { GATE_PALETTE } from '@/lib/api/circuits'
import { GateTooltip } from './GateTooltip'

interface GatePaletteProps {
  selectedGateType: string
  onSelectGate: (type: string) => void
  qubitsCount: number
  onSetQubitsCount: (count: number) => void
  allowedGates?: string[] | 'all'
}

export const GatePalette = React.memo(function GatePalette({
  selectedGateType,
  onSelectGate,
  qubitsCount,
  onSetQubitsCount,
  allowedGates = 'all',
}: GatePaletteProps) {
  return (
    <div
      className="lg:col-span-2 rounded-3xl border p-4 backdrop-blur-xl space-y-4"
      style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}
    >
      <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--q-muted)]">
        Quantum Gate Palette
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {GATE_PALETTE.map((g) => {
          const isAllowed = allowedGates === 'all' || allowedGates.includes(g.type)
          return (
            <GateTooltip key={g.type} caption={g.description}>
              <button
                onClick={() => isAllowed && onSelectGate(g.type)}
                disabled={!isAllowed}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                  !isAllowed
                    ? 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed'
                    : selectedGateType === g.type
                      ? 'border-white text-white font-bold shadow-lg scale-105'
                      : 'border-white/10 bg-white/5 text-[var(--q-muted)] hover:border-white/20 hover:text-white'
                }`}
                style={selectedGateType === g.type && isAllowed ? { background: g.color } : {}}
              >
                <span className="font-mono text-sm font-bold">{g.symbol}</span>
                <span className="text-[10px] mt-0.5">{g.name}</span>
              </button>
            </GateTooltip>
          )
        })}
      </div>

      {/* Qubit Count Stepper */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <span className="text-xs text-[var(--q-muted)] block">Qubit Registers:</span>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 p-1.5 bg-black/30">
          <button
            onClick={() => onSetQubitsCount(Math.max(1, qubitsCount - 1))}
            disabled={qubitsCount <= 1}
            className="p-1 text-[var(--q-muted)] hover:text-white disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="font-heading font-bold text-white text-xs">{qubitsCount} Qubits</span>
          <button
            onClick={() => onSetQubitsCount(Math.min(5, qubitsCount + 1))}
            disabled={qubitsCount >= 5}
            className="p-1 text-[var(--q-muted)] hover:text-white disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
})
