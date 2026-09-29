'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, FlaskConical, Lock, Orbit, Pill, Sparkles, Zap } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { LearningHero, QuantumConceptCard } from '@/components/learning'
import { useLearningJourney } from '@/lib/learning/use-learning-journey'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE, LEARNING_GRADIENT_BUTTON_STYLE } from '@/lib/learning/styles'

const STORY_BEATS = [
  {
    year: 'Today',
    title: 'Everyday computers',
    body: 'Phones, laptops, and data centres work by flipping billions of tiny switches that are either off or on.',
  },
  {
    year: 'The idea',
    title: 'Nature already does this',
    body: 'The tiniest pieces of the world do not always pick a single answer until something looks. Researchers asked: can we compute with that?',
  },
  {
    year: 'Now',
    title: 'Early machines exist',
    body: 'Laboratories and companies already run small versions of these machines. They are not replacements for your laptop. They are a new tool for special puzzles.',
  },
  {
    year: 'Next',
    title: 'A skill worth learning',
    body: 'You do not need to become a physicist overnight. You only need a feel for chance, choice, and why some problems are unusually hard.',
  },
]

export default function LearnIntroPage() {
  const { markActivity } = useLearningJourney()

  useEffect(() => {
    markActivity('intro_started')
  }, [markActivity])

  const completeAndContinue = () => {
    markActivity('intro_completed')
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl py-4 space-y-10">
        <LearningHero
          eyebrow="Stage 0 · Introduction"
          title="A new way to compute, told simply"
          subtitle="Quantum computing is not magic, and it is not a faster phone. It is a different kind of machine, built to explore many possibilities at once for problems that stall ordinary computers."
        />

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-white">What is quantum computing?</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <QuantumConceptCard
              icon={<Sparkles className="h-5 w-5" />}
              title="A computer that works with possibility"
              body="Ordinary computers keep a definite answer at every step. These new machines can hold a blend of answers while they work, then settle on one when we check the result."
            />
            <QuantumConceptCard
              icon={<Orbit className="h-5 w-5" />}
              accent="violet"
              title="Inspired by the smallest pieces of nature"
              body="Light, atoms, and other tiny things do not always behave like billiard balls. Engineers learned to treat that behaviour as a resource, not a nuisance."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-white">Why does it matter?</h2>
          <div
            className={`${LEARNING_CARD_CLASS} relative overflow-hidden`}
            style={{
              borderColor: 'var(--q-line)',
              background:
                'linear-gradient(135deg, color-mix(in oklch, var(--q-bg-deep) 90%, transparent), color-mix(in oklch, var(--q-violet) 12%, transparent))',
            }}
          >
            <div className="pointer-events-none absolute right-8 top-6 h-16 w-16 rounded-full q-nucleus opacity-40" style={{ background: 'var(--q-cyan)' }} />
            <p className="relative max-w-3xl text-sm text-[var(--q-muted)] leading-relaxed">
              Some puzzles grow so quickly that even the largest supercomputers would need longer than a human lifetime. Finding the best route among huge choices, testing how a new medicine might fold, or protecting information against future machines all sit in that family. A quantum computer will not do your email faster. It may help with those rare, enormous searches.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-white">A short story of the idea</h2>
          <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
            {STORY_BEATS.map((beat) => (
              <div key={beat.title} className="relative">
                <div className="absolute -left-6 sm:-left-8 top-6 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[var(--q-cyan)] bg-[var(--q-cyan)]/20">
                  <span className="h-2 w-2 rounded-full bg-[var(--q-cyan)] q-nucleus" />
                </div>
                <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--q-cyan)]">{beat.year}</p>
                  <h3 className="font-heading mt-1 text-base font-bold text-white">{beat.title}</h3>
                  <p className="mt-1 text-sm text-[var(--q-muted)] leading-relaxed">{beat.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-white">Real-world applications</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <QuantumConceptCard
              icon={<Pill className="h-5 w-5" />}
              accent="emerald"
              title="Drug discovery"
              body="Medicines work because molecules fit together in precise ways. Searching those shapes is brutally hard. New machines may help researchers try promising combinations sooner."
            />
            <QuantumConceptCard
              icon={<Orbit className="h-5 w-5" />}
              accent="cyan"
              title="Optimization"
              body="Airlines, factories, and energy grids all hunt for the best arrangement among millions of options. A different kind of search can mean less waste and better plans."
            />
            <QuantumConceptCard
              icon={<Lock className="h-5 w-5" />}
              accent="amber"
              title="Cybersecurity"
              body="Today’s secret codes assume certain puzzles stay hard. Future machines could change that. Learning this field early helps people design safer ways to protect data."
            />
            <QuantumConceptCard
              icon={<FlaskConical className="h-5 w-5" />}
              accent="violet"
              title="Future technologies"
              body="Better materials, smarter sensors, and new kinds of scientific instruments all sit on the horizon. The first step is intuition, not a laboratory."
            />
          </div>
        </section>

        <section
          className={`${LEARNING_CARD_CLASS} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
          style={LEARNING_CARD_STYLE}
        >
          <div>
            <div className="flex items-center gap-2 text-[var(--q-cyan)] mb-1">
              <Zap className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wider">Next up</p>
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Try a tiny experiment</h3>
            <p className="mt-1 text-sm text-[var(--q-muted)]">Stage 1 and Stage 2 live in the playground. Coins, switches, and chance — still no formulas.</p>
          </div>
          <Link
            href="/learn/playground"
            onClick={completeAndContinue}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold text-black shrink-0"
            style={LEARNING_GRADIENT_BUTTON_STYLE}
          >
            Continue to playground
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </AppShell>
  )
}
