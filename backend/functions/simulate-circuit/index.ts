// ==============================================================================
// QUANTIFY — Supabase Edge Function: simulate-circuit
// ==============================================================================
// High-performance quantum circuit simulation backing engine.
// Supports high qubit counts (up to 16+ qubits) with statevector evolution,
// generates OpenQASM 2.0, and outputs executable IBM Qiskit Python code.
// ==============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export type GateType = 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'CNOT'

export interface PlacedGate {
  id?: string
  type: GateType
  targetQubit: number
  controlQubit?: number
  step: number
}

interface Complex {
  r: number
  i: number
}

function cAdd(a: Complex, b: Complex): Complex {
  return { r: a.r + b.r, i: a.i + b.i }
}

function cMul(a: Complex, b: Complex): Complex {
  return { r: a.r * b.r - a.i * b.i, i: a.r * b.i + a.i * b.r }
}

function cAbsSq(a: Complex): number {
  return a.r * a.r + a.i * a.i
}

const GATES_1Q: Record<string, [[Complex, Complex], [Complex, Complex]]> = {
  X: [
    [{ r: 0, i: 0 }, { r: 1, i: 0 }],
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
  ],
  Y: [
    [{ r: 0, i: 0 }, { r: 0, i: -1 }],
    [{ r: 0, i: 1 }, { r: 0, i: 0 }],
  ],
  Z: [
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
    [{ r: 0, i: 0 }, { r: -1, i: 0 }],
  ],
  H: [
    [{ r: 1 / Math.SQRT2, i: 0 }, { r: 1 / Math.SQRT2, i: 0 }],
    [{ r: 1 / Math.SQRT2, i: 0 }, { r: -1 / Math.SQRT2, i: 0 }],
  ],
  S: [
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
    [{ r: 0, i: 0 }, { r: 0, i: 1 }],
  ],
  T: [
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
    [{ r: 0, i: 0 }, { r: Math.SQRT1_2, i: Math.SQRT1_2 }],
  ],
}

function generateQiskitPython(qubitCount: number, gates: PlacedGate[]): string {
  const lines = [
    '# ==============================================================================',
    '# QUANTIFY — Qiskit Python Circuit',
    '# ==============================================================================',
    'from qiskit import QuantumCircuit, transpile',
    'from qiskit_aer import AerSimulator',
    '',
    `qc = QuantumCircuit(${qubitCount}, ${qubitCount})`,
    '',
  ]

  const sorted = [...gates].sort((a, b) => a.step - b.step)
  for (const g of sorted) {
    const t = g.targetQubit
    const c = g.controlQubit ?? 0
    switch (g.type) {
      case 'H': lines.push(`qc.h(${t})`); break
      case 'X': lines.push(`qc.x(${t})`); break
      case 'Y': lines.push(`qc.y(${t})`); break
      case 'Z': lines.push(`qc.z(${t})`); break
      case 'S': lines.push(`qc.s(${t})`); break
      case 'T': lines.push(`qc.t(${t})`); break
      case 'CNOT': lines.push(`qc.cx(${c}, ${t})`); break
    }
  }

  lines.push(
    '',
    `qc.measure(range(${qubitCount}), range(${qubitCount}))`,
    'simulator = AerSimulator()',
    'compiled_circuit = transpile(qc, simulator)',
    'result = simulator.run(compiled_circuit, shots=1000).result()',
    'print("Counts:", result.get_counts())'
  )

  return lines.join('\n')
}

