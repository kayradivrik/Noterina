import type { Note } from '@shared/types'
import { getSupabase } from '../store/useSupabaseStore'

const TABLE = 'notes'

function rowToNote(r: Record<string, unknown>): Note {
  return {
    id: String(r.id),
    title: String(r.title ?? ''),
    content: String(r.content ?? ''),
    createdAt: String(r.created_at ?? ''),
    updatedAt: String(r.updated_at ?? ''),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    isFavorite: Boolean(r.is_favorite),
    isArchived: Boolean(r.is_archived),
    isDeleted: Boolean(r.is_deleted),
    icon: r.icon != null ? String(r.icon) : undefined,
  }
}

function noteToRow(note: Note, userId: string): Record<string, unknown> {
  return {
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
    tags: note.tags,
    is_favorite: note.isFavorite,
    is_archived: note.isArchived,
    is_deleted: note.isDeleted,
    icon: note.icon ?? null,
  }
}

export async function fetchNotesFromCloud(): Promise<Note[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToNote)
}

export async function pushNoteToCloud(note: Note): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const row = noteToRow(note, user.id)
  const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' })
  if (error) throw error
}

export async function deleteNoteFromCloud(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('user_id', user.id)
  if (error) throw error
}
