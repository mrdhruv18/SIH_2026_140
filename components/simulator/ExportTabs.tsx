'use client'

// ==============================================================================
// QUANTIFY — components/simulator/ExportTabs.tsx
// ==============================================================================
// Code editor tab: shows the auto-generated Qiskit (Python) or OpenQASM 2.0
// representation of the current circuit, and allows the user to edit and
// sync it back to the visual grid via the parser.
// ==============================================================================

import React from 'react'
import { Code, Sliders } from 'lucide-react'

interface ExportTabsProps {
  codeMode: 'qiskit' | 'qasm'
  onSetCodeMode: (mode: 'qiskit' | 'qasm') => void
  customCodeText: string
  onChangeCode: (text: string) => void
  onSyncToGrid: () => void
  codeParseError: string | null
}

export const ExportTabs = React.memo(function ExportTabs({
  codeMode,
  onSetCodeMode,
  customCodeText,
  onChangeCode,
  onSyncToGrid,
  codeParseError,
}: ExportTabsProps) {
  return (
    <div
      className="lg:col-span-9 rounded-3xl border p-6 backdrop-blur-xl space-y-4"
      style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}
    >
      <div
        className="flex items-center justify-between border-b pb-3"
        style={{ borderColor: 'var(--q-line)' }}
      >
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-white">SDK Format:</span>
          <button
            onClick={() => onSetCodeMode('qiskit')}
            className={`rounded-xl px-3 py-1 font-semibold transition-all ${
              codeMode === 'qiskit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-[var(--q-muted)] hover:text-white'
            }`}
          >
            IBM Qiskit (Python)
          </button>
          <button
            onClick={() => onSetCodeMode('qasm')}
            className={`rounded-xl px-3 py-1 font-semibold transition-all ${
              codeMode === 'qasm'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-[var(--q-muted)] hover:text-white'
            }`}
          >
            OpenQASM 2.0
          </button>
        </div>

        <button
          onClick={onSyncToGrid}
          className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all"
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Sync Code to Grid</span>
        </button>
      </div>

      {codeParseError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          ⚠️ <strong>Code Parsing Warning:</strong> {codeParseError}
        </div>
      )}

      <div
        className="relative rounded-2xl border bg-black/60 p-4 font-mono text-xs text-cyan-300"
        style={{ borderColor: 'var(--q-line)' }}
      >
        <textarea
          value={customCodeText}
          onChange={(e) => onChangeCode(e.target.value)}
          rows={14}
          className="w-full bg-transparent outline-none resize-none font-mono text-xs text-cyan-200 leading-relaxed"
          placeholder="Enter Qiskit Python or OpenQASM 2.0 code..."
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--q-muted)] pt-1">
        <span>⚡ AST Verified Safe Sandbox. Changes can be synced back to the visual circuit grid.</span>
        <span className="text-cyan-400 font-semibold">{codeMode.toUpperCase()} Mode</span>
      </div>
    </div>
  )
})
