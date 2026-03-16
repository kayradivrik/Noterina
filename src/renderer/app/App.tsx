import { useEffect, useRef } from 'react'
import { useNotesStore } from '../store/useNotesStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useCommandPaletteStore } from '../store/useCommandPaletteStore'
import { useAuthStore } from '../store/useAuthStore'
import { useSupabaseStore } from '../store/useSupabaseStore'
import { getSupabase } from '../store/useSupabaseStore'
import { fetchNotesFromCloud } from '../lib/cloudSync'
import { Layout } from '../components/Layout'
import { CommandPalette } from '../features/search/CommandPalette'
import { Settings } from '../features/settings/Settings'
import { TrashUndoToast } from '../components/TrashUndoToast'
import { PasswordModal } from '../components/PasswordModal'

const DEMO_NOTES: Array<{ title: string; content: string; isFavorite?: boolean }> = [
  {
    title: 'Hoş geldiniz',
    content: '<p>Notes uygulamasına hoş geldiniz. Bu bir demo nottur.</p><p>Sol menüden <strong>Yeni Not</strong> ile yeni not oluşturabilir, <strong>Ctrl+K</strong> ile notlarda arama yapabilirsiniz.</p>',
    isFavorite: true,
  },
  {
    title: 'Editör kullanımı',
    content: '<p>Yeni satırda <code>/</code> yazarak blok komutlarını kullanabilirsiniz:</p><ul><li><code>/h1</code>, <code>/h2</code>, <code>/h3</code> — Başlıklar</li><li><code>/bullet</code> — Madde işaretli liste</li><li><code>/list</code> — Numaralı liste</li><li><code>/todo</code> — Yapılacak listesi</li><li><code>/quote</code> — Alıntı</li><li><code>/code</code> — Kod bloğu</li><li><code>/div</code> — Yatay çizgi</li><li><code>/resim</code> — Tek resim ekle</li><li><code>/galeri</code> — Çoklu resim ekle</li></ul><p>Üstteki araç çubuğundan <strong>Geri al / Yinele</strong>, <strong>Emoji</strong>, <strong>Resim</strong> ve <strong>Galeri</strong> butonlarını da kullanabilirsiniz.</p>',
  },
  {
    title: 'Favoriler ve çöp kutusu',
    content: '<p>Notun üzerindeki yıldız ile favorilere ekleyebilir, çöp kutusu simgesi ile çöp kutusuna taşıyabilirsiniz. Çöp kutusu görünümünden notu kalıcı silebilir veya geri alabilirsiniz.</p>',
  },
]

function App() {
  const fetchNotes = useNotesStore((s) => s.fetchNotes)
  const loadSettings = useSettingsStore((s) => s.load)
  const notes = useNotesStore((s) => s.notes)
  const addNote = useNotesStore((s) => s.addNote)
  const setActiveNoteId = useNotesStore((s) => s.setActiveNoteId)
  const session = useAuthStore((s) => s.session)
  const initialLoadDone = useRef(false)
  const setView = useNotesStore((s) => s.setView)
  const language = useSettingsStore((s) => s.language)
  const fontSize = useSettingsStore((s) => s.fontSize)

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'tr'
  }, [language])

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [fontSize])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.supabase) return
    useSupabaseStore.getState().loadConfig().then(() => {
      if (getSupabase()) useAuthStore.getState().init()
    })
  }, [])

  useEffect(() => {
    if (initialLoadDone.current) return
    if (typeof window === 'undefined' || !window.electronAPI) return
    initialLoadDone.current = true
    loadSettings()
      .then(() => {
        const { defaultView } = useSettingsStore.getState()
        if (defaultView === 'all' || defaultView === 'favorites' || defaultView === 'recent') {
          setView(defaultView)
        }
      })
      .catch(() => {})
    fetchNotes(true).catch(() => {})
  }, [loadSettings, fetchNotes, setView])

  const sessionRef = useRef(session)
  useEffect(() => {
    if (!getSupabase() || !session || sessionRef.current === session) return
    sessionRef.current = session
    fetchNotesFromCloud()
      .then((cloudNotes) => {
        if (cloudNotes.length > 0) {
          return window.electronAPI.notes.replaceAll(cloudNotes).then(() => fetchNotes(true))
        }
        return fetchNotes(true)
      })
      .catch(() => fetchNotes(true))
  }, [session, fetchNotes])

  const hasSeeded = useRef(false)
  useEffect(() => {
    if (hasSeeded.current) return
    if (typeof window === 'undefined' || !window.electronAPI) return
    if (notes.length > 0) return
    hasSeeded.current = true
    let firstId: string | null = null
    const seed = async () => {
      try {
        for (const demo of DEMO_NOTES) {
          const note = await window.electronAPI!.notes.create({
            title: demo.title,
            content: demo.content,
            tags: [],
            isFavorite: demo.isFavorite ?? false,
            isArchived: false,
            isDeleted: false,
          })
          addNote(note)
          if (!firstId) firstId = note.id
        }
        if (firstId) setActiveNoteId(firstId)
      } catch {
        hasSeeded.current = false
      }
    }
    seed()
  }, [notes.length])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        useCommandPaletteStore.getState().toggle()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <Layout />
      <CommandPalette />
      <Settings />
      <TrashUndoToast />
      <PasswordModal />
    </>
  )
}

export default App
