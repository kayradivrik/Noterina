export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  tags: string[]
  isFavorite: boolean
  isArchived: boolean
  isDeleted: boolean
  /** Emoji veya simge (örn. 📝, 📄) */
  icon?: string
  /** Şifre ile kilitli */
  isLocked?: boolean
  /** Basit kilit sistemi: düz şifre (normalize(NFC, trim)) */
  lockPassword?: string
}

export interface NotesData {
  notes: Note[]
  version: number
}

export type ThemeMode = 'dark' | 'light'

export type AppLanguage = 'tr' | 'en'

export type DefaultView = 'all' | 'favorites' | 'recent'
export type SortOrder = 'newest' | 'oldest' | 'title'

export interface AppSettings {
  theme: ThemeMode
  language: AppLanguage
  fontSize: 'small' | 'medium' | 'large'
  autosave: boolean
  autosaveDelayMs: number
  defaultView: DefaultView
  sortOrder: SortOrder
  compactList: boolean
}
