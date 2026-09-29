'use client'

import React, { useState } from 'react'
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  RefreshCw,
  Plus,
  MessageSquare,
  BookOpen,
  Loader2,
} from 'lucide-react'
import {
  SUGGESTED_QUESTIONS,
  INITIAL_CHAT_MESSAGES,
  ChatMessage,
  getMockAIResponse,
  sendTutorChatMessage,
} from '@/lib/api/tutor'
import { useAuth } from '@/lib/auth-context'
import { AppShell } from '@/components/layout/AppShell'

export default function TutorPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    try {
      // Call live Supabase Edge Function 'tutor-chat' backed by Google Gemini
      const { data, error } = await sendTutorChatMessage(
        user.id,
        query,
        user.weakTopics?.[0] || 'Quantum Mechanics & Circuits',
        user.level
      )

      if (error || !data) {
        throw error || new Error('No AI tutor response received.')
      }

      const aiResponseMsg: ChatMessage = {
        id: data.id || `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.content || (data as any).text || 'Quantum analysis complete.',
        timestamp: data.timestamp || 'Just now',
        codeSnippet: data.codeSnippet,
        conceptCard: data.conceptCard,
      }

      setMessages((prev) => [...prev, aiResponseMsg])
    } catch (err) {
      console.warn('Fallback to local AI tutor model:', err)
      // Offline fallback
      const aiMsg = getMockAIResponse(query, user.level)
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl py-4 space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
        {/* Tutor Header */}
        <div className="flex items-center justify-between border-b pb-4 shrink-0" style={{ borderColor: 'var(--q-line)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-[var(--q-cyan)] shadow-lg shadow-cyan-500/10">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg font-bold text-white">Quanta AI Tutor</h1>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini 3.5 Active
                </span>
              </div>
              <p className="text-xs text-[var(--q-muted)]">
                Level-Aware Mentor ({user.level} tier) • Socratic Quantum Explanations
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages(INITIAL_CHAT_MESSAGES)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-[var(--q-muted)] hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-[var(--q-cyan)]">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-3xl p-4 sm:p-5 space-y-3 leading-relaxed ${
                    isUser
                      ? 'border border-[var(--q-cyan)]/30'
                      : 'border backdrop-blur-xl'
                  }`}
                  style={{
                    background: isUser
                      ? 'linear-gradient(135deg, color-mix(in oklch, var(--q-cyan) 25%, transparent), color-mix(in oklch, var(--q-violet) 25%, transparent))'
                      : 'var(--q-bg-deep)',
                    borderColor: isUser ? undefined : 'var(--q-line)',
                    color: 'var(--q-text)',
                  }}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Code Snippet Box */}
                  {msg.codeSnippet && (
                    <div className="rounded-2xl border border-white/10 bg-black/60 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[var(--q-muted)] border-b border-white/10 pb-2">
                        <span className="font-mono text-cyan-300">python (qiskit)</span>
                        <button
                          onClick={() => copyCode(msg.codeSnippet!, msg.id)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="overflow-x-auto text-[11px] font-mono text-cyan-200/90 leading-tight">
                        <code>{msg.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Concept Card */}
                  {msg.conceptCard && (
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 text-xs space-y-1" style={{ color: 'var(--q-text)' }}>
                      <p className="font-bold flex items-center gap-1.5" style={{ color: 'var(--q-cyan)' }}>
                        <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--q-cyan)' }} />
                        {msg.conceptCard.title}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--q-muted)' }}>{msg.conceptCard.summary}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[var(--q-muted)] pt-1">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <div className="flex items-center gap-2">
                        <button className="hover:text-white transition-colors"><ThumbsUp className="h-3 w-3" /></button>
                        <button className="hover:text-white transition-colors"><ThumbsDown className="h-3 w-3" /></button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--q-line)] bg-white/10" style={{ color: 'var(--q-text)' }}>
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            )
          })}

          {isTyping && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-[var(--q-cyan)]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border p-3 px-4 backdrop-blur-xl flex items-center gap-2 text-[var(--q-muted)]" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--q-cyan)]" />
                <span>Quanta AI is formulating your personalized explanation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts */}
        <div className="flex gap-2 overflow-x-auto py-1 shrink-0 scrollbar-none">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSend(q.prompt)}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-[var(--q-muted)] transition-all hover:border-[var(--q-cyan)]/40 hover:text-white"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask a quantum question tailored to your ${user.level} knowledge level...`}
            className="w-full rounded-2xl border py-3.5 pl-4 pr-24 text-xs outline-none placeholder:text-[var(--q-muted)]"
            style={{
              borderColor: 'var(--q-line)',
              background: 'var(--q-bg-deep)',
              color: 'var(--q-text)',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
            }}
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
  )
}
