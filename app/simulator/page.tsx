'use client'

// ==============================================================================
// QUANTIFY — app/simulator/page.tsx  (composition root, ~150 lines)
// ==============================================================================
// Assembles the simulator from extracted hooks and components. This file
// contains no business logic — only wiring and layout. All state lives in
// useCircuitState and useSimulation; all rendering is in the components below.
// ==============================================================================

import React, { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Play, RotateCcw, Loader2, Sparkles, Save, Check, HelpCircle, Sliders, Code } from 'lucide-react'
import { PRESET_CIRCUITS, saveCircuitServer } from '@/lib/api/circuits'
import { generateQiskitAndQasmCode, parseQiskitOrQasmToCircuit } from '@/lib/qiskit-parser'
import { lintCircuit } from '@/lib/api/tutor'
import { useAuth } from '@/lib/auth-context'
import { AppShell } from '@/components/layout/AppShell'
import { SimulatorIntro } from '@/components/simulator/SimulatorIntro'
import { GatePalette } from '@/components/simulator/GatePalette'
import { CircuitCanvas } from '@/components/simulator/CircuitCanvas'
import { ResultsPanel } from '@/components/simulator/ResultsPanel'
import { ExportTabs } from '@/components/simulator/ExportTabs'
import { useCircuitState } from '@/hooks/useCircuitState'
import { useSimulation } from '@/hooks/useSimulation'
import { Cpu } from 'lucide-react'
import { simulateCircuitClient } from '@/lib/api/circuits'
import { ACADEMY_MISSIONS } from '@/lib/academy/academy-content'
import { MissionOverlay, MissionSuccessModal } from '@/components/academy'
import { validateMission } from '@/lib/academy/mission-validator'
import { LocalAcademyStorage } from '@/lib/academy/academy-progress'

