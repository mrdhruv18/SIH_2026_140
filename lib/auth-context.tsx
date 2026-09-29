  'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/backend/supabase-client'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'student' | 'admin' | 'educator' | 'researcher' | 'learner'
  educationLevel: string
  quantumExperience: string
  learningGoals: string[]
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  overallProgress: number // 0 - 100
  streak: number
  quizAverage: number
  weakTopics: string[]
  strongTopics: string[]
  completedTopics: string[]
  assessmentCompleted: boolean
  onboardingCompleted: boolean
  bookmarkedResources: string[]
  bookmarkedBooks: string[]
  unlockedBadges: string[]
}

export const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  name: 'Alex Vance',
  email: 'alex.vance@university.edu',
  role: 'student',
  educationLevel: 'Undergraduate',
  quantumExperience: 'Some basic knowledge',
  learningGoals: ['Learn quantum algorithms', 'Build quantum circuits', 'Quantum programming'],
  level: 'Intermediate',
  overallProgress: 68,
  streak: 7,
  quizAverage: 84,
  weakTopics: ['Quantum Algorithms', 'Circuit Design'],
  strongTopics: ['Qubits & Superposition', 'Pauli Gates'],
  completedTopics: ['intro-quantum', 'qubits', 'superposition', 'measurement'],
  assessmentCompleted: true,
  onboardingCompleted: true,
  bookmarkedResources: ['res-1', 'res-3'],
  bookmarkedBooks: ['book-1'],
  unlockedBadges: ['badge-1', 'badge-2', 'badge-3', 'badge-4'],
}

