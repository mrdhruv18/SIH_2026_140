'use client'

// ==============================================================================
// QUANTIFY — hooks/useCircuitState.ts
// ==============================================================================
// Manages all mutable state for the quantum circuit builder:
//   - placed gates (add, remove, undo)
//   - qubit register count
//   - pending two-qubit gate control selection
//   - circuit title for save/load
//
// WHY A HOOK: The simulator page had ~14 interrelated useState calls scattered
// across 725 lines. Centralising them here makes the page a thin composition
// file and lets tests exercise circuit logic without rendering.
// ==============================================================================

import { useState, useCallback } from 'react'
import { PRESET_CIRCUITS } from '@/lib/api/circuits'

export interface PlacedGate {
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

export function useCircuitState() {
  const [qubitsCount, setQubitsCount] = useState(2)
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>(PRESET_CIRCUITS[0].gates)
  const [circuitTitle, setCircuitTitle] = useState('Bell State Circuit')
  const [selectedGateType, setSelectedGateType] = useState<string>('H')
  const [pendingControlQubit, setPendingControlQubit] = useState<PendingControl | null>(null)

  /** Removes all gates from the canvas and clears pending control state. */
  const resetCircuit = useCallback(() => {
    setPlacedGates([])
    setPendingControlQubit(null)
  }, [])

  /** Replaces the current circuit with a named preset. */
  const loadPreset = useCallback((preset: typeof PRESET_CIRCUITS[0]) => {
    setQubitsCount(preset.qubitsCount)
    setPlacedGates(preset.gates)
    setCircuitTitle(preset.title)
    setPendingControlQubit(null)
  }, [])

  /**
   * Handles a click on a wire-step cell.
   *  - If a gate occupies that slot: remove it.
   *  - If the selected gate is a 1-qubit gate: place it immediately.
   *  - If the selected gate needs two qubits (CNOT/SWAP):
   *      first click selects the control, second click at the same step
   *      places the full gate.
   */
  const handleCellClick = useCallback(
    (qubitIndex: number, stepIndex: number) => {
      // Remove existing gate at this slot
      const existingIndex = placedGates.findIndex(
        (g) =>
          g.stepIndex === stepIndex &&
          (g.qubitIndex === qubitIndex ||
            g.targetQubitIndex === qubitIndex ||
            g.controlQubitIndex === qubitIndex)
      )
      if (existingIndex >= 0) {
        setPlacedGates((prev) => prev.filter((_, i) => i !== existingIndex))
        setPendingControlQubit(null)
        return
      }

      // Single-qubit gate: place immediately
      if (selectedGateType !== 'CNOT' && selectedGateType !== 'SWAP') {
        setPlacedGates((prev) => [
          ...prev,
          {
            id: `gate-${Date.now()}-${Math.random()}`,
            type: selectedGateType,
            qubitIndex,
            stepIndex,
          },
        ])
        setPendingControlQubit(null)
        return
      }

      // Two-qubit gate: two-click placement
      if (!pendingControlQubit || pendingControlQubit.stepIndex !== stepIndex) {
        // First click: store control location
        setPendingControlQubit({ qubitIndex, stepIndex, gateType: selectedGateType })
      } else {
        // Second click at same step: place gate
        if (pendingControlQubit.qubitIndex === qubitIndex) {
          // Same wire as control — cancel
          setPendingControlQubit(null)
          return
        }
        setPlacedGates((prev) => [
          ...prev,
          {
            id: `gate-${Date.now()}-${Math.random()}`,
            type: selectedGateType,
            qubitIndex: pendingControlQubit.qubitIndex,
            stepIndex,
            controlQubitIndex: pendingControlQubit.qubitIndex,
            targetQubitIndex: qubitIndex,
          },
        ])
        setPendingControlQubit(null)
      }
    },
    [placedGates, pendingControlQubit, selectedGateType]
  )

  return {
    qubitsCount,
    setQubitsCount,
    placedGates,
    setPlacedGates,
    circuitTitle,
    setCircuitTitle,
    selectedGateType,
    setSelectedGateType,
    pendingControlQubit,
    resetCircuit,
    loadPreset,
    handleCellClick,
  }
}
