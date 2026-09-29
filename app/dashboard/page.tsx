'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Compass,
  Trophy,
  Flame,
  Award,
  ArrowRight,
  Sparkles,
  Cpu,
  Bot,
  Library,
  AlertTriangle,
  PlayCircle,
  Activity,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { DASHBOARD_ANALYTICS, fetchDashboardAnalyticsServer } from '@/lib/api/dashboard'
import { fetchLearningPathServer, LearningPathItem } from '@/lib/api/learning-path'
import { supabase } from '@/backend/supabase-client'
import { useAuth } from '@/lib/auth-context'
import { AppShell } from '@/components/layout/AppShell'
import { LearningProgressCard } from '@/components/learning'
import { getContinueHref, getContinueLabel, getLearningPercent } from '@/lib/learning/progress'
import { useLearningProgress } from '@/lib/learning/use-learning-progress'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE, LEARNING_GRADIENT_BUTTON_STYLE } from '@/lib/learning/styles'

export default function DashboardPage() {
  const { user } = useAuth()
  const { progress } = useLearningProgress()
  const journeyContinueHref = getContinueHref(progress)
  const journeyContinueLabel = getContinueLabel(progress)
  const [analytics, setAnalytics] = useState(DASHBOARD_ANALYTICS)
  const [nextTopic, setNextTopic] = useState(DASHBOARD_ANALYTICS.nextRecommendedTopic)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch dashboard analytics from API
        const { data: dashData } = await fetchDashboardAnalyticsServer(user.id)
        if (dashData) {
          setAnalytics(dashData)
        }

        // Fetch user's personalized learning path from Edge Function
        const { data: pathItems } = await fetchLearningPathServer(user.id)
        if (pathItems && pathItems.length > 0) {
          // Find first uncompleted or active topic
          const activeItem = pathItems.find((item: LearningPathItem) => item.status === 'in_progress' || item.status === 'available') || pathItems[0]
          if (activeItem?.topic) {
            setNextTopic({
              id: activeItem.topic.id,
              title: activeItem.topic.name,
              category: activeItem.topic.category,
              estimatedTime: activeItem.topic.videoDuration || '25 mins',
              reason: activeItem.isWeakPriority
                ? `Prioritized revision for your diagnostic focus area: ${activeItem.topic.category}`
                : activeItem.topic.description,
            })
          }
        }

        // Fetch recent quiz attempts to enrich progress history
        const { data: quizAttempts } = await supabase
          .from('quiz_attempts')
          .select('scorePercent, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(7)

        if (quizAttempts && quizAttempts.length > 0) {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          const updatedHistory = quizAttempts.map((qa: any, idx: number) => ({
            day: days[idx % days.length],
            progress: Number(qa.scorePercent) || user.overallProgress,
            score: Number(qa.scorePercent) || 80,
          }))
          setAnalytics((prev) => ({
            ...prev,
            progressHistory: updatedHistory,
          }))
        }
      } catch (err) {
        console.warn('Using mock dashboard analytics:', err)
      }
    }

    loadDashboardData()
  }, [user.id, user.overallProgress])

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl py-4 space-y-8">
        {/* Welcome Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--q-line)' }}>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--q-cyan)] border mb-2" style={{ borderColor: 'color-mix(in oklch, var(--q-cyan) 30%, transparent)' }}>
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Quantum Workspace Active
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="mt-1 text-sm text-[var(--q-muted)]">
              Proficiency Tier: <strong className="text-[var(--q-cyan)]">{user.level}</strong> • Current Streak: <strong className="text-amber-400">{user.streak} Days 🔥</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/learn"
              className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/5"
              style={{ borderColor: 'var(--q-line)' }}
            >
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              <span>Learning Hub</span>
            </Link>

            <Link
              href="/simulator"
              className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/5"
              style={{ borderColor: 'var(--q-line)' }}
            >
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>Launch Simulator</span>
            </Link>

            <Link
              href="/tutor"
              className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 shadow-xl shadow-cyan-500/20"
              style={{
                background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
              }}
            >
              <Bot className="h-4 w-4" />
              <span>Ask Quanta AI</span>
            </Link>
          </div>
        </div>

        {/* User Status & Progress Bar (Moved from Sidebar) */}
        <div className="rounded-3xl border p-5 backdrop-blur-xl" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[var(--q-muted)] font-medium">Level:</span>
                <span
                  className="rounded-md px-2.5 py-0.5 font-semibold"
                  style={{
                    background: 'color-mix(in oklch, var(--q-violet) 25%, transparent)',
                    color: 'var(--q-cyan)',
                  }}
                >
                  {user.level}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
                <Flame className="h-4 w-4" />
                <span>{user.streak}d streak</span>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-[var(--q-muted)] font-medium">Course Progress: </span>
              <span className="font-bold text-white">{user.overallProgress}%</span>
            </div>
          </div>
          
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${user.overallProgress}%`,
                background: 'linear-gradient(90deg, var(--q-cyan), var(--q-violet))',
              }}
            />
          </div>
        </div>

        {/* Beginner Learning Journey — additive; does not replace simulator or topic CTAs */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[var(--q-cyan)]" />
              <h2 className="font-heading text-base font-bold text-white">Learning Journey</h2>
            </div>
            <LearningProgressCard
              percent={getLearningPercent(progress)}
              continueHref={journeyContinueHref}
              continueLabel={journeyContinueLabel}
            />
          </div>
          <Link href="/learn/intro" className={`${LEARNING_CARD_CLASS} hover:bg-white/5`} style={LEARNING_CARD_STYLE}>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-[var(--q-cyan)] mb-3">
              <BookOpen className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--q-cyan)]">Start Learning</p>
            <h3 className="font-heading mt-1 text-lg font-bold text-white">Introduction to Quantum Computing</h3>
            <p className="mt-2 text-xs text-[var(--q-muted)] leading-relaxed">
              Stage 0 for complete beginners. Plain language, no formulas, no circuit editor.
            </p>
          </Link>
          <Link href={journeyContinueHref} className={`${LEARNING_CARD_CLASS} text-black`} style={LEARNING_GRADIENT_BUTTON_STYLE}>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black/15 mb-3">
              <ArrowRight className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/70">Continue Learning</p>
            <h3 className="font-heading mt-1 text-lg font-bold">Pick up the beginner path</h3>
            <p className="mt-2 text-xs text-black/70 leading-relaxed">
              Resume Stage 0 or jump into the interactive playground. Existing topics and quizzes are unchanged.
            </p>
          </Link>
        </div>

        {/* Simulator Academy Foundation */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[var(--q-cyan)]" />
              <h2 className="font-heading text-base font-bold text-white">Simulator Academy</h2>
            </div>
            <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
              <h3 className="font-heading text-base font-bold text-white mb-2">Build circuits. Master algorithms.</h3>
              <p className="text-xs text-[var(--q-muted)] mb-4">Complete guided missions to learn the simulator mechanics, then tackle open-ended challenges.</p>
              <Link
                href="/academy"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 shadow-xl shadow-cyan-500/20"
                style={LEARNING_GRADIENT_BUTTON_STYLE}
              >
                Continue Academy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Top 4 Core Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Diagnostic Assessment Level */}
          <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-3" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--q-muted)]">Diagnostic Level</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-[var(--q-cyan)]">
                <Compass className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">{user.level}</p>
              <p className="text-xs text-[var(--q-muted)] mt-1">Based on diagnostic evaluation</p>
            </div>
          </div>

          {/* Card 2: Overall Curriculum Progress */}
          <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-3" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--q-muted)]">Curriculum Progress</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="font-heading text-2xl font-bold text-white">{user.overallProgress}%</p>
                <span className="text-[10px] text-emerald-400 font-bold">In Progress</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${user.overallProgress}%`, background: 'linear-gradient(90deg, var(--q-cyan), var(--q-violet))' }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Active Streak */}
          <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-3" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--q-muted)]">Daily Streak</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">{user.streak} Days</p>
              <p className="text-xs text-amber-400/90 mt-1">Active streak bonus active 🔥</p>
            </div>
          </div>

          {/* Card 4: Checkpoint Quiz Average */}
          <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-3" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--q-muted)]">Quiz Average</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">{user.quizAverage}%</p>
              <p className="text-xs text-emerald-400 mt-1">Across completed topic checkpoints</p>
            </div>
          </div>
        </div>

        {/* Personalized Learning Recommendation & Diagnostic Alert */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Recommended Action (2 cols) */}
          <div
            className="rounded-3xl border p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 lg:col-span-2 relative overflow-hidden"
            style={{
              borderColor: 'var(--q-line)',
              background: 'linear-gradient(135deg, color-mix(in oklch, var(--q-bg-deep) 90%, transparent), color-mix(in oklch, var(--q-cyan) 12%, transparent))',
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 text-xs font-bold">
                  Recommended Next Focus
                </span>
                <span className="text-xs text-[var(--q-muted)]">
                  Est. {nextTopic.estimatedTime}
                </span>
              </div>

              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                {nextTopic.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                {nextTopic.reason}
              </p>
            </div>

            <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--q-line)' }}>
              <span className="text-xs font-semibold text-cyan-300">Category: {nextTopic.category}</span>
              <Link
                href={`/topic/${nextTopic.id}`}
                className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 shadow-xl shadow-cyan-500/20"
                style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}
              >
                <span>Continue Learning</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Weak Topics Alert Card (1 col) */}
          <div className="rounded-3xl border p-6 backdrop-blur-xl flex flex-col justify-between space-y-4" style={{ borderColor: 'color-mix(in oklch, #F59E0B 40%, transparent)', background: 'color-mix(in oklch, #F59E0B 8%, transparent)' }}>
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-heading text-base font-bold text-white">Focus Revision Topics</h3>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Your diagnostic assessment identified key areas requiring revision to reach mastery.
              </p>
            </div>

            <div className="space-y-2">
              {((user?.weakTopics && user.weakTopics.length > 0) ? user.weakTopics : ['Quantum Algorithms', 'Circuit Design']).map((wt) => (
                <div key={wt} className="rounded-xl border border-amber-500/30 bg-black/30 p-2.5 text-xs font-semibold text-amber-300 flex justify-between items-center">
                  <span>{wt}</span>
                  <span className="text-[10px] text-amber-400">Needs Practice</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts & Analytics Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart 1: Progress History */}
          <div className="rounded-3xl border p-6 backdrop-blur-xl space-y-4" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--q-line)' }}>
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--q-cyan)]" />
                Weekly Learning Progress
              </h3>
              <span className="text-xs text-[var(--q-muted)]">Last 7 Days</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.progressHistory || []}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--q-cyan)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--q-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="var(--q-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--q-muted)" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5, 7, 15, 0.95)',
                      borderColor: 'var(--q-line)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="progress" stroke="var(--q-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorProgress)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Performance Breakdown */}
          <div className="rounded-3xl border p-6 backdrop-blur-xl space-y-4" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--q-line)' }}>
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-[var(--q-violet)]" />
                Category Mastery Breakdown
              </h3>
              <span className="text-xs text-[var(--q-muted)]">Diagnostic Accuracy</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryPerformance || []} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="var(--q-muted)" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <YAxis dataKey="category" type="category" stroke="var(--q-muted)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5, 7, 15, 0.95)',
                      borderColor: 'var(--q-line)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                    {(analytics.categoryPerformance || []).map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score > 70 ? 'var(--q-cyan)' : 'var(--q-violet)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
