'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import { supabase } from '@/backend/supabase-client'

type Mode = 'login' | 'register' | 'forgot'

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')

  const isLogin = mode === 'login'
  const isForgot = mode === 'forgot'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (isForgot) {
      if (!email) {
        setError('Please enter your email address.')
        setSubmitting(false)
        return
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setResetSent(true)
      }
      setSubmitting(false)
      return
    }

    if (isLogin) {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setSubmitting(false)
        return
      }

      document.cookie = 'quantify_session=active; path=/; max-age=604800; SameSite=Lax'

      // Check profile status
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('assessmentCompleted')
          .eq('id', data.user.id)
          .single()

        if (profile?.assessmentCompleted) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      } else {
        router.push('/dashboard')
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setSubmitting(false)
        return
      }

      document.cookie = 'quantify_session=active; path=/; max-age=604800; SameSite=Lax'

      // Retry up to 5 times with 500ms delay for profile creation race condition
      if (data?.user) {
        let profileFound = false
        for (let attempt = 0; attempt < 5; attempt++) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle()
          
          if (profile) {
            profileFound = true
            break
          }
          // Wait 500ms before retrying
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        if (!profileFound) {
          setError('Profile creation timeout. Please refresh or try logging in again.')
          setSubmitting(false)
          return
        }
      }

      router.push('/onboarding')
    }
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
    setError(null)
    setResetSent(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
          }}
        >
          <span className="font-heading text-lg font-bold text-black">Q</span>
        </div>
        <span
          className="font-heading text-xl font-semibold"
          style={{ color: 'var(--q-text)' }}
        >
          Quantica
        </span>
      </div>

      <div className="mb-8">
        <h2
          className="font-heading text-2xl font-bold"
          style={{ color: 'var(--q-text)' }}
        >
          {isForgot
            ? 'Reset your password'
            : isLogin
              ? 'Welcome back'
              : 'Create your account'}
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--q-muted)' }}>
          {isForgot
            ? "Enter your email address and we'll send you a password reset link."
            : isLogin
              ? 'Sign in to continue your quantum learning journey.'
              : 'Join thousands of students exploring quantum science.'}
        </p>
      </div>

      {!isForgot && (
        <div
          className="mb-6 grid grid-cols-2 gap-1 rounded-xl border p-1"
          style={{ borderColor: 'var(--q-line)', background: 'oklch(1 0 0 / 4%)' }}
          role="tablist"
          aria-label="Authentication mode"
        >
          <ToggleButton active={isLogin} onClick={() => handleModeChange('login')}>
            Sign In
          </ToggleButton>
          <ToggleButton active={!isLogin && !isForgot} onClick={() => handleModeChange('register')}>
            Register
          </ToggleButton>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {isForgot && resetSent ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
          </div>
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className="w-full rounded-lg border py-2.5 text-sm font-semibold transition-colors hover:border-[var(--q-cyan)]"
            style={{
              borderColor: 'var(--q-line)',
              background: 'oklch(1 0 0 / 4%)',
              color: 'var(--q-text)',
            }}
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgot && (
            <Field
              id="name"
              label="Full name"
              type="text"
              placeholder="Ada Lovelace"
              icon={<User className="h-4 w-4" />}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {!isLogin && !isForgot && (
            <Field
              id="role"
              label="I am a"
              type="select"
              icon={<GraduationCap className="h-4 w-4" />}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          )}
          <Field
            id="email"
            label="Email address"
            type="email"
            placeholder="you@university.edu"
            icon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {!isForgot && (
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: 'var(--q-text)' }}
              >
                Password
              </label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--q-muted)' }}
                >
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg border py-2.5 pl-10 pr-11 text-sm outline-none transition-colors focus:border-[var(--q-cyan)] focus:ring-2 focus:ring-[var(--q-cyan)]/30"
                  style={{
                    borderColor: 'var(--q-line)',
                    background: 'var(--q-bg-deep)',
                    color: 'var(--q-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 transition-colors hover:text-[var(--q-cyan)]"
                  style={{ color: 'var(--q-muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {isLogin ? (
            <div className="flex items-center justify-between text-sm">
              <label
                className="flex cursor-pointer items-center gap-2"
                style={{ color: 'var(--q-muted)' }}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--q-line)] accent-[var(--q-violet)]"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => handleModeChange('forgot')}
                className="font-medium transition-colors hover:underline"
                style={{ color: 'var(--q-cyan)' }}
              >
                Forgot password?
              </button>
            </div>
          ) : !isForgot ? (
            <label
              className="flex cursor-pointer items-start gap-2 text-sm"
              style={{ color: 'var(--q-muted)' }}
            >
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-[var(--q-line)] accent-[var(--q-violet)]"
              />
              <span>
                I agree to the{' '}
                <a
                  href="#"
                  className="font-medium hover:underline"
                  style={{ color: 'var(--q-cyan)' }}
                >
                  Terms
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="font-medium hover:underline"
                  style={{ color: 'var(--q-cyan)' }}
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              background:
                'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
            }}
          >
            {submitting
              ? 'Please wait…'
              : isForgot
                ? 'Send Reset Link'
                : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
            {!submitting && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>

          {isForgot && (
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="w-full text-center text-sm font-medium transition-colors hover:underline"
              style={{ color: 'var(--q-muted)' }}
            >
              Back to Sign In
            </button>
          )}
        </form>
      )}

      {!isForgot && (
        <>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: 'var(--q-line)' }} />
            <span className="text-xs" style={{ color: 'var(--q-muted)' }}>
              or continue with
            </span>
            <span className="h-px flex-1" style={{ background: 'var(--q-line)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SocialButton label="Google" />
            <SocialButton label="GitHub" />
          </div>

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--q-muted)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => handleModeChange(isLogin ? 'register' : 'login')}
              className="font-semibold transition-colors hover:underline"
              style={{ color: 'var(--q-cyan)' }}
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </p>
        </>
      )}
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="rounded-lg py-2 text-sm font-medium transition-all"
      style={
        active
          ? {
              background:
                'linear-gradient(135deg, var(--q-cyan), var(--q-violet))',
              color: '#000',
            }
          : { color: 'var(--q-muted)', background: 'transparent' }
      }
    >
      {children}
    </button>
  )
}