function SimulatorContent() {
  const { user } = useAuth()

  const searchParams = useSearchParams()
  const router = useRouter()
  const missionId = searchParams.get('mission')
  const activeMission = missionId ? ACADEMY_MISSIONS.find(m => m.id === missionId) : null

  const [validationError, setValidationError] = useState<{missing: string, expectedGate: string} | null>(null)
  const [missionSuccess, setMissionSuccess] = useState(false)

  const handleMissionSubmit = async () => {
    if (!activeMission) return
    const result = validateMission(activeMission, placedGates)
    if (result.passed) {
      setValidationError(null)
      setMissionSuccess(true)
      
      // Update local storage
      const state = await LocalAcademyStorage.getState()
      if (!state.completedMissions.includes(activeMission.id)) {
        await LocalAcademyStorage.saveState({
          ...state,
          completedMissions: [...state.completedMissions, activeMission.id]
        })
      }
    } else {
      setValidationError({ missing: result.missing!, expectedGate: result.expectedGate! })
    }
  }

  const handleNextMission = () => {
    setMissionSuccess(false)
    resetCircuit()
    router.push('/academy') // Return to academy to pick next mission
  }


  // ── Intro modal ──────────────────────────────────────────────────────────────
  const [showIntro, setShowIntro] = useState<boolean>(false)

  React.useEffect(() => {
    if (!localStorage.getItem('quantify_sim_intro_seen')) {
      setShowIntro(true)
    }
  }, [])

  const handleCloseIntro = () => {
    if (typeof window !== 'undefined') localStorage.setItem('quantify_sim_intro_seen', '1')
    setShowIntro(false)
  }

  // ── Circuit state ─────────────────────────────────────────────────────────────
  const {
    qubitsCount, setQubitsCount,
    placedGates, setPlacedGates,
    circuitTitle, setCircuitTitle,
    selectedGateType, setSelectedGateType,
    pendingControlQubit,
    resetCircuit, loadPreset, handleCellClick,
  } = useCircuitState()

  // ── Backend & shots ───────────────────────────────────────────────────────────
  const [backend, setBackend] = useState('Qiskit Aer')
  const [shots, setShots] = useState(1000)

  // ── Code editor ───────────────────────────────────────────────────────────────
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'grid' | 'code'>('grid')
  const [codeMode, setCodeMode] = useState<'qiskit' | 'qasm'>('qiskit')
  const [customCodeText, setCustomCodeText] = useState('')
  const [codeParseError, setCodeParseError] = useState<string | null>(null)

  React.useEffect(() => {
    const generated = generateQiskitAndQasmCode(qubitsCount, placedGates)
    setCustomCodeText(codeMode === 'qiskit' ? generated.qiskit : generated.qasm)
  }, [qubitsCount, placedGates, codeMode])

  const handleSyncCodeToGrid = React.useCallback(() => {
    setCodeParseError(null)
    const parsed = parseQiskitOrQasmToCircuit(customCodeText)
    if (parsed.error) {
      setCodeParseError(parsed.error)
    } else {
      setQubitsCount(parsed.qubitCount)
      setPlacedGates(parsed.placedGates)
      setActiveWorkspaceTab('grid')
    }
  }, [customCodeText, setQubitsCount, setPlacedGates, setActiveWorkspaceTab])

  // ── Simulation ────────────────────────────────────────────────────────────────
  const {
    results, simulating,
    analogyText, analogyLoading,
    handleRunSimulation, handleExplainAnalogy,
  } = useSimulation({
    placedGates, qubitsCount, backend, shots,
    userId: user.id, customCodeText,
  })

  // ── Save circuit ──────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveCircuit = async () => {
    setSaving(true)
    try {
      await saveCircuitServer({
        userId: user.id,
        title: circuitTitle,
        description: `${qubitsCount}-qubit circuit with ${placedGates.length} gate(s).`,
        qubitCount: qubitsCount,
        placedGates: placedGates.map((g) => ({
          id: g.id, type: g.type, targetQubit: g.qubitIndex, step: g.stepIndex,
        })),
        backend, shots,
      })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save circuit:', err)
    } finally {
      setSaving(false)
    }
  }

  // ── Circuit linter ────────────────────────────────────────────────────────────
  const [lintFeedback, setLintFeedback] = useState<string[] | null>(null)

  const handleAskQuantaAboutCircuit = () => {
    const { hasWarnings, issues } = lintCircuit(placedGates, qubitsCount)
    setLintFeedback(
      hasWarnings
        ? issues
        : ['✅ Circuit Check Passed: No gate conflicts or missing measurements detected!']
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      {showIntro && (
        <SimulatorIntro onClose={handleCloseIntro} onLoadDemo={() => loadPreset(PRESET_CIRCUITS[0])} />
      )}

      <div className="mx-auto max-w-7xl py-4 space-y-6 relative">
        {activeMission && (
          <MissionOverlay 
            mission={activeMission} 
            onSubmit={handleMissionSubmit} 
            errorFeedback={validationError} 
          />
        )}
        {missionSuccess && activeMission && (
          <MissionSuccessModal 
            mission={activeMission} 
            onNext={handleNextMission} 
          />
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--q-line)' }}>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--q-cyan)] border mb-2" style={{ borderColor: 'color-mix(in oklch, var(--q-cyan) 30%, transparent)' }}>
              <Cpu className="h-3.5 w-3.5" />
              Interactive Quantum Circuit Simulator
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Quantum Workspace</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleAskQuantaAboutCircuit} className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20">
              <Sparkles className="h-4 w-4 text-cyan-400" /><span>Ask Quanta About Circuit</span>
            </button>
            <button onClick={() => setShowIntro(true)} aria-label="Open simulator guide" className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[var(--q-muted)] transition-all hover:border-cyan-500/30 hover:text-[var(--q-cyan)]">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button onClick={handleSaveCircuit} disabled={saving} className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/5 disabled:opacity-40" style={{ borderColor: 'var(--q-line)' }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> : savedSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4 text-cyan-400" />}
              <span>{savedSuccess ? 'Circuit Saved!' : 'Save Circuit'}</span>
            </button>
            <button onClick={resetCircuit} className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold text-[var(--q-muted)] transition-all hover:text-white" style={{ borderColor: 'var(--q-line)' }}>
              <RotateCcw className="h-4 w-4" /><span>Clear Wires</span>
            </button>
            <button onClick={handleRunSimulation} disabled={simulating} className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 shadow-xl shadow-cyan-500/20 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}>
              {simulating ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Simulating…</span></> : <><Play className="h-4 w-4 fill-current" /><span>Execute Circuit</span></>}
            </button>
          </div>
        </div>

        {/* Linter banner */}
        {lintFeedback && lintFeedback.length > 0 && (
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-xs space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-2"><Sparkles className="h-4 w-4 text-cyan-400" />Quanta AI Circuit Analysis:</span>
              <button onClick={() => setLintFeedback(null)} className="text-[var(--q-muted)] hover:text-white text-xs">Dismiss</button>
            </div>
            <ul className="space-y-1 text-cyan-100 font-mono text-[11px] list-disc pl-5">
              {lintFeedback.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>
        )}

        {/* Workspace tab switcher */}
        <div className="flex border-b text-xs font-semibold" style={{ borderColor: 'var(--q-line)' }}>
          {(['grid', 'code'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveWorkspaceTab(tab)} className={`flex items-center gap-2 border-b-2 px-5 py-2.5 transition-all ${activeWorkspaceTab === tab ? 'border-[var(--q-cyan)] text-[var(--q-cyan)] font-bold' : 'border-transparent text-[var(--q-muted)] hover:text-white'}`}>
              {tab === 'grid' ? <Sliders className="h-4 w-4" /> : <Code className="h-4 w-4" />}
              <span>{tab === 'grid' ? 'Visual Circuit Builder' : 'SDK Code Editor (Qiskit / QASM)'}</span>
            </button>
          ))}
        </div>

        {/* Presets bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[var(--q-muted)] font-semibold shrink-0 pr-2">Presets:</span>
          {PRESET_CIRCUITS.map((p) => (
            <button key={p.title} onClick={() => loadPreset(p)} className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white transition-all hover:border-cyan-400 hover:text-[var(--q-cyan)]">{p.title}</button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {activeWorkspaceTab === 'grid' ? (
            <>
              <GatePalette selectedGateType={selectedGateType} onSelectGate={setSelectedGateType} qubitsCount={qubitsCount} onSetQubitsCount={setQubitsCount} allowedGates={activeMission ? activeMission.allowedGates : 'all'} />
              <CircuitCanvas qubitsCount={qubitsCount} placedGates={placedGates} selectedGateType={selectedGateType} pendingControlQubit={pendingControlQubit} onCellClick={handleCellClick} />
            </>
          ) : (
            <ExportTabs codeMode={codeMode} onSetCodeMode={setCodeMode} customCodeText={customCodeText} onChangeCode={setCustomCodeText} onSyncToGrid={handleSyncCodeToGrid} codeParseError={codeParseError} />
          )}
          <ResultsPanel results={results} backend={backend} onSetBackend={setBackend} shots={shots} onSetShots={setShots} analogyText={analogyText} analogyLoading={analogyLoading} onExplainAnalogy={handleExplainAnalogy} hasGates={placedGates.length > 0} />
        </div>
      </div>
    </AppShell>
  )
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading Simulator...</div>}>
      <SimulatorContent />
    </Suspense>
  )
}
