'use client'

// ==============================================================================
// QUANTIFY — components/simulator/CircuitCanvas.tsx
// ==============================================================================
// The central wire-grid where gates are placed and removed by clicking.
// Renders qubit wire rows × step columns and highlights the pending control
// qubit (amber pulse) for two-qubit gate placement.
// ==============================================================================

import React from 'react'
import { GATE_PALETTE } from '@/lib/api/circuits'

interface PlacedGate {
  id: string
  type: string
  qubitIndex: number
  stepIndex: number
  controlQubitIndex?: number
  targetQubitIndex?: number
}

interface PendingControl {
  qubitIndex: number
  stepIndex: number
  gateType: string
}

interface CircuitCanvasProps {
  qubitsCount: number
  placedGates: PlacedGate[]
  selectedGateType: string
  pendingControlQubit: PendingControl | null
  onCellClick: (qubitIndex: number, stepIndex: number) => void
}

const STEP_COUNT = 8

export const CircuitCanvas = React.memo(function CircuitCanvas({
  qubitsCount,
  placedGates,
  selectedGateType,
  pendingControlQubit,
  onCellClick,
}: CircuitCanvasProps) {
  return (
    <div
      className="lg:col-span-7 rounded-3xl border p-6 backdrop-blur-xl space-y-6"
      style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}
    >
      <div
        className="flex items-center justify-between border-b pb-3"
        style={{ borderColor: 'var(--q-line)' }}
      >
        <span className="text-xs font-semibold text-white">Circuit Timeline (Wires &amp; Gates)</span>
        <span className="text-[11px] text-cyan-300">Selected: {selectedGateType} Gate</span>
      </div>

      <div className="space-y-6 py-2 overflow-x-auto">
        {Array.from({ length: qubitsCount }).map((_, qubitIdx) => (
          <div key={qubitIdx} className="flex items-center gap-4 min-w-[500px]">
            {/* Qubit label */}
            <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-mono text-xs font-bold text-cyan-300">
              |q{qubitIdx}⟩
            </div>

            {/* Wire + step slots */}
            <div className="relative flex flex-1 items-center justify-between">
              {/* Continuous wire line */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-white/20 pointer-events-none" />

              {Array.from({ length: STEP_COUNT }).map((_, stepIdx) => {
                const gateAtSlot = placedGates.find(
                  (g) =>
                    (g.qubitIndex === qubitIdx ||
                      g.controlQubitIndex === qubitIdx ||
                      g.targetQubitIndex === qubitIdx) &&
                    g.stepIndex === stepIdx
                )

                const isPending =
                  pendingControlQubit?.qubitIndex === qubitIdx &&
                  pendingControlQubit?.stepIndex === stepIdx

                let gateSymbol = ''
                let pendingStyle = ''

                if (isPending) {
                  gateSymbol = '●'
                  pendingStyle = 'border-amber-400 text-amber-300 bg-amber-500/20 animate-pulse'
                } else if (gateAtSlot) {
                  if (gateAtSlot.type === 'CNOT') {
                    const ctrl = gateAtSlot.controlQubitIndex ?? gateAtSlot.qubitIndex
                    const trgt = gateAtSlot.targetQubitIndex ?? (ctrl + 1) % qubitsCount
                    gateSymbol = qubitIdx === ctrl ? '●' : qubitIdx === trgt ? '⊕' : ''
                  } else if (gateAtSlot.type === 'SWAP') {
                    gateSymbol = '✕'
                  } else {
                    gateSymbol = gateAtSlot.type
                  }
                }

                const gateDef = gateAtSlot
                  ? GATE_PALETTE.find((p) => p.type === gateAtSlot.type)
                  : null

                return (
                  <button
                    key={stepIdx}
                    onClick={() => onCellClick(qubitIdx, stepIdx)}
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                      isPending
                        ? pendingStyle
                        : gateAtSlot
                        ? 'border-white text-white font-mono font-bold shadow-lg scale-105'
                        : 'border-dashed border-white/20 bg-black/40 hover:border-cyan-400 hover:bg-cyan-500/10'
                    }`}
                    style={gateDef && !isPending ? { background: gateDef.color } : {}}
                    title={
                      isPending
                        ? 'Control Qubit selected. Click target wire at this step.'
                        : gateAtSlot
                        ? `Click to remove ${gateAtSlot.type}`
                        : `Click to place ${selectedGateType}`
                    }
                  >
                    {gateSymbol}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-center text-[var(--q-muted)]">
        {pendingControlQubit ? (
          <span className="text-amber-300 font-semibold animate-pulse">
            🎯 Control Qubit selected at Step {pendingControlQubit.stepIndex + 1}. Click
            another wire at Step {pendingControlQubit.stepIndex + 1} to set target.
          </span>
        ) : selectedGateType === 'CNOT' || selectedGateType === 'SWAP' ? (
          <span>
            💡 <strong>{selectedGateType} Gate:</strong> Click 1st wire to set Control, then
            click 2nd wire at the same step to set Target.
          </span>
        ) : (
          <span>
            💡 Click any empty wire slot to place selected <strong>{selectedGateType}</strong>{' '}
            gate. Click existing gate to remove.
          </span>
        )}
      </p>
    </div>
  )
})