interface AuthContextType {
  user: UserProfile
  updateUser: (fields: Partial<UserProfile>) => void
  toggleBookmarkResource: (id: string) => void
  toggleBookmarkBook: (id: string) => void
  markTopicCompleted: (topicId: string) => void
  setAssessmentResults: (
    scoreOrLevel: any,
    levelOrWeak?: any,
    weakOrStrong?: any,
    strongOrScore?: any
  ) => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER)

  useEffect(() => {
    // Ensure active session cookie exists for fast middleware routing
    if (typeof document !== 'undefined' && !document.cookie.includes('quantify_session')) {
      document.cookie = 'quantify_session=active; path=/; max-age=604800; SameSite=Lax'
    }

    // 1. Check local storage cache
    const saved = localStorage.getItem('quantify_user_profile')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser((prev) => ({
          ...prev,
          ...parsed,
          bookmarkedResources: Array.isArray(parsed.bookmarkedResources) ? parsed.bookmarkedResources : (prev.bookmarkedResources || []),
          bookmarkedBooks: Array.isArray(parsed.bookmarkedBooks) ? parsed.bookmarkedBooks : (prev.bookmarkedBooks || []),
          weakTopics: Array.isArray(parsed.weakTopics) ? parsed.weakTopics : (prev.weakTopics || []),
          strongTopics: Array.isArray(parsed.strongTopics) ? parsed.strongTopics : (prev.strongTopics || []),
          completedTopics: Array.isArray(parsed.completedTopics) ? parsed.completedTopics : (prev.completedTopics || []),
          learningGoals: Array.isArray(parsed.learningGoals) ? parsed.learningGoals : (prev.learningGoals || []),
          unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : (prev.unlockedBadges || []),
        }))
      } catch (e) {
        console.error('Failed to parse saved profile', e)
      }
    }

    // 2. Synchronize with real Supabase Auth session & public.profiles
    async function syncSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          let profile = null

          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
          
          profile = data

          if (profile) {
            const rawLevel = profile.level || 'Beginner'
            const formattedLevel = (rawLevel.charAt(0).toUpperCase() + rawLevel.slice(1)) as any
            const mappedUser: UserProfile = {
              id: profile.id,
              name: profile.name || session.user.email?.split('@')[0] || 'Learner',
              email: profile.email || session.user.email || '',
              role: profile.role || 'learner',
              educationLevel: profile.educationLevel || 'Undergraduate',
              quantumExperience: 'Intermediate',
              learningGoals: ['Learn quantum algorithms', 'Build quantum circuits'],
              level: formattedLevel,
              overallProgress: profile.overallProgress || 0,
              streak: profile.streak || 0,
              quizAverage: Number(profile.quizAverage) || 0,
              weakTopics: Array.isArray(profile.weakTopics) ? profile.weakTopics : [],
              strongTopics: Array.isArray(profile.strongTopics) ? profile.strongTopics : [],
              completedTopics: Array.isArray(profile.completedTopics) ? profile.completedTopics : [],
              assessmentCompleted: profile.assessmentCompleted || false,
              onboardingCompleted: profile.onboardingCompleted || false,
              bookmarkedResources: Array.isArray(profile.bookmarkedResources) ? profile.bookmarkedResources : [],
              bookmarkedBooks: Array.isArray(profile.bookmarkedBooks) ? profile.bookmarkedBooks : [],
              unlockedBadges: Array.isArray(profile.unlockedBadges) ? profile.unlockedBadges : [],
            }
            setUser(mappedUser)
            localStorage.setItem('quantify_user_profile', JSON.stringify(mappedUser))
          } else {
            console.warn('Profile not found after retries')
          }
        }
      } catch (err) {
        console.warn('Auth session sync warning:', err)
      }
    }

    syncSession()

    // 3. Listen for Supabase auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        syncSession()
      } else if (event === 'SIGNED_OUT') {
        setUser(DEFAULT_USER)
        localStorage.removeItem('quantify_user_profile')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const updateUser = (fields: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields }
      if (typeof window !== 'undefined') {
        localStorage.setItem('quantify_user_profile', JSON.stringify(updated))
      }
      return updated
    })
  }

  const toggleBookmarkResource = async (id: string) => {
    let newArray: string[] = []
    setUser((prev) => {
      const current = prev.bookmarkedResources || []
      const exists = current.includes(id)
      newArray = exists
        ? current.filter((item) => item !== id)
        : [...current, id]
      const newUser = { ...prev, bookmarkedResources: newArray }
      if (typeof window !== 'undefined') {
        localStorage.setItem('quantify_user_profile', JSON.stringify(newUser))
      }
      return newUser
    })

    if (user.id && user.id !== DEFAULT_USER.id) {
      try {
        await supabase.from('profiles').update({ bookmarkedResources: newArray }).eq('id', user.id)
      } catch (err) {
        console.error('Failed to save resource bookmark:', err)
      }
    }
  }

  const toggleBookmarkBook = async (id: string) => {
    let newArray: string[] = []
    setUser((prev) => {
      const current = prev.bookmarkedBooks || []
      const exists = current.includes(id)
      newArray = exists
        ? current.filter((item) => item !== id)
        : [...current, id]
      const newUser = { ...prev, bookmarkedBooks: newArray }
      if (typeof window !== 'undefined') {
        localStorage.setItem('quantify_user_profile', JSON.stringify(newUser))
      }
      return newUser
    })

    if (user.id && user.id !== DEFAULT_USER.id) {
      try {
        await supabase.from('profiles').update({ bookmarkedBooks: newArray }).eq('id', user.id)
      } catch (err) {
        console.error('Failed to save book bookmark:', err)
      }
    }
  }

  const markTopicCompleted = (topicId: string) => {
    setUser((prev) => {
      const currentTopics = prev.completedTopics || []
      if (currentTopics.includes(topicId)) return prev
      const updatedTopics = [...currentTopics, topicId]
      const newProgress = Math.min(100, Math.round((updatedTopics.length / 12) * 100))
      const newUser = {
        ...prev,
        completedTopics: updatedTopics,
        overallProgress: newProgress,
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('quantify_user_profile', JSON.stringify(newUser))
      }
      return newUser
    })
  }

  const setAssessmentResults = (
    scoreOrLevel: any,
    levelOrWeak?: any,
    weakOrStrong?: any,
    strongOrScore?: any
  ) => {
    let level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate'
    let weak: string[] = []
    let strong: string[] = []

    if (typeof scoreOrLevel === 'number') {
      level = levelOrWeak || 'Beginner'
      weak = weakOrStrong || []
      strong = strongOrScore || []
    } else {
      level = scoreOrLevel || 'Beginner'
      weak = levelOrWeak || []
      strong = weakOrStrong || []
    }

    setUser((prev) => {
      const newUser: UserProfile = {
        ...prev,
        level,
        weakTopics: weak,
        strongTopics: strong,
        assessmentCompleted: true,
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('quantify_user_profile', JSON.stringify(newUser))
      }
      return newUser
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUser,
        toggleBookmarkResource,
        toggleBookmarkBook,
        markTopicCompleted,
        setAssessmentResults,
        isAdmin: user.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
