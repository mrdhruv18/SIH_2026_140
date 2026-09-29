'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import {
  ClassicalBitDemo,
  CoinFlipDemo,
  LearningHero,
  ProbabilityVisualizer,
  QuantumBitDemo,
  SuperpositionVisualizer,
} from '@/components/learning'
import { useLearningJourney } from '@/lib/learning/use-learning-journey'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export default function LearnPlaygroundPage() {
  const { markActivity } = useLearningJourney()
  const [chanceOfOne, setChanceOfOne] = useState(0.5)
  const [lookHistory, setLookHistory] = useState<Array<0 | 1>>([])

  useEffect(() => {
    markActivity('playground_visited')
  }, [markActivity])

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl py-4 space-y-8">
        <LearningHero
          eyebrow="Stage 1 + Stage 2 · Playground"
          title="Classical vs quantum, by playing"
          subtitle="Start with a coin and a light switch. Then meet a switch that can hold a mix until you look. Everything here runs in your browser. Nothing is sent to a server."
          secondaryHref="/learn"
          secondaryLabel="Back to Learning Hub"
        />

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-white">Stage 1 · Everyday chance</h2>
          <p className="text-sm text-[var(--q-muted)] max-w-3xl">
            Classical computers are definite. A switch is off or on. Randomness, when we use it, comes from things like coin flips — many tries, then a pattern appears.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <CoinFlipDemo onInteract={() => markActivity('coin_flip_explored')} />
            <ClassicalBitDemo onInteract={() => markActivity('classical_bit_explored')} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-white">Stage 2 · A mix, then a look</h2>
          <p className="text-sm text-[var(--q-muted)] max-w-3xl">
            Set how much of the mix leans toward on. Watch the two circles change. Then look. You always get a single answer. Repeat, and the answers should start matching the mix you chose.
          </p>

          <div className={`${LEARNING_CARD_CLASS}`} style={LEARNING_CARD_STYLE}>
            <label htmlFor="mix-slider" className="text-xs font-semibold text-[var(--q-muted)]">
              Mix toward 1 (on): {Math.round(chanceOfOne * 100)}%
            </label>
            <input
              id="mix-slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(chanceOfOne * 100)}
              onChange={(e) => {
                markActivity('superposition_explored')
                setChanceOfOne(Number(e.target.value) / 100)
                setLookHistory([])
              }}
              className="mt-3 w-full accent-[var(--q-cyan)]"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SuperpositionVisualizer chanceOfOne={chanceOfOne} />
            <QuantumBitDemo
              chanceOfOne={chanceOfOne}
              onLook={(result) => {
                markActivity('quantum_bit_explored')
                setLookHistory((prev) => {
                  const newHist = [...prev.slice(-19), result]
                  if (newHist.length >= 5) markActivity('probability_explored')
                  return newHist
                })
              }}
            />
          </div>
          <ProbabilityVisualizer chanceOfOne={chanceOfOne} lookHistory={lookHistory} />
        </section>

        <div className={`${LEARNING_CARD_CLASS} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`} style={LEARNING_CARD_STYLE}>
          <div>
            <p className="font-heading text-base font-bold text-white">Stage 3 is on the map</p>
            <p className="text-xs text-[var(--q-muted)] mt-1">Qubit fundamentals will open later. The hub, topics, and simulator are unchanged.</p>
          </div>
          <Link href="/learn" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--q-cyan)]">
            Return to hub <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
