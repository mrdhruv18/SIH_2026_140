'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Atom, Menu, X } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'

import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Resources', href: '#resources' },
  { label: 'Testimonials', href: '#testimonials' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const isScrolled = useScrollPosition(20)

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      <div
        className={`border-b transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-2xl shadow-lg border-opacity-100'
            : 'backdrop-blur-xl border-opacity-60'
        }`}
        style={{
          borderColor: 'var(--q-line)',
          background: isScrolled
            ? 'color-mix(in oklch, var(--q-bg-deep) 90%, transparent)'
            : 'color-mix(in oklch, var(--q-bg-deep) 82%, transparent)',
          boxShadow: isScrolled
            ? '0 8px 32px -8px color-mix(in oklch, var(--q-bg-deep) 80%, transparent)'
            : 'none',
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="#home" className="flex items-center gap-2.5 transition-transform duration-150 active:scale-95">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
                boxShadow:
                  '0 0 20px color-mix(in oklch, var(--q-violet) 60%, transparent)',
              }}
            >
              <Atom className="h-5 w-5" style={{ color: 'var(--q-bg-deep)' }} />
            </span>
            <span className="font-heading text-lg font-bold tracking-tight">
              Quantica
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-[var(--q-cyan)]"
                style={{ color: 'var(--q-muted)' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:text-[var(--q-cyan)]"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all duration-150 hover:scale-[1.03] active:scale-95"
              style={{
                background:
                  'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
                color: 'var(--q-bg-deep)',
                boxShadow:
                  '0 0 24px color-mix(in oklch, var(--q-violet) 50%, transparent)',
              }}
            >
              Get Started
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="relative h-9 w-9 flex items-center justify-center transition-transform duration-150 active:scale-95"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <Menu
                className={`absolute h-6 w-6 transition-all duration-250 ${
                  open ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              <X
                className={`absolute h-6 w-6 transition-all duration-250 ${
                  open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Smooth CSS Grid Height Transition for Mobile Menu */}
        <div
          className={`grid transition-[grid-template-rows] duration-250 ease-out md:hidden ${
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div
              className="border-t px-5 py-4"
              style={{ borderColor: 'var(--q-line)' }}
            >
              <nav className="flex flex-col gap-4">
                {NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium"
                    style={{ color: 'var(--q-muted)' }}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-full border py-2 text-center text-sm font-medium transition-transform duration-150 active:scale-95"
                    style={{ borderColor: 'var(--q-line)' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="flex-1 rounded-full py-2 text-center text-sm font-semibold transition-transform duration-150 active:scale-95"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
                      color: 'var(--q-bg-deep)',
                    }}
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