function Field({
  id,
  label,
  type,
  placeholder,
  icon,
  autoComplete,
  value,
  onChange,
}: {
  id: string
  label: string
  type: string
  placeholder?: string
  icon: React.ReactNode
  autoComplete?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium"
        style={{ color: 'var(--q-text)' }}
      >
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--q-muted)' }}
        >
          {icon}
        </span>
        {type === 'select' ? (
          <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className="w-full appearance-none rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[var(--q-cyan)] focus:ring-2 focus:ring-[var(--q-cyan)]/30"
            style={{
              borderColor: 'var(--q-line)',
              background: 'var(--q-bg-deep)',
              color: 'var(--q-text)',
            }}
          >
            <option value="student">Student</option>
            <option value="educator">Educator</option>
            <option value="researcher">Researcher</option>
            <option value="enthusiast">Enthusiast</option>
          </select>
        ) : (
          <input
            id={id}
            name={id}
            type={type}
            required
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[var(--q-cyan)] focus:ring-2 focus:ring-[var(--q-cyan)]/30"
            style={{
              borderColor: 'var(--q-line)',
              background: 'var(--q-bg-deep)',
              color: 'var(--q-text)',
            }}
          />
        )}
      </div>
    </div>
  )
}

function SocialButton({ label }: { label: 'Google' | 'GitHub' }) {
  const handleClick = async () => {
    const provider = label.toLowerCase() as 'google' | 'github'
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // Automatically redirects to the callback route which handles the session exchange
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg border py-2.5 text-sm font-medium transition-colors hover:border-[var(--q-cyan)]"
      style={{
        borderColor: 'var(--q-line)',
        background: 'oklch(1 0 0 / 4%)',
        color: 'var(--q-text)',
      }}
    >
      {label}
    </button>
  )
}
