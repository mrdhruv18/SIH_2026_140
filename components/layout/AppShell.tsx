'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Atom,
  LayoutDashboard,
  Compass,
  BookOpen,
  GraduationCap,
  Library,
  BookMarked,
  Cpu,
  Bot,
  FileQuestion,
  Trophy,
  User,
  ShieldCheck,
  Menu,
  X,
  Bell,
  ChevronRight,
  LogOut,
  Flame,
  Sparkles,
  MessageSquare,
  Globe,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Starfield } from '@/components/starfield'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  adminOnly?: boolean
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null)

  // Reset optimistic path state whenever pathname updates
  React.useEffect(() => {
    if (optimisticPath !== null) {
      console.log(`[AppShell Navigation] Route transition completed. Active pathname: "${pathname}" at ${Date.now()}ms`)
      setOptimisticPath(null)
    }
  }, [pathname, optimisticPath])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    console.log(`[AppShell Navigation] CLICK REGISTERED for "${label}" -> "${href}" at ${Date.now()}ms`)
    setOptimisticPath(href)
    setMobileOpen(false)
    router.push(href)
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Learning Hub', href: '/learn', icon: <GraduationCap className="h-4 w-4" />, badge: 'Beginner' },
    { label: 'Learning Path', href: '/path', icon: <Compass className="h-4 w-4" /> },
    { label: 'Learn', href: '/topic/qubits', icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Resources', href: '/resources', icon: <Library className="h-4 w-4" /> },
    { label: 'Books', href: '/books', icon: <BookMarked className="h-4 w-4" /> },
    { label: 'Quantum Simulator', href: '/simulator', icon: <Cpu className="h-4 w-4" />, badge: 'Interactive' },
    { label: 'Quanta AI', href: '/tutor', icon: <Bot className="h-4 w-4" />, badge: 'AI' },
    { label: 'Quizzes', href: '/quiz/qubits', icon: <FileQuestion className="h-4 w-4" /> },
    { label: 'Achievements', href: '/achievements', icon: <Trophy className="h-4 w-4" /> },
    { label: 'Community', href: '/discussions', icon: <MessageSquare className="h-4 w-4" />, badge: 'New' },
    { label: 'Profile', href: '/profile', icon: <User className="h-4 w-4" /> },
    { label: 'Admin Portal', href: '/admin', icon: <ShieldCheck className="h-4 w-4" />, adminOnly: true },
    { label: 'Quantum Hub', href: '/events', icon: <Globe className="h-4 w-4" />, badge: 'New' },
  ]

  const filteredNav = navItems.filter((item) => !item.adminOnly || user.role === 'admin')

  // Derive breadcrumbs
  const currentActivePath = optimisticPath ?? pathname
  const segments = currentActivePath.split('/').filter(Boolean)
  const breadcrumbText = segments.length > 0
    ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
    : 'Dashboard'

  return (
    <div
      className="quantum relative min-h-screen text-[var(--q-text)]"
      style={{ background: 'var(--q-bg)' }}
    >
      <Starfield className="pointer-events-none fixed inset-0 z-0 opacity-40" />

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside
          className="sticky top-0 h-screen hidden w-64 flex-col border-r backdrop-blur-xl lg:flex"
          style={{
            borderColor: 'var(--q-line)',
            background: 'color-mix(in oklch, var(--q-bg-deep) 88%, transparent)',
          }}
        >
          {/* Logo Header */}
          <div className="flex h-16 items-center justify-between border-b px-5" style={{ borderColor: 'var(--q-line)' }}>
            <Link href="/dashboard" onClick={(e) => handleNavClick(e, '/dashboard', 'Dashboard Logo')} className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
                  boxShadow: '0 0 20px color-mix(in oklch, var(--q-violet) 60%, transparent)',
                }}
              >
                <Atom className="h-5 w-5 text-[var(--q-bg-deep)]" />
              </span>
              <span className="font-heading text-lg font-bold tracking-tight">Quantify</span>
            </Link>

            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--q-cyan)] border"
              style={{ borderColor: 'color-mix(in oklch, var(--q-cyan) 30%, transparent)' }}
            >
              SIH26140
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {filteredNav.map((item) => {
              const isActive = currentActivePath === item.href || (item.href !== '/dashboard' && currentActivePath.startsWith(item.href))
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={true}
                  onClick={(e) => handleNavClick(e, item.href, item.label)}
                  className={`group flex items-center justify-between rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'text-black font-semibold shadow-lg'
                      : 'text-[var(--q-muted)] hover:text-white hover:bg-white/10'
                  }`}
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
                          boxShadow: '0 0 20px color-mix(in oklch, var(--q-violet) 40%, transparent)',
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-black' : 'text-[var(--q-cyan)] group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span
                      className="pointer-events-none rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        background: 'color-mix(in oklch, var(--q-cyan) 15%, transparent)',
                        color: 'var(--q-cyan)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Role Switcher Demo Control & Footer Profile */}
          <div className="border-t p-3 space-y-2" style={{ borderColor: 'var(--q-line)' }}>
            <div className="flex items-center justify-between rounded-xl border p-2 text-xs" style={{ borderColor: 'var(--q-line)', background: 'var(--q-bg-deep)' }}>
              <span className="text-[var(--q-muted)] font-medium">Demo Mode Role:</span>
              <button
                onClick={() => updateUser({ role: user.role === 'admin' ? 'student' : 'admin' })}
                className="rounded-md px-2 py-1 font-semibold transition-colors hover:text-white"
                style={{
                  background: user.role === 'admin' ? 'var(--q-violet)' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              >
                {user.role === 'admin' ? '👑 Admin' : '🎓 Student'}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl p-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-black"
                  style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[var(--q-muted)] truncate max-w-[110px]">{user.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const { supabase } = await import('@/backend/supabase-client')
                  await supabase.auth.signOut()
                  router.push('/login')
                }}
                className="rounded-lg p-1.5 text-[var(--q-muted)] hover:text-red-400 hover:bg-white/5 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Header Drawer Backdrop */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
            <div
              className="h-full w-72 flex-col border-r backdrop-blur-2xl flex p-4"
              style={{
                borderColor: 'var(--q-line)',
                background: 'var(--q-bg-deep)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--q-line)' }}>
                <Link href="/dashboard" onClick={(e) => handleNavClick(e, '/dashboard', 'Mobile Logo')} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}>
                    <Atom className="h-4 w-4 text-black" />
                  </span>
                  <span className="font-heading font-bold">Quantify</span>
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button onClick={() => setMobileOpen(false)} className="p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                {filteredNav.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={true}
                    onClick={(e) => handleNavClick(e, item.href, item.label)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                      currentActivePath === item.href ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="pointer-events-none flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top Bar */}
          <header
            className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-5 backdrop-blur-xl"
            style={{
              borderColor: 'var(--q-line)',
              background: 'color-mix(in oklch, var(--q-bg-deep) 80%, transparent)',
            }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border p-2 text-[var(--q-muted)] hover:text-white lg:hidden"
                style={{ borderColor: 'var(--q-line)' }}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm font-medium">
                <Link href="/dashboard" className="text-[var(--q-muted)] hover:text-[var(--q-cyan)] transition-colors">
                  Quantify
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="font-heading font-bold text-white">{breadcrumbText}</span>
              </div>
            </div>

            {/* Right Topbar Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {/* Quick AI Tutor Shortcut */}
              <Link
                href="/tutor"
                className="hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                style={{
                  borderColor: 'color-mix(in oklch, var(--q-cyan) 40%, transparent)',
                  background: 'color-mix(in oklch, var(--q-cyan) 10%, transparent)',
                  color: 'var(--q-cyan)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>Ask Quanta AI</span>
              </Link>

              {/* Notifications Popup Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen((v) => !v)}
                  className="relative rounded-full border p-2 text-[var(--q-muted)] hover:text-white transition-colors"
                  style={{ borderColor: 'var(--q-line)' }}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400" />
                </button>

                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-2xl z-50"
                    style={{
                      borderColor: 'var(--q-line)',
                      background: 'var(--q-bg-deep)',
                    }}
                  >
                    <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--q-line)' }}>
                      <h4 className="font-heading text-sm font-bold">Notifications</h4>
                      <span className="text-[10px] text-cyan-400 font-semibold">2 New</span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="rounded-xl border p-2.5" style={{ borderColor: 'var(--q-line)', background: 'rgba(255,255,255,0.03)' }}>
                        <p className="font-semibold text-white">Assessment Complete!</p>
                        <p className="text-[var(--q-muted)] mt-0.5">Your level has been calculated as Intermediate.</p>
                      </div>
                      <div className="rounded-xl border p-2.5" style={{ borderColor: 'var(--q-line)', background: 'rgba(255,255,255,0.03)' }}>
                        <p className="font-semibold text-white">New Circuit Simulator Mode</p>
                        <p className="text-[var(--q-muted)] mt-0.5">PennyLane and Qiskit Aer execution backends available.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar Button */}
              <Link href="/profile" className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-black text-xs"
                  style={{ background: 'linear-gradient(135deg, var(--q-cyan), var(--q-violet))' }}
                >
                  {user.name.charAt(0)}
                </div>
              </Link>
            </div>
          </header>

          {/* Main Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
