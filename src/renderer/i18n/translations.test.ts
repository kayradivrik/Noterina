import { describe, it, expect } from 'vitest'
import { getTranslation } from './translations'

describe('translations', () => {
  describe('getTranslation', () => {
    it('returns Turkish for lang tr', () => {
      expect(getTranslation('tr', 'sidebar.allNotes')).toBe('Tüm Notlar')
      expect(getTranslation('tr', 'notes.myNotes')).toBe('Notlarım')
    })

    it('returns English for lang en', () => {
      expect(getTranslation('en', 'sidebar.allNotes')).toBe('All Notes')
      expect(getTranslation('en', 'notes.myNotes')).toBe('My Notes')
    })

    it('interpolates {{count}} in TR', () => {
      expect(getTranslation('tr', 'notes.count', { count: 5 })).toBe('5 not')
      expect(getTranslation('tr', 'time.minutesAgo', { count: 2 })).toBe('2 dk önce')
    })

    it('interpolates {{count}} in EN', () => {
      expect(getTranslation('en', 'notes.count', { count: 5 })).toBe('5 notes')
      expect(getTranslation('en', 'time.minutesAgo', { count: 2 })).toBe('2m ago')
    })

    it('interpolates {{version}}', () => {
      expect(getTranslation('tr', 'settings.aboutVersion', { version: '1.0.0' })).toBe('v1.0.0')
      expect(getTranslation('en', 'settings.aboutVersion', { version: '1.0.0' })).toBe('v1.0.0')
    })

    it('falls back to key or TR for unknown key', () => {
      const result = getTranslation('en', 'sidebar.allNotes' as any)
      expect(typeof result).toBe('string')
      expect(getTranslation('en', 'notes.myNotes')).toBe('My Notes')
    })
  })
})
