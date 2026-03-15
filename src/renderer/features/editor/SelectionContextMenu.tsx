import { useEffect, useRef } from 'react'
import { Bold, Italic, Strikethrough, Code } from 'lucide-react'
import type { Editor } from '@tiptap/core'

interface SelectionContextMenuProps {
  editor: Editor
  x: number
  y: number
  onClose: () => void
}

export function SelectionContextMenu({ editor, x, y, onClose }: SelectionContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 0)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const run = (cmd: () => boolean) => {
    cmd()
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark shadow-xl py-1 min-w-[180px] max-w-[calc(100vw-1rem)]"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => run(() => editor.chain().focus().toggleBold().run())}
          className={`rounded p-2 transition ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          title="Kalın (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => run(() => editor.chain().focus().toggleItalic().run())}
          className={`rounded p-2 transition ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          title="İtalik (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => run(() => editor.chain().focus().toggleStrike().run())}
          className={`rounded p-2 transition ${editor.isActive('strike') ? 'bg-primary/20 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          title="Üstü çizili"
        >
          <Strikethrough size={18} />
        </button>
        <button
          type="button"
          onClick={() => run(() => editor.chain().focus().toggleCode().run())}
          className={`rounded p-2 transition ${editor.isActive('code') ? 'bg-primary/20 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          title="Kod"
        >
          <Code size={18} />
        </button>
      </div>
    </div>
  )
}
