import React from 'react'
import { BeginnerJourneyState } from '@/lib/learning/learning-state'
import { BEGINNER_ACHIEVEMENTS } from '@/lib/learning/learning-achievements'
import { LEARNING_CARD_CLASS, LEARNING_CARD_STYLE } from '@/lib/learning/styles'

export function AchievementList({ state }: { state: BeginnerJourneyState }) {
  return (
    <div className={LEARNING_CARD_CLASS} style={LEARNING_CARD_STYLE}>
      <h3 className="font-heading text-base font-bold text-white mb-4">Achievements</h3>
      <div className="space-y-3">
        {BEGINNER_ACHIEVEMENTS.map((achievement) => {
          const unlocked = state.unlockedAchievements.includes(achievement.id)
          return (
            <div key={achievement.id} className={`flex items-center gap-3 p-2 rounded-xl ${unlocked ? 'bg-white/5' : 'opacity-40'}`}>
              <div className="text-2xl">{achievement.icon}</div>
              <div>
                <p className="text-sm font-bold text-white">{achievement.title}</p>
                <p className="text-[10px] text-[var(--q-muted)]">{achievement.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
