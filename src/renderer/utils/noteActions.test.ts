import { describe, it, expect } from 'vitest'
import { stripHtml, getPreviewText, formatRelativeTime } from './noteActions'

describe('noteActions', () => {
  describe('stripHtml', () => {
    it('removes HTML tags and returns plain text', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello')
      expect(stripHtml('<h1>Title</h1><p>Body</p>')).toBe('TitleBody')
    })

    it('handles empty or whitespace', () => {
      expect(stripHtml('')).toBe('')
      expect(stripHtml('<p></p>')).toBe('')
    })

    it('handles nested tags', () => {
      expect(stripHtml('<div><span>Nested</span></div>')).toBe('Nested')
    })
  })

  describe('getPreviewText', () => {
    it('returns text up to maxLen when shorter', () => {
      const html = '<p>Short</p>'
      expect(getPreviewText(html, 20)).toBe('Short')
    })

    it('truncates and adds ... when longer than maxLen', () => {
      const html = '<p>This is a longer text content</p>'
      expect(getPreviewText(html, 10)).toBe('This is a ...')
    })

    it('collapses whitespace', () => {
      expect(getPreviewText('<p>  a   b  </p>', 20)).toBe('a b')
    })
  })

  describe('formatRelativeTime', () => {
    it('returns "Just now" / "Az önce" for very recent date (TR)', () => {
      const now = new Date()
      const result = formatRelativeTime(now.toISOString(), 'tr')
      expect(result).toBe('Az önce')
    })

    it('returns "Just now" for very recent date (EN)', () => {
      const now = new Date()
      const result = formatRelativeTime(now.toISOString(), 'en')
      expect(result).toBe('Just now')
    })

    it('returns minutes ago with count (EN)', () => {
      const past = new Date(Date.now() - 5 * 60 * 1000)
      const result = formatRelativeTime(past.toISOString(), 'en')
      expect(result).toBe('5m ago')
    })

    it('returns minutes ago with count (TR)', () => {
      const past = new Date(Date.now() - 3 * 60 * 1000)
      const result = formatRelativeTime(past.toISOString(), 'tr')
      expect(result).toMatch(/3 dk önce/)
    })

    it('returns formatted date for old dates (EN locale)', () => {
      const oldDate = new Date('2024-01-15')
      const result = formatRelativeTime(oldDate.toISOString(), 'en')
      expect(result).toMatch(/Jan|15|2024/)
    })
  })
})
