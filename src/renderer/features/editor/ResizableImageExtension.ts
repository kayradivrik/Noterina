import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImage } from './ResizableImage'

export type ImageSize = 'small' | 'medium' | 'large' | 'full'

export const ResizableImageExtension = Node.create({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      size: {
        default: 'medium' as ImageSize,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-size') || 'medium',
        renderHTML: (attrs) => (attrs.size ? { 'data-size': attrs.size } : {}),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
        getAttrs: (dom) => {
          const el = dom as HTMLElement
          return {
            src: el.getAttribute('src'),
            alt: el.getAttribute('alt'),
            title: el.getAttribute('title'),
            size: (el.getAttribute('data-size') as ImageSize) || 'medium',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage)
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string; size?: ImageSize }) =>
        ({ commands }: { commands: { insertContent: (content: object) => boolean } }) =>
          commands.insertContent({
            type: this.name,
            attrs: { ...options, size: options.size ?? 'medium' },
          }),
    } as unknown as Partial<import('@tiptap/core').RawCommands>
  },
})
