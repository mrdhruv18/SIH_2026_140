'use client'

// ==============================================================================
// QUANTIFY — components/simulator/ResultsPanel.tsx
// ==============================================================================
// Right sidebar: shows measurement probabilities as a bar chart, statevector
// amplitude table, and the Quanta AI "Explain Like I'm New" analogy engine.
//
// Receives the simulation output and analogy state from the parent via props.
// All callbacks are passed in — no internal simulation state.
// ==============================================================================

import React from 'react'
import { Loader2, Sparkles, Zap } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { SimulationOutput } from '@/lib/api/circuits'

interface ResultsPanelProps {
  results: SimulationOutput | null
  backend: string
  onSetBackend: (b: string) => void
  shots: number
  onSetShots: (s: number) => void
  analogyText: string | null
  analogyLoading: boolean
  onExplainAnalogy: () => void
  hasGates: boolean
}

export const ResultsPanel = React.memo(function ResultsPanel({
  results,
  backend,
  onSetBackend,
  shots,
  onSetShots,
  analogyText,
  analogyLoading,
  onExplainAnalogy,
  hasGates,
}: ResultsPanelProps) {
  return (
    <div
      className="lg:col-span-3 rounded-3xl border p-5 backdrop-blur-xl space-y-5"
      style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}
    >
      <h3
        className="font-heading text-sm font-bold text-white flex items-center gap-2 border-b pb-3"
        style={{ borderColor: 'var(--q-line)' }}
      >
        <Zap className="h-4 w-4 text-[var(--q-cyan)]" />
        Simulation Results
      </h3>

      {/* Backend & Shots config */}
      <div className="space-y-3 text-xs">
        <div>
          <label className="text-[var(--q-muted)] block mb-1">Execution Backend:</label>
          <select
            value={backend}
            onChange={(e) => onSetBackend(e.target.value)}
            className="w-full rounded-xl border p-2 text-xs font-semibold text-white outline-none"
            style={{ borderColor: 'var(--q-line)', background: 'rgba(0,0,0,0.5)' }}
          >
            {/* §3.8: honest label — custom statevector engine, Qiskit-compatible output */}
            <option value="Qiskit Aer">Custom Statevector (Qiskit-compatible)</option>
            <option value="PennyLane">PennyLane Simulator</option>
            <option value="Cirq">Google Cirq Engine</option>
            <option value="qBraid">qBraid Lab Cluster</option>
          </select>
        </div>

        <div>
          <label className="text-[var(--q-muted)] flex justify-between mb-1">
            <span>Shots Count:</span>
            <span className="text-cyan-300 font-bold">{shots}</span>
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={shots}
            onChange={(e) => onSetShots(Number(e.target.value))}
            className="w-full accent-[var(--q-cyan)]"
          />
        </div>
      </div>

      {/* Probability chart + statevector + analogy */}
      {results ? (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Measurement Probabilities</span>
            <span className="text-[10px] text-[var(--q-muted)]">{results.executionTimeMs}ms</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.probabilities}>
                <XAxis dataKey="state" stroke="var(--q-muted)" fontSize={11} />
                <YAxis stroke="var(--q-muted)" fontSize={10} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                  {results.probabilities.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? 'var(--q-cyan)' : 'var(--q-violet)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* State vector amplitudes */}
          <div
            className="rounded-2xl border p-3 space-y-1.5 text-xs font-mono"
            style={{ borderColor: 'var(--q-line)', background: 'rgba(0,0,0,0.4)' }}
          >
            <p className="text-[10px] text-[var(--q-muted)] uppercase tracking-wider font-sans">
              State vector amplitudes
            </p>
            {results.stateVector.map((sv) => (
              <div key={sv.state} className="flex justify-between text-cyan-300">
                <span>{sv.state}:</span>
                <span>{sv.amplitude}</span>
              </div>
            ))}
          </div>

          {/* AI Analogy Engine */}
          <button
            onClick={onExplainAnalogy}
            disabled={analogyLoading || !hasGates}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {analogyLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Generating analogy…</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Explain Like I&apos;m New</span>
              </>
            )}
          </button>

          {analogyText && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100 leading-relaxed">
              <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Real-world analogy:
              </p>
              <p>{analogyText}</p>
            </div>
          )}
        </div>
      ) : (
        <div
          className="p-6 text-center text-xs text-[var(--q-muted)] border rounded-2xl"
          style={{ borderColor: 'var(--q-line)' }}
        >
          Click <strong>Execute Circuit</strong> to simulate gate probability outcomes.
        </div>
      )}
    </div>
  )
})
