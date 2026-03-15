import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabase } from '../store/useSupabaseStore'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  init: () => () => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  init: () => {
    const client = getSupabase()
    if (!client) {
      set({ isLoading: false })
      return () => {}
    }
    set({ isLoading: true })
    client.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isLoading: false })
    })
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, error: null })
    })
    return () => subscription.unsubscribe()
  },

  login: async (email: string, password: string) => {
    set({ error: null })
    const client = getSupabase()
    if (!client) return
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) set({ error: error.message })
  },

  signup: async (email: string, password: string) => {
    set({ error: null })
    const client = getSupabase()
    if (!client) return
    const { data, error } = await client.auth.signUp({ email, password })
    if (error) {
      set({ error: error.message })
      return
    }
    if (data.session) {
      set({ session: data.session, user: data.session.user, error: null })
      return
    }
    const { error: signInError } = await client.auth.signInWithPassword({ email, password })
    if (signInError) set({ error: signInError.message })
  },

  logout: async () => {
    const client = getSupabase()
    if (client) await client.auth.signOut()
    set({ user: null, session: null, error: null })
  },

  clearError: () => set({ error: null }),
}))

export const useAuthConfigured = () => Boolean(getSupabase())
