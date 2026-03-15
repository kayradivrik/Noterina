import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

interface SupabaseState {
  config: SupabaseConfig
  client: SupabaseClient | null
  loadConfig: () => Promise<void>
  setConfig: (url: string, anonKey: string) => Promise<void>
}

export const useSupabaseStore = create<SupabaseState>((set, get) => ({
  config: { url: '', anonKey: '' },
  client: null,

  loadConfig: async () => {
    if (typeof window === 'undefined' || !window.electronAPI?.supabase) return
    const c = await window.electronAPI.supabase.getConfig()
    set({ config: c })
    if (c.url && c.anonKey) {
      try {
        const client = createClient(c.url, c.anonKey)
        set({ client })
      } catch {
        set({ client: null })
      }
    } else {
      set({ client: null })
    }
  },

  setConfig: async (url: string, anonKey: string) => {
    if (typeof window === 'undefined' || !window.electronAPI?.supabase) return
    await window.electronAPI.supabase.setConfig({ url: url.trim(), anonKey: anonKey.trim() })
    await get().loadConfig()
  },
}))

export function getSupabase(): SupabaseClient | null {
  return useSupabaseStore.getState().client
}

export function isSupabaseConfigured(): boolean {
  return Boolean(useSupabaseStore.getState().client)
}
