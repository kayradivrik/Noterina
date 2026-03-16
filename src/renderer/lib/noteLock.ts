/**
 * Yeni, sade not kilitleme sistemi.
 * - Hex string kullanır (base64 yok)
 * - Ayrı hash tutmaz; şifre yanlışsa decrypt hata verir.
 */

const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH_BITS = 256
const SALT_BYTES = 16
const NONCE_BYTES = 12

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string | undefined | null): Uint8Array {
  const clean = String(hex ?? '').trim().toLowerCase()
  if (!clean || clean.length % 2 !== 0) return new Uint8Array()
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    out[i / 2] = parseInt(clean.slice(i, i + 2), 16)
  }
  return out
}

function normalizeSecret(password: string): string {
  return password.trim().normalize('NFC')
}

async function deriveLockKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const normalized = normalizeSecret(password)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalized),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH_BITS
  )

  return crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

function randomBytes(length: number): Uint8Array {
  const buf = new Uint8Array(length)
  crypto.getRandomValues(buf)
  return buf
}

export interface NoteLockPayload {
  /** Şifrelenmiş içerik (hex) */
  lockedHex: string
  /** PBKDF2 tuzu (hex) */
  lockSaltHex: string
  /** AES-GCM nonce/iv (hex) */
  lockNonceHex: string
}

/** Düz içeriği şifreler. */
export async function lockNoteContent(
  plainHtml: string,
  password: string,
  existing?: { lockSaltHex?: string; lockNonceHex?: string }
): Promise<NoteLockPayload> {
  const salt =
    existing?.lockSaltHex && existing.lockSaltHex.trim()
      ? fromHex(existing.lockSaltHex)
      : randomBytes(SALT_BYTES)
  const nonce =
    existing?.lockNonceHex && existing.lockNonceHex.trim()
      ? fromHex(existing.lockNonceHex)
      : randomBytes(NONCE_BYTES)

  const key = await deriveLockKey(password, salt)
  const encoded = new TextEncoder().encode(plainHtml)
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce as BufferSource, tagLength: 128 },
    key,
    encoded
  )

  return {
    lockedHex: toHex(new Uint8Array(cipher)),
    lockSaltHex: toHex(salt),
    lockNonceHex: toHex(nonce),
  }
}

/** Şifreli içeriği çözer; şifre yanlışsa hata fırlatır. */
export async function unlockNoteContent(
  lockedHex: string,
  password: string,
  lockSaltHex: string,
  lockNonceHex: string
): Promise<string> {
  const salt = fromHex(lockSaltHex ?? '')
  const nonce = fromHex(lockNonceHex ?? '')
  if (!salt.length || !nonce.length || !String(lockedHex).trim()) {
    throw new Error('Missing lock data')
  }
  const cipher = fromHex(lockedHex)
  const key = await deriveLockKey(password, salt)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce as BufferSource, tagLength: 128 },
    key,
    cipher as BufferSource
  )
  return new TextDecoder().decode(decrypted)
}

