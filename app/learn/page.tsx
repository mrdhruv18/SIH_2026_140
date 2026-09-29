'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen, Compass } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { LearningHero, LearningProgressCard, JourneyTimeline, QuantumConceptCard, AchievementList } from '@/components/learning'
import { calculateOverallProgress, determineNextStep } from '@/lib/learning/learning-milestones'
import { useLearningJourney } from '@/lib/learning/use-learning-journey'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE, LEARNING_GRADIENT_BUTTON_STYLE } from '@/lib/learning/styles'

export default function LearningHubPage() {
  const { state, ready } = useLearningJourney()
  
  if (!ready) return null // simple loading state

  const percent = calculateOverallProgress(state)
  const nextStep = determineNextStep(state)

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl py-4 space-y-8">
        <LearningHero
          eyebrow="Learning Hub"
          title="Welcome to Quantum Computing"
          subtitle="A calm path for complete beginners. No formulas. No dense notation. Just pictures, stories, and small experiments that build intuition before you ever open a circuit."
          primaryHref={nextStep.href}
          primaryLabel={nextStep.title}
          secondaryHref="/learn/intro"
          secondaryLabel="Start from Stage 0"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-heading text-xl font-bold text-white">Your Journey</h2>
            <JourneyTimeline state={state} />
          </div>
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-white">Progress & Stats</h2>
            <LearningProgressCard 
              percent={percent} 
              timeSpentSeconds={state.timeSpentSeconds}
              continueHref={nextStep.href} 
              continueLabel={nextStep.title} 
            />
            <AchievementList state={state} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <QuantumConceptCard
            icon={<BookOpen className="h-5 w-5" />}
            accent="cyan"
            title="Built for first-timers"
            body="Each stage uses everyday pictures: coins, light switches, and chance. You will not need university physics to start."
          />
          <QuantumConceptCard
            icon={<Compass className="h-5 w-5" />}
            accent="violet"
            title="Future Compatibility"
            body="This progress engine uses a distinct storage layer with interfaces ready for Supabase migration when requested."
          />
        </div>
      </div>
    </AppShell>
  )
}
