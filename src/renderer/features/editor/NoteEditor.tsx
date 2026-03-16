import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Undo2, Redo2, Smile, ImagePlus, Images } from 'lucide-react'
import { EmojiPicker } from './EmojiPicker'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Placeholder from '@tiptap/extension-placeholder'
import History from '@tiptap/extension-history'
import Bold from '@tiptap/extension-bold'
import { ResizableImageExtension } from './ResizableImageExtension'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import { useMemo } from 'react'
import type { Note } from '@shared/types'
import { SelectionContextMenu } from './SelectionContextMenu'
import { useNotesStore } from '../../store/useNotesStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { usePasswordModalStore } from '../../store/usePasswordModalStore'
import { useUnlockedNotesStore } from '../../store/useUnlockedNotesStore'
import { getTranslation } from '../../i18n/translations'
import { useTranslation } from '../../i18n/useTranslation'
import { syncAfterSave } from '../../lib/syncAfterMutation'
import { useSavedFlashStore } from '../../store/useSavedFlashStore'

interface NoteEditorProps {
  note: Note
}

const baseExtensions = [
  Document,
  Paragraph,
  Text,
  Heading.configure({ levels: [1, 2, 3] }),
  BulletList,
  OrderedList,
  ListItem,
  TaskList,
  TaskItem.configure({ nested: true }),
  Blockquote,
  CodeBlock,
  HorizontalRule,
  History,
  ResizableImageExtension.configure({ inline: false, allowBase64: true }),
  Bold,
  Italic,
  Strike,
  Code,
]

