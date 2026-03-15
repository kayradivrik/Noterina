import { useState } from 'react'
import { GripVertical, Maximize2, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export type ImageSize = 'small' | 'medium' | 'large' | 'full'

const SIZE_MAP: Record<ImageSize, string> = {
  small: '!max-w-[200px]',
  medium: '!max-w-[400px]',
  large: '!max-w-[600px]',
  full: '!max-w-full w-full',
}

const SIZE_LABELS: Record<ImageSize, string> = {
  small: 'Küçük',
  medium: 'Orta',
  large: 'Büyük',
  full: 'Tam',
}

export function ResizableImage({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, title } = node.attrs
  const size = (node.attrs.size as ImageSize) || 'medium'
  const [showToolbar, setShowToolbar] = useState(false)
  const isVisible = selected || showToolbar

  if (!src) return null

  return (
    <NodeViewWrapper
      as="div"
      draggable
      data-drag-handle
      className="group my-4 flex items-start gap-2 rounded-lg cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      <div
        className="flex shrink-0 items-center self-center rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 pointer-events-none"
        title="Sürükleyerek taşı"
      >
        <GripVertical size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`inline-block rounded-lg overflow-hidden select-none ${selected ? 'ring-2 ring-primary' : ''}`}>
          <img
            src={src}
            alt={alt ?? ''}
            title={title ?? undefined}
            className={`block h-auto max-h-[70vh] object-contain pointer-events-none ${SIZE_MAP[size]}`}
            draggable={false}
          />
        </div>
        {isVisible && (
          <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark px-2 py-1.5 shadow-sm">
            <span className="mr-1 text-xs text-slate-500 dark:text-slate-400">Boyut:</span>
            {(['small', 'medium', 'large', 'full'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateAttributes({ size: s })}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  size === s
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={SIZE_LABELS[s]}
              >
                {s === 'small' && <RectangleVertical size={14} />}
                {s === 'medium' && <Square size={14} />}
                {s === 'large' && <RectangleHorizontal size={14} />}
                {s === 'full' && <Maximize2 size={14} />}
                {SIZE_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
