// ==============================================================================
// QUANTIFY — Supabase Edge Function: tutor-chat
// ==============================================================================
// Interactive AI Quantum Mentor powered by Google Gemini API.
// 1. Fetches recent conversation history (last 10 messages) for contextual grounding.
// 2. Applies adaptive Socratic system prompt tailored to topic and proficiency tier.
// 3. Directly calls Gemini API with graceful 429 / rate-limit fallback.
// 4. Stores both student and assistant messages in public.tutor_messages.
// 5. Returns ChatMessage matching frontend types with code snippets & concept cards.
// ==============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export interface ChatMessage {
  id: string
  conversationId: string
  sender: 'user' | 'assistant'
  text: string
  content: string // Dual-support for QuantaAIMessage
  timestamp: string
  codeSnippet?: string
  conceptCard?: { title: string; summary: string }
  groundedTopic?: string
}

interface TutorChatPayload {
  userId?: string
  conversationId?: string
  message: string
  currentTopic?: string
  currentLevel?: string
  /** Tutor mode: 'normal' | 'analogy' | 'mistake-doctor' */
  mode?: 'normal' | 'analogy' | 'mistake-doctor'
  /** For mistake-doctor mode */
  questionText?: string
  chosenOptionText?: string
  correctOptionText?: string
  /** Active circuit context injected into the system prompt */
  circuitContext?: {
    qubitCount: number
    placedGates: PlacedGate[]
    qiskitCode?: string
  }
}

// Extracts code block (e.g. ```python ... ```) from markdown text
function extractCodeSnippet(text: string): string | undefined {
  const codeBlockRegex = /```(?:python|qiskit|javascript|typescript|bash)?\s*([\s\S]*?)```/i
  const match = text.match(codeBlockRegex)
  return match ? match[1].trim() : undefined
}

