import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { LEARNING_GRADIENT_BUTTON_STYLE } from '@/lib/learning/styles'

export function LearningHero({
  eyebrow,
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string
  title: string
  subtitle: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <div
      className="rounded-3xl border p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden"
      style={{
        borderColor: 'var(--q-line)',
        background:
          'linear-gradient(135deg, color-mix(in oklch, var(--q-bg-deep) 90%, transparent), color-mix(in oklch, var(--q-cyan) 12%, transparent))',
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full q-float opacity-40"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklch, var(--q-violet) 40%, transparent), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute right-16 bottom-0 h-24 w-24 rounded-full q-nucleus opacity-30"
        style={{
          background: 'radial-gradient(circle, color-mix(in oklch, var(--q-cyan) 50%, transparent), transparent 70%)',
        }}
      />

      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--q-cyan)] border mb-3"
        style={{ borderColor: 'color-mix(in oklch, var(--q-cyan) 30%, transparent)' }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </span>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white relative">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--q-muted)] leading-relaxed relative">{subtitle}</p>

      {(primaryHref || secondaryHref) && (
        <div className="mt-6 flex flex-wrap items-center gap-3 relative">
          {primaryHref && primaryLabel && (
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 shadow-xl shadow-cyan-500/20"
              style={LEARNING_GRADIENT_BUTTON_STYLE}
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/5"
              style={{ borderColor: 'var(--q-line)' }}
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