export function NoteEditor({ note }: NoteEditorProps) {
  const { t } = useTranslation()
  const updateNoteInStore = useNotesStore((s) => s.updateNoteInStore)
  const autosave = useSettingsStore((s) => s.autosave)
  const autosaveDelayMs = useSettingsStore((s) => s.autosaveDelayMs)
  const language = useSettingsStore((s) => s.language)
  const untitledTitle = getTranslation(language, 'editor.untitledNoteTitle')
  const extensions = useMemo(
    () => [...baseExtensions, Placeholder.configure({ placeholder: getTranslation(language, 'editor.placeholder') })],
    [language]
  )
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const triggerImageRef = useRef<() => void>(() => {})
  const triggerGalleryRef = useRef<() => void>(() => {})
  const [emojiOpen, setEmojiOpen] = useState(false)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const lock = useUnlockedNotesStore((s) => s.lock)

  useEffect(() => {
    triggerImageRef.current = () => imageInputRef.current?.click()
    triggerGalleryRef.current = () => galleryInputRef.current?.click()
  }, [])

  const markSaved = useSavedFlashStore((s) => s.markSaved)
  const displayContent = note.content

  const flushSave = useCallback(
    async (content: string, title: string) => {
      const updates: Partial<Note> = { content, title }
      window.electronAPI.notes.update(note.id, updates).then((updated) => {
        if (updated) {
          updateNoteInStore(note.id, { ...updates, updatedAt: updated.updatedAt })
          syncAfterSave({ ...note, ...updated, content, title })
          markSaved(note.id)
        }
      })
    },
    [note, updateNoteInStore, markSaved]
  )

  const editor = useEditor({
    extensions,
    content: displayContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate dark:prose-invert max-w-none min-h-[280px] max-w-3xl mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-10 focus:outline-none text-slate-800 dark:text-slate-100',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const { state } = view
          const { $from } = state.selection
          const line = $from.parent.textContent
          if (line.startsWith('/')) {
            const cmd = line.slice(1).trim().toLowerCase()
            const mapping: Record<string, () => void> = {
              h1: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
              h2: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
              h3: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
              bullet: () => editor?.chain().focus().toggleBulletList().run(),
              list: () => editor?.chain().focus().toggleOrderedList().run(),
              todo: () => editor?.chain().focus().toggleTaskList().run(),
              quote: () => editor?.chain().focus().toggleBlockquote().run(),
              code: () => editor?.chain().focus().toggleCodeBlock().run(),
              div: () => editor?.chain().focus().setHorizontalRule().run(),
              resim: () => {
                const tr = view.state.tr
                const pos = $from.start() - 1
                tr.delete(pos, $from.end())
                view.dispatch(tr)
                setTimeout(() => triggerImageRef.current(), 0)
              },
              galeri: () => {
                const tr = view.state.tr
                const pos = $from.start() - 1
                tr.delete(pos, $from.end())
                view.dispatch(tr)
                setTimeout(() => triggerGalleryRef.current(), 0)
              },
            }
            const run = mapping[cmd]
            if (run) {
              event.preventDefault()
              if (cmd === 'resim' || cmd === 'galeri') {
                run()
              } else {
                const tr = view.state.tr
                const pos = $from.start() - 1
                tr.delete(pos, $from.end())
                view.dispatch(tr)
                run()
              }
            }
          }
        }
        return false
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== displayContent) {
      editor.commands.setContent(displayContent, false)
    }
  }, [note.id, displayContent, editor])

  useEffect(() => {
    if (!editor) return
    usePasswordModalStore.getState().setGetContent(() => editor.getHTML())
    return () => usePasswordModalStore.getState().setGetContent(null)
  }, [editor])

  useEffect(() => {
    if (!editor || !autosave) return
    const onUpdate = () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML()
        const firstLine = editor.state.doc.firstChild?.textContent?.trim().slice(0, 100) ?? ''
        const title = firstLine || untitledTitle
        flushSave(html, title)
        saveTimeoutRef.current = null
      }, autosaveDelayMs)
    }
    editor.on('update', onUpdate)
    return () => {
      editor.off('update', onUpdate)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [editor, autosave, autosaveDelayMs, flushSave, untitledTitle])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (editor && autosave) {
        const html = editor.getHTML()
        const firstLine = editor.state.doc.firstChild?.textContent?.trim().slice(0, 100) ?? ''
        flushSave(html, firstLine || untitledTitle)
      }
    }
  }, [editor, autosave, flushSave, untitledTitle])

  // Not ekranından ayrılınca bu notu tekrar kilitle
  useEffect(() => {
    return () => {
      lock(note.id)
    }
  }, [lock, note.id])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!editor || !editorWrapperRef.current?.contains(e.target as Node)) return
      const { state } = editor
      if (state.selection.empty) return
      e.preventDefault()
      e.stopPropagation()
      setContextMenu({ x: e.clientX, y: e.clientY })
    },
    [editor]
  )

  const handleImageFiles = useCallback(
    (files: FileList | null) => {
      if (!editor || !files?.length) return
      const toProcess = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (!toProcess.length) return
      const readAsDataURL = (file: File): Promise<string> =>
        new Promise((res) => {
          const r = new FileReader()
          r.onload = () => res(r.result as string)
          r.readAsDataURL(file)
        })
      Promise.all(toProcess.map(readAsDataURL)).then((urls) => {
        if (!editor) return
        urls.forEach((url, i) => {
          ;(editor.chain().focus() as unknown as { setImage: (o: { src: string }) => { run: () => boolean } })
            .setImage({ src: url })
            .run()
          if (i < urls.length - 1) editor.chain().focus().insertContent({ type: 'paragraph' }).run()
        })
      })
    },
    [editor]
  )

  return (
    <div className="h-full flex flex-col">
      {editor && (
        <div className="shrink-0 flex items-center gap-0.5 flex-wrap px-3 py-2 sm:px-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title={t('toolbar.undo')}
          >
            <Undo2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title={t('toolbar.redo')}
          >
            <Redo2 size={18} />
          </button>
          <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          <div className="relative">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={t('toolbar.addEmoji')}
            >
              <Smile size={18} />
            </button>
            {emojiOpen && (
              <EmojiPicker
                onSelect={(emoji) => {
                  editor.chain().focus().insertContent(emoji).run()
                  setEmojiOpen(false)
                }}
                onClose={() => setEmojiOpen(false)}
                anchorRef={emojiButtonRef}
              />
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => {
              handleImageFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t('toolbar.addImage')}
          >
            <ImagePlus size={18} />
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              handleImageFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t('toolbar.addGallery')}
          >
            <Images size={18} />
          </button>
        </div>
      )}
      <div
        ref={editorWrapperRef}
        className="flex-1 min-h-0"
        onContextMenu={handleContextMenu}
      >
        <EditorContent editor={editor} />
      </div>
      {contextMenu && editor && (
        <SelectionContextMenu
          editor={editor}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