// Extracts or generates a concise concept card from the AI response
function extractConceptCard(text: string, topic: string): { title: string; summary: string } | undefined {
  // Look for bold definitions or headers
  const titleMatch = text.match(/\*\*(.*?)\*\*/i)
  const title = titleMatch ? titleMatch[1].slice(0, 40) : `Concept: ${topic}`
  
  // First clean sentence after removing markdown
  const clean = text.replace(/[*#`$\n]/g, ' ').replace(/\s+/g, ' ').trim()
  const firstSentence = clean.split('.')[0]
  if (firstSentence && firstSentence.length > 15) {
    return {
      title,
      summary: firstSentence.slice(0, 120) + '.',
    }
  }
  return undefined
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

    // 1. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).')
    }

    if (!geminiApiKey) {
      throw new Error('Missing GEMINI_API_KEY environment variable. Please set it in Supabase Secrets.')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Parse payload
    const body: TutorChatPayload = await req.json().catch(() => ({} as any))
    const { message } = body
    let userId = body.userId
    let conversationId = body.conversationId
    const currentTopic = body.currentTopic || 'Quantum Fundamentals'
    const currentLevel = body.currentLevel || 'Intermediate'

    // Extract userId from Authorization Bearer token if not provided
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

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // §3.5: cap message length to prevent prompt-injection and runaway token usage
    const MAX_MESSAGE_LENGTH = 2000
    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // §3.5: validate mode is in the allowed list
    const ALLOWED_MODES = new Set(['normal', 'analogy', 'mistake-doctor', undefined])
    if (!ALLOWED_MODES.has(body.mode)) {
      return new Response(
        JSON.stringify({ error: `Invalid mode. Allowed: normal, analogy, mistake-doctor.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Ensure conversation thread exists in public.tutor_conversations
    if (!conversationId) {
      conversationId = crypto.randomUUID()
    }

    const { error: convErr } = await supabase
      .from('tutor_conversations')
      .upsert(
        {
          id: conversationId,
          user_id: userId,
          title: `Quanta Session: ${currentTopic}`,
          groundedTopic: currentTopic,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (convErr) {
      console.warn('tutor_conversations upsert note:', convErr.message)
    }

    // 4. Save incoming User message to public.tutor_messages
    const userMsgId = crypto.randomUUID()
    const now = new Date()
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    await supabase.from('tutor_messages').insert({
      id: userMsgId,
      conversation_id: conversationId,
      user_id: userId,
      sender: 'user',
      content: message,
      timestamp: timestampStr,
      groundedTopic: currentTopic,
      created_at: now.toISOString(),
    })

    // 5. Fetch last 10 messages from public.tutor_messages for context
    const { data: recentHistory } = await supabase
      .from('tutor_messages')
      .select('sender, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Build chronological Gemini chat contents
    const historyChronological = (recentHistory || []).reverse()

    const geminiContents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = []

    for (const h of historyChronological) {
      const role = h.sender === 'user' ? 'user' : 'model'
      // Collapse repeated identical roles if any
      const last = geminiContents[geminiContents.length - 1]
      if (last && last.role === role) {
        last.parts[0].text += `\n${h.content}`
      } else {
        geminiContents.push({
          role,
          parts: [{ text: h.content }],
        })
      }
    }

    // Ensure the last item in contents is the current user message
    const lastContent = geminiContents[geminiContents.length - 1]
    if (!lastContent || lastContent.role !== 'user') {
      geminiContents.push({
        role: 'user',
        parts: [{ text: message }],
      })
    }

    // 6. Call Google Gemini API
    const circuitContext = body.circuitContext
    const mode = body.mode
    const questionText = body.questionText
    const chosenOptionText = body.chosenOptionText
    const correctOptionText = body.correctOptionText
    let circuitDetailsStr = ''
    if (circuitContext) {
      circuitDetailsStr = `\nActive Student Circuit Context:\nQubit Count: ${circuitContext.qubitCount}\nGates: ${JSON.stringify(circuitContext.placedGates)}\nCode: ${circuitContext.qiskitCode || 'N/A'}`
    }

    let systemPrompt: string
    if (mode === 'analogy') {
      systemPrompt = `You are Quanta AI. Generate ONE short, vivid, real-world analogy (no jargon, 2-3 sentences max) for what this exact quantum circuit does, based on the qubit count, gates, and result probabilities provided below.${circuitDetailsStr}`
    } else if (mode === 'mistake-doctor') {
      systemPrompt = `You are Quanta AI. The learner answered a quiz question incorrectly. Question: "${questionText}". They chose: "${chosenOptionText}". The correct answer is: "${correctOptionText}". In exactly 3 short sentences, explain why their choice is a common misconception and how to think about it correctly. No jargon beyond what the question itself uses.`
    } else {
      systemPrompt = `You are Quanta AI, a quantum computing tutor. Student level: ${currentLevel}. Current topic: ${currentTopic}.${circuitDetailsStr}\nExplain concepts clearly, use LaTeX for equations, analyze active student circuits, and suggest fixes or optimizations when asked.`
    }

    // Models ordered by highest free tier quota and speed
    const preferredModels = [
      Deno.env.get('GEMINI_MODEL') || 'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
      'gemini-2.5-flash',
      'gemini-flash-latest',
    ]

    let aiResponseText = ''
    let isRateLimited = false

    for (const model of preferredModels) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`

        const geminiReqBody = {
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        }

        const res = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiReqBody),
        })

        if (res.status === 429) {
          isRateLimited = true
          console.warn(`Gemini model ${model} rate limited (HTTP 429). Trying next or fallback...`)
          continue
        }

        if (!res.ok) {
          const errBody = await res.text()
          console.warn(`Gemini model ${model} error (${res.status}): ${errBody}`)
          continue
        }

        const data = await res.json()
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text

        if (textOutput) {
          aiResponseText = textOutput
          break
        }
      } catch (err: any) {
        console.warn(`Error calling Gemini ${model}:`, err.message)
      }
    }

    // 7. Handle 429 / Rate limit or service downtime gracefully
    if (!aiResponseText) {
      if (isRateLimited) {
        aiResponseText = `⚡ **Quantum Traffic Surge:** The Quanta quantum network is currently experiencing high coherent state traffic (rate limit reached).

While the quantum channel re-stabilizes, here is a quick review for **${currentTopic}**:
In quantum computing, state vectors satisfy the normalization condition $\\lvert \\alpha \\rvert^2 + \\lvert \\beta \\rvert^2 = 1$. When subjected to measurement, the superposition collapses into an observable eigenstate.

*Please try sending your message again in a few seconds.*`
      } else {
        aiResponseText = `I am reviewing your question regarding **${currentTopic}**. In quantum information, unitary operations preserve state vector norms. Please feel free to ask a follow-up or rephrase your question!`
      }
    }

    // 8. Extract optional code snippets and concept cards
    const codeSnippet = extractCodeSnippet(aiResponseText)
    const conceptCard = extractConceptCard(aiResponseText, currentTopic)

    // 9. Save AI response to public.tutor_messages
    const assistantMsgId = crypto.randomUUID()
    const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    await supabase.from('tutor_messages').insert({
      id: assistantMsgId,
      conversation_id: conversationId,
      user_id: userId,
      sender: 'assistant',
      content: aiResponseText,
      timestamp: replyTimestamp,
      groundedTopic: currentTopic,
      codeSnippet: codeSnippet || null,
      conceptCard: conceptCard || null,
      created_at: new Date().toISOString(),
    })

    // 10. Construct ChatMessage response matching frontend type
    const responsePayload: ChatMessage = {
      id: assistantMsgId,
      conversationId,
      sender: 'assistant',
      text: aiResponseText,
      content: aiResponseText,
      timestamp: replyTimestamp,
      codeSnippet,
      conceptCard,
      groundedTopic: currentTopic,
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('tutor-chat exception:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error processing tutor chat.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
