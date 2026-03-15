import type { Note } from '@shared/types'
import type { NoteTemplate } from './templates'

export async function createNewNote(): Promise<Note | null> {
  try {
    return await window.electronAPI.notes.create({
      title: 'Başlıksız Not',
      content: '',
      tags: [],
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
    })
  } catch {
    return null
  }
}

export async function createNoteFromTemplate(template: NoteTemplate): Promise<Note | null> {
  try {
    return await window.electronAPI.notes.create({
      title: template.title,
      content: template.content,
      tags: [],
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
      icon: template.icon,
    })
  } catch {
    return null
  }
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dk önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
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
