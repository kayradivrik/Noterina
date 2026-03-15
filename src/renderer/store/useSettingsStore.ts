import { create } from 'zustand'
import type { AppSettings } from '@shared/types'

interface SettingsState extends AppSettings {
  isOpen: boolean
  applyTheme: (theme: 'dark' | 'light') => void
  load: () => Promise<void>
  setOpen: (open: boolean) => void
  update: (updates: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  language: 'tr',
  fontSize: 'medium',
  autosave: true,
  autosaveDelayMs: 2000,
  defaultView: 'all',
  sortOrder: 'newest',
  compactList: false,
  isOpen: false,

  setOpen: (isOpen) => set({ isOpen }),

  applyTheme: (theme: 'dark' | 'light') => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  },

  load: async () => {
    try {
      const settings = await window.electronAPI.settings.get()
      set(settings)
      get().applyTheme(settings.theme)
    } catch {
      get().applyTheme('dark')
    }
  },

  update: async (updates) => {
    const next = await window.electronAPI.settings.set(updates)
    set(next)
    get().applyTheme(next.theme)
  },
}))
