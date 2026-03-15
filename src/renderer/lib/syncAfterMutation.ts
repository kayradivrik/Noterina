import type { Note } from '@shared/types'
import { pushNoteToCloud, deleteNoteFromCloud } from './cloudSync'
import { getSupabase } from '../store/useSupabaseStore'

/** Giriş yapılmışsa notu buluta gönderir (create/update sonrası çağrılır). */
export async function syncAfterSave(note: Note | null): Promise<void> {
  if (!getSupabase() || !note) return
  try {
    await pushNoteToCloud(note)
  } catch {
    // Sessizce yoksay; yerel kayıt zaten yapıldı
  }
}

/** Giriş yapılmışsa buluttan siler (kalıcı silme sonrası çağrılır). */
export async function syncAfterDelete(noteId: string): Promise<void> {
  if (!getSupabase()) return
  try {
    await deleteNoteFromCloud(noteId)
  } catch {
    // Sessizce yoksay
  }
}
