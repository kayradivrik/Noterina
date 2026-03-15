import { useRef, useEffect } from 'react'

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Yüzler', emojis: ['😀', '😊', '🥲', '😎', '🤔', '😢', '😡', '🥳', '😴', '🤗', '👍', '👎', '👏', '🙌', '🤝', '💪'] },
  { label: 'Kalp & Doğa', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '🌟', '✨', '🔥', '💯', '🌸', '🌺', '🍀'] },
  { label: 'Nesneler', emojis: ['📌', '📎', '✏️', '📝', '📁', '📂', '📅', '📆', '✅', '❌', '⚠️', '💡', '🔔', '📌', '🏷️', '📌'] },
  { label: 'Semboller', emojis: ['➡️', '⬅️', '⬆️', '⬇️', '🔴', '🟢', '🟡', '🔵', '⚪', '🟣', '🟤', '⚫', '1️⃣', '2️⃣', '3️⃣', '✔️'] },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

export function EmojiPicker({ onSelect, onClose, anchorRef }: EmojiPickerProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 0)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, anchorRef])

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark shadow-xl overflow-hidden"
    >
      <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
        {EMOJI_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <div className="px-1 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {group.label}
            </div>
            <div className="grid grid-cols-8 gap-0.5">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded p-1.5 text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => {
                    onSelect(emoji)
                    onClose()
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
