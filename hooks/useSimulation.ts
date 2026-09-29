'use client'

// ==============================================================================
// QUANTIFY — hooks/useSimulation.ts
// ==============================================================================
// Manages the simulation lifecycle:
//   - Runs the client-side statevector engine on demand (handleRunSimulation)
//   - Fires a background cloud verification call (simulateCircuitWithQiskit)
//   - Keeps loading state separate from circuit state
//   - Manages the Quanta analogy engine (handleExplainAnalogy)
//
// WHY SEPARATE FROM useCircuitState: simulation execution is a side-effect
// that talks to the AI and the cloud backend. Keeping it separate makes it
// independently testable and easy to disable in a mock environment.
// ==============================================================================

import { useState, useCallback } from 'react'
import { simulateCircuitClient, simulateCircuitWithQiskit, SimulationOutput } from '@/lib/api/circuits'
import { sendTutorChatMessage } from '@/lib/api/tutor'
import type { PlacedGate } from '@/lib/api/circuits'

interface UseSimulationProps {
  placedGates: PlacedGate[]
  qubitsCount: number
  backend: string
  shots: number
  userId: string
  customCodeText: string
}

export function useSimulation({
  placedGates,
  qubitsCount,
  backend,
  shots,
  userId,
  customCodeText,
}: UseSimulationProps) {
  const [results, setResults] = useState<SimulationOutput | null>(() =>
    // Eagerly simulate the default Bell state preset
    simulateCircuitClient(placedGates, qubitsCount, backend, shots)
  )
  const [simulating, setSimulating] = useState(false)
  const [analogyText, setAnalogyText] = useState<string | null>(null)
  const [analogyLoading, setAnalogyLoading] = useState(false)

  /** Runs the local statevector engine and dispatches a background cloud call. */
  const handleRunSimulation = useCallback(async () => {
    setSimulating(true)
    try {
      const res = simulateCircuitClient(placedGates, qubitsCount, backend, shots)
      setResults(res)
      // Background cloud verification — result discarded (not presented to user)
      simulateCircuitWithQiskit(qubitsCount, placedGates, shots).catch(() => {})
    } catch (err) {
      console.warn('Simulation fallback triggered:', err)
      setResults(simulateCircuitClient(placedGates, qubitsCount, backend, shots))
    } finally {
      setSimulating(false)
    }
  }, [placedGates, qubitsCount, backend, shots])

  /**
   * Sends the active circuit to Quanta AI for a real-world analogy.
   * Button is already disabled when placedGates is empty, so the guard
   * here is a safety net only.
   */
  const handleExplainAnalogy = useCallback(async () => {
    if (placedGates.length === 0) return
    setAnalogyLoading(true)
    setAnalogyText(null)
    const { data } = await sendTutorChatMessage(
      userId || 'anonymous',
      'Generate a real-world analogy for this circuit.',
      'Quantum Circuit Analogy',
      'Beginner',
      undefined,
      {
        qubitCount: qubitsCount,
        placedGates,
        results: results ?? undefined,
        qiskitCode: customCodeText,
      },
      'analogy'
    )
    setAnalogyText(data?.text ?? data?.content ?? null)
    setAnalogyLoading(false)
  }, [placedGates, qubitsCount, results, userId, customCodeText])

  return {
    results,
    setResults,
    simulating,
    analogyText,
    analogyLoading,
    handleRunSimulation,
    handleExplainAnalogy,
  }
}
