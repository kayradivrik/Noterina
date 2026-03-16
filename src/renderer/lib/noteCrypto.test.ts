import { describe, it, expect } from 'vitest'
import { describe, it, expect } from 'vitest'
import { lockNoteContent, unlockNoteContent } from './noteLock'

describe('noteLock (yeni sistem)', () => {
  it('encrypt/decrypt round-trip works', async () => {
    const plain = '<p>Gizli not</p>'
    const password = 'mySecret123'
    const payload = await lockNoteContent(plain, password)
    const decrypted = await unlockNoteContent(
      payload.lockPayloadHex,
      password,
      payload.lockSaltHex,
      payload.lockNonceHex
    )
    expect(decrypted).toBe(plain)
  })

  it('wrong password fails', async () => {
    const plain = '<p>Gizli</p>'
    const payload = await lockNoteContent(plain, 'correct')
    await expect(
      unlockNoteContent(payload.lockPayloadHex, 'wrong', payload.lockSaltHex, payload.lockNonceHex)
    ).rejects.toBeTruthy()
  })

  it('trimmed password still matches', async () => {
    const plain = '<p>Test</p>'
    const payload = await lockNoteContent(plain, '  trimme  ')
    const decrypted = await unlockNoteContent(
      payload.lockPayloadHex,
      'trimme',
      payload.lockSaltHex,
      payload.lockNonceHex
    )
    expect(decrypted).toBe(plain)
  })

  it('large content round-trip', async () => {
    const plain = '<p>' + 'x'.repeat(100_000) + '</p>'
    const password = 'secret'
    const payload = await lockNoteContent(plain, password)
    const decrypted = await unlockNoteContent(
      payload.lockPayloadHex,
      password,
      payload.lockSaltHex,
      payload.lockNonceHex
    )
    expect(decrypted).toBe(plain)
  })
})
