import type { Note, AppLanguage } from '@shared/types'
import type { NoteTemplate } from './templates'
import { getTranslation } from '../i18n/translations'
import { syncAfterSave } from '../lib/syncAfterMutation'

const DEFAULT_TITLE: Record<AppLanguage, string> = { tr: 'Başlıksız Not', en: 'Untitled Note' }

export async function createNewNote(lang: AppLanguage = 'tr'): Promise<Note | null> {
  try {
    const note = await window.electronAPI.notes.create({
      title: DEFAULT_TITLE[lang],
      content: '',
      tags: [],
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
    })
    await syncAfterSave(note)
    return note
  } catch {
    return null
  }
}

export async function createNoteFromTemplate(template: NoteTemplate): Promise<Note | null> {
  try {
    const note = await window.electronAPI.notes.create({
      title: template.title,
      content: template.content,
      tags: [],
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
      icon: template.icon,
    })
    await syncAfterSave(note)
    return note
  } catch {
    return null
  }
}

export function formatRelativeTime(dateStr: string, lang: AppLanguage = 'tr'): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const locale = lang === 'en' ? 'en-US' : 'tr-TR'
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }

  if (diffMins < 1) return getTranslation(lang, 'time.justNow')
  if (diffMins < 60) return getTranslation(lang, 'time.minutesAgo', { count: diffMins })
  if (diffHours < 24) return getTranslation(lang, 'time.hoursAgo', { count: diffHours })
  if (diffDays < 7) return getTranslation(lang, 'time.daysAgo', { count: diffDays })
  return date.toLocaleDateString(locale, opts)
}

export function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent?.trim() ?? ''
}

export function getPreviewText(html: string, maxLen: number): string {
  const text = stripHtml(html).replace(/\s+/g, ' ')
  return text.length <= maxLen ? text : `${text.slice(0, maxLen)}...`
}
