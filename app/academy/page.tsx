'use client'

import React, { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { AcademyHero, AcademyStats, MissionPath } from '@/components/academy'
import { AcademyState } from '@/lib/academy/academy-types'
import { defaultAcademyState, LocalAcademyStorage } from '@/lib/academy/academy-progress'

export default function AcademyPage() {
  const [state, setState] = useState<AcademyState>(defaultAcademyState())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    LocalAcademyStorage.getState().then((s) => {
      setState(s)
      setReady(true)
    })
  }, [])

  if (!ready) return null

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl py-4 space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AcademyHero />
          </div>
          <div>
            <AcademyStats state={state} />
          </div>
        </div>
        <MissionPath state={state} />
      </div>
    </AppShell>
  )
}
