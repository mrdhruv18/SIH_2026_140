'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Download,
  Video,
  Code2,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { Topic, FALLBACK_TOPICS, fetchTopicByIdServer } from '@/lib/api/topics'
import { useAuth } from '@/lib/auth-context'
import { AppShell } from '@/components/layout/AppShell'
import { BlochSphere } from '@/components/bloch-sphere'

export default function TopicLearningPage() {
  const params = useParams()
  const router = useRouter()
  const { markTopicCompleted, user } = useAuth()
  const topicId = (params?.id as string) || 'qubits'

  const [currentTopic, setCurrentTopic] = useState<Topic>(
    FALLBACK_TOPICS.find((t) => t.id === topicId) || FALLBACK_TOPICS[1]
  )
  const [activeTab, setActiveTab] = useState<'theory' | 'visual' | 'video' | 'practice'>('theory')
  const [showHint, setShowHint] = useState<Record<number, boolean>>({})

  // Fetch topic from database API
  useEffect(() => {
    async function loadTopic() {
      const { data } = await fetchTopicByIdServer(topicId, user.completedTopics)
      if (data) {
        setCurrentTopic(data)
      }
    }

    loadTopic()
  }, [topicId, user.completedTopics])

  const isCompleted = user?.completedTopics?.includes(currentTopic.id) || false

  const handleMarkComplete = () => {
    markTopicCompleted(currentTopic.id)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl py-4 space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--q-line)' }}>
          <Link href="/path" className="flex items-center gap-2 text-xs font-medium text-[var(--q-muted)] hover:text-[var(--q-text)] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Learning Path</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkComplete}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isCompleted
                  ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                  : 'border border-[var(--q-line)] bg-white/5 text-[var(--q-muted)] hover:text-white'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>

            <Link
              href={`/quiz/${currentTopic.id}`}
              className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-black shadow-lg shadow-cyan-500/20"
              style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}
            >
              <span>Take Checkpoint Quiz</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Topic Title Card */}
        <div
          className="rounded-3xl border p-6 sm:p-8 backdrop-blur-xl space-y-3 relative overflow-hidden"
          style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-0.5 text-xs font-semibold" style={{ color: 'var(--q-cyan)' }}>
              {currentTopic.category}
            </span>
            <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-0.5 text-xs font-semibold" style={{ color: 'var(--q-violet)' }}>
              Level: {currentTopic.difficulty}
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold" style={{ color: 'var(--q-text)' }}>
            {currentTopic.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--q-muted)] max-w-3xl leading-relaxed">
            {currentTopic.description}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b text-xs sm:text-sm font-semibold" style={{ borderColor: 'var(--q-line)' }}>
          {[
            { id: 'theory', label: 'Theory & Concepts', icon: <BookOpen className="h-4 w-4" /> },
            { id: 'visual', label: 'Interactive Visuals', icon: <Sparkles className="h-4 w-4" /> },
            { id: 'video', label: 'Video Lecture', icon: <Video className="h-4 w-4" /> },
            { id: 'practice', label: 'Practice Problems', icon: <FileQuestion className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'border-[var(--q-cyan)] text-[var(--q-cyan)]'
                  : 'border-transparent text-[var(--q-muted)] hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Theory */}
        {activeTab === 'theory' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border p-6 sm:p-8 backdrop-blur-xl space-y-6 lg:col-span-2" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
              <div className="prose max-w-none text-xs sm:text-sm leading-relaxed space-y-4" style={{ color: 'var(--q-muted)' }}>
                <p style={{ color: 'var(--q-text)' }}>{currentTopic.content.theory}</p>
                <div className="rounded-2xl border p-5 border-cyan-500/20 bg-cyan-500/5 my-4">
                  <h4 className="font-heading font-bold text-sm mb-2 flex items-center gap-2" style={{ color: 'var(--q-text)' }}>
                    <Sparkles className="h-4 w-4" style={{ color: 'var(--q-cyan)' }} />
                    Learning Objectives
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs font-mono" style={{ color: 'var(--q-muted)' }}>
                    {currentTopic.content.learningObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar quick tools */}
            <div className="space-y-4">
              <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-3" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
                <h4 className="font-heading text-sm font-bold flex items-center gap-2" style={{ color: 'var(--q-text)' }}>
                  <Download className="h-4 w-4 text-[var(--q-cyan)]" />
                  Study Resources
                </h4>
                <p className="text-xs text-[var(--q-muted)]">Download lecture slides and mathematical notes for this topic.</p>
                {currentTopic.content.notesUrl && (
                  <a
                    href={currentTopic.content.notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-all hover:bg-white/5"
                    style={{ borderColor: 'var(--q-line)', color: 'var(--q-text)' }}
                  >
                    <span>PDF Lecture Notes</span>
                    <Download className="h-3.5 w-3.5 text-cyan-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Visual */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            <BlochSphere qubitLabel={`Topic: ${currentTopic.title}`} interactive={true} />
            <div className="text-center pt-2">
              <Link
                href="/simulator"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/20"
                style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}
              >
                <span>Open in Quantum Simulator</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 3: Video */}
        {activeTab === 'video' && (
          <div className="rounded-3xl border p-6 backdrop-blur-xl space-y-4" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
              {currentTopic.content.videoUrl ? (
                <iframe
                  src={currentTopic.content.videoUrl}
                  title={currentTopic.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-xs text-[var(--q-muted)]">No video lecture available for this topic.</div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--q-muted)] pt-2">
              <span>Duration: {currentTopic.estimatedTime}</span>
              <span>Curated by MIT & Qiskit Education</span>
            </div>
          </div>
        )}

        {/* Tab 4: Practice */}
        {activeTab === 'practice' && (
          <div className="rounded-3xl border p-6 sm:p-8 backdrop-blur-xl space-y-6" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--q-line)' }}>
              <div>
                <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--q-text)' }}>Checkpoint Concept Quiz</h3>
                <p className="text-xs text-[var(--q-muted)]">Test your comprehension before unlocking the next topic module.</p>
              </div>
              <Link
                href={`/quiz/${currentTopic.id}`}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/20"
                style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}
              >
                <span>Launch Quiz</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
