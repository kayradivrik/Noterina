import { create } from 'zustand'

/** Oturumda açılmış kilitli notlar: noteId -> şifre (sadece bellekte; kaydetmede tekrar şifrelemek için). */
interface UnlockedNotesState {
  /** noteId -> session password (re-encrypt on save) */
  passwords: Record<string, string>
  /** noteId -> decrypted content (editor shows this) */
  decryptedContent: Record<string, string>
  setUnlocked: (noteId: string, password: string, decryptedContent: string) => void
  getPassword: (noteId: string) => string | undefined
  getDecryptedContent: (noteId: string) => string | undefined
  setDecryptedContent: (noteId: string, content: string) => void
  lock: (noteId: string) => void
  isUnlocked: (noteId: string) => boolean
}

export const useUnlockedNotesStore = create<UnlockedNotesState>((set, get) => ({
  passwords: {},
  decryptedContent: {},

  setUnlocked: (noteId, password, decryptedContent) =>
    set((s) => ({
      passwords: { ...s.passwords, [noteId]: password },
      decryptedContent: { ...s.decryptedContent, [noteId]: decryptedContent },
    })),

  getPassword: (noteId) => get().passwords[noteId],
  getDecryptedContent: (noteId) => get().decryptedContent[noteId],

  setDecryptedContent: (noteId, content) =>
    set((s) => ({
      decryptedContent: { ...s.decryptedContent, [noteId]: content },
    })),

  lock: (noteId) =>
    set((s) => {
      const { [noteId]: _, ...passwords } = s.passwords
      const { [noteId]: __, ...decryptedContent } = s.decryptedContent
      return { passwords, decryptedContent }
    }),

  isUnlocked: (noteId) => !!get().passwords[noteId],
}))