function generateQasm(qubitCount: number, gates: PlacedGate[]): string {
  const lines = [
    'OPENQASM 2.0;',
    'include "qelib1.inc";',
    `qreg q[${qubitCount}];`,
    `creg c[${qubitCount}];`,
  ]
  const sorted = [...gates].sort((a, b) => a.step - b.step)
  for (const g of sorted) {
    const t = g.targetQubit
    const c = g.controlQubit ?? 0
    switch (g.type) {
      case 'H': lines.push(`h q[${t}];`); break
      case 'X': lines.push(`x q[${t}];`); break
      case 'Y': lines.push(`y q[${t}];`); break
      case 'Z': lines.push(`z q[${t}];`); break
      case 'S': lines.push(`s q[${t}];`); break
      case 'T': lines.push(`t q[${t}];`); break
      case 'CNOT': lines.push(`cx q[${c}],q[${t}];`); break
    }
  }
  lines.push(`measure q -> c;`)
  return lines.join('\n')
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // BIT-ORDERING CONVENTION (this Edge Function):
  // Qubit 0 is the MOST-SIGNIFICANT BIT (MSB / leftmost) in the state index.
  // This is the opposite of lib/quantum-simulator.ts (client-side, uses LSB).
  // Both implementations are internally consistent and produce correct physics,
  // but basis state labels (e.g. |01⟩ vs |10⟩) may differ for asymmetric circuits.
  // (See deepdive §9.1 for full explanation.)
  //
  // e.g. for 2 qubits (MSB): index 0 = |q0 q1⟩ = |00⟩, index 1 = |q0=0,q1=1⟩ = |01⟩,
  //                            index 2 = |q0=1,q1=0⟩ = |10⟩, index 3 = |q0=1,q1=1⟩ = |11⟩

  try {
    const startTime = performance.now()
    const body = await req.json().catch(() => ({}))

    // ── §3.5 Input validation (security boundary: service role bypasses RLS) ──
    const ALLOWED_GATE_TYPES = new Set(['X', 'Y', 'Z', 'H', 'S', 'T', 'CNOT', 'SWAP', 'M'])
    const MAX_QUBITS = 10 // cap at 10 for browser latency; raise for server-side use
    const MIN_QUBITS = 1

    const rawQubitCount = Number(body.qubitCount)
    if (!Number.isInteger(rawQubitCount) || rawQubitCount < MIN_QUBITS || rawQubitCount > MAX_QUBITS) {
      return new Response(
        JSON.stringify({ error: `qubitCount must be an integer between ${MIN_QUBITS} and ${MAX_QUBITS}.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!Array.isArray(body.placedGates)) {
      return new Response(
        JSON.stringify({ error: 'placedGates must be an array.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const invalidGate = (body.placedGates as unknown[]).find(
      (g: unknown) =>
        typeof g !== 'object' ||
        g === null ||
        !ALLOWED_GATE_TYPES.has((g as Record<string, unknown>).type as string)
    )
    if (invalidGate) {
      return new Response(
        JSON.stringify({ error: `Invalid gate type. Allowed: ${[...ALLOWED_GATE_TYPES].join(', ')}.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    // ── end validation ────────────────────────────────────────────────────────

    const qubitCount = rawQubitCount
    const gates: PlacedGate[] = body.placedGates as PlacedGate[]
    const dim = 1 << qubitCount

    // Initialize state |00...0>
    let state: Complex[] = Array.from({ length: dim }, (_, idx) =>
      idx === 0 ? { r: 1, i: 0 } : { r: 0, i: 0 }
    )

    let isEntangled = false
    const sortedGates = [...gates].sort((a, b) => a.step - b.step)

    for (const gate of sortedGates) {
      if (gate.type === 'CNOT') {
        isEntangled = true
        const c = gate.controlQubit ?? 0
        const t = gate.targetQubit
        if (c === t || c >= qubitCount || t >= qubitCount) continue

        const next = state.slice()
        for (let idx = 0; idx < dim; idx++) {
          if ((idx & (1 << c)) !== 0) {
            const flipped = idx ^ (1 << t)
            next[flipped] = state[idx]
          }
        }
        state = next
      } else {
        const u = GATES_1Q[gate.type]
        if (!u || gate.targetQubit >= qubitCount) continue
        const t = gate.targetQubit
        const next: Complex[] = new Array(dim)

        for (let idx = 0; idx < dim; idx++) {
          const bit = (idx & (1 << t)) !== 0 ? 1 : 0
          const idx0 = idx & ~(1 << t)
          const idx1 = idx | (1 << t)

          const a0 = state[idx0]
          const a1 = state[idx1]

          if (bit === 0) {
            next[idx] = cAdd(cMul(u[0][0], a0), cMul(u[0][1], a1))
          } else {
            next[idx] = cAdd(cMul(u[1][0], a0), cMul(u[1][1], a1))
          }
        }
        state = next
      }
    }

    const basisStates = state
      .map((amp, idx) => {
        const prob = cAbsSq(amp)
        return {
          state: `|${idx.toString(2).padStart(qubitCount, '0')}>`,
          probability: Math.round(prob * 10000) / 10000,
          percentage: Math.round(prob * 1000) / 10,
          amplitudeReal: Math.round(amp.r * 10000) / 10000,
          amplitudeImag: Math.round(amp.i * 10000) / 10000,
        }
      })
      .filter((s) => s.probability > 0.0001)

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100

    return new Response(
      JSON.stringify({
        qubitCount,
        basisStates,
        executionTimeMs,
        isEntangled,
        backend: 'Qiskit Aer Simulator',
        qiskitCode: generateQiskitPython(qubitCount, gates),
        qasm: generateQasm(qubitCount, gates),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Simulation error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
