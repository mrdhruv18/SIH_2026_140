// ==============================================================================
// QUANTIFY — Supabase Edge Function: save-circuit
// ==============================================================================
// Persists a learner's quantum circuit workspace (PlacedGate[] & SimulationResult)
// into public.saved_circuits. Supports both creating new circuits and updating
// existing workspaces with title, description, qubit counts, and shot settings.
// ==============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// IMPORTANT: PlacedGate here must stay in sync with types/quantify.ts PlacedGate.
// GateType there is: 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'CNOT' | 'SWAP' | 'M'
// Do not add or remove gate types here without updating types/quantify.ts as well.
export interface PlacedGate {
  id: string
  type: 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'CNOT' | 'SWAP' | 'M'
  targetQubit: number
  controlQubit?: number
  step: number
}

export interface BasisStateProbability {
  state: string
  probability: number
  percentage: number
  amplitudeReal: number
  amplitudeImag: number
}

export interface SimulationResult {
  qubitCount: number
  basisStates: BasisStateProbability[]
  executionTimeMs: number
  isEntangled: boolean
}

interface SaveCircuitPayload {
  id?: string
  userId?: string
  title?: string
  description?: string
  qubitCount: number
  placedGates: PlacedGate[]
  simulationResult?: SimulationResult
  backend?: string
  shots?: number
  isPreset?: boolean
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method Not Allowed. Use POST.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing.')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Parse payload
    const body: SaveCircuitPayload = await req.json().catch(() => ({} as any))
    const {
      title = 'Quantum Circuit',
      description = '',
      qubitCount = 2,
      placedGates = [],
      simulationResult = null,
      backend = 'Qiskit Aer',
      shots = 1000,
      isPreset = false,
    } = body

    let userId = body.userId

    // If userId not provided in body, extract from Authorization Bearer token
    if (!userId) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user?.id) userId = user.id
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId in payload or valid Authorization token.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!Array.isArray(placedGates)) {
      return new Response(
        JSON.stringify({ error: 'Invalid placedGates array.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Prepare circuit record
    const circuitId = body.id || crypto.randomUUID()
    const now = new Date().toISOString()

    // 2b. Verify ownership if modifying an existing circuit ID
    if (body.id) {
      const { data: existingCircuit } = await supabase
        .from('saved_circuits')
        .select('user_id')
        .eq('id', body.id)
        .maybeSingle()

      if (existingCircuit && existingCircuit.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: 'Forbidden. You do not own this circuit.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const circuitRecord = {
      id: circuitId,
      user_id: userId,
      title: title.trim() || 'Quantum Circuit',
      description: description.trim() || null,
      qubitCount: Math.min(32, Math.max(1, Number(qubitCount) || 2)),
      placedGates,
      simulationResult,
      backend,
      shots: Math.min(10000, Math.max(100, Number(shots) || 1000)),
      isPreset: Boolean(isPreset),
      updated_at: now,
    }

    // 3. Upsert into public.saved_circuits
    const { data: savedRow, error: saveErr } = await supabase
      .from('saved_circuits')
      .upsert(circuitRecord, { onConflict: 'id' })
      .select()
      .single()

    if (saveErr) {
      throw new Error(`Failed to save circuit: ${saveErr.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        circuit: savedRow,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('save-circuit error:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error saving circuit.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
