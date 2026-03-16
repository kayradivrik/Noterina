/**
 * Not şifreleme: PBKDF2 (SHA-256, 100k iter) + AES-GCM.
 * Şifre asla saklanmaz; sadece hash (doğrulama) ve şifreli içerik.
 */

const PBKDF2_ITERATIONS = 100_000
const SALT_LENGTH = 16
const IV_LENGTH = 12
const KEY_LENGTH_BITS = 256

const APPLY_MAX = 65535

function base64Encode(bytes: ArrayBuffer | Uint8Array): string {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < u.length; i += APPLY_MAX) {
    const chunk = u.subarray(i, Math.min(i + APPLY_MAX, u.length))
    binary += String.fromCharCode.apply(null, Array.from(chunk))
  }
  return btoa(binary)
}

function normalizeBase64(str: string): string {
  return String(str)
    .replace(/\s/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
}

function base64Decode(str: string): Uint8Array {
  const normalized = normalizeBase64(str)
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
}

/** PBKDF2 ile tuz üretir (doğrulama hash + AES key için). */
export async function generateSalt(): Promise<Uint8Array> {
  const bytes = new Uint8Array(SALT_LENGTH)
  crypto.getRandomValues(bytes)
  return bytes
}

/** AES-GCM için IV üretir. */
export async function generateIv(): Promise<Uint8Array> {
  const bytes = new Uint8Array(IV_LENGTH)
  crypto.getRandomValues(bytes)
  return bytes
}

/** Şifre + tuz ile PBKDF2 çıktısı (256 bit). Doğrulama ve AES key olarak kullanılır. */
function normalizePassword(pwd: string): string {
  return pwd.trim().normalize('NFC')
}

export async function deriveKeyBits(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const keyMaterial = await getKeyMaterial(normalizePassword(password))
  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH_BITS
  )
}

/** PBKDF2 çıktısını AES-GCM key olarak döner. */
export async function deriveEncryptionKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const bits = await deriveKeyBits(password, salt)
  return crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

/** Şifreyi doğrular: tuz + hash ile eşleşiyor mu? */
export async function verifyPassword(
  password: string,
  saltBase64: string,
  hashBase64: string
): Promise<boolean> {
  if (!saltBase64 || !hashBase64) return false
  const salt = base64Decode(String(saltBase64).trim())
  const bits = await deriveKeyBits(password, salt)
  const computed = base64Encode(bits)
  return computed === String(hashBase64).trim()
}

/** Düz metni şifreler; content + passwordHash + salt + iv döner. */
export async function encryptNoteContent(
  plainContent: string,
  password: string,
  existingSalt?: string,
  existingIv?: string
): Promise<{ content: string; passwordHash: string; passwordSalt: string; contentIv: string }> {
  const pwd = normalizePassword(password)
  const salt =
    existingSalt && String(existingSalt).trim()
      ? base64Decode(String(existingSalt).trim())
      : await generateSalt()
  const iv =
    existingIv && String(existingIv).trim()
      ? base64Decode(String(existingIv).trim())
      : await generateIv()
  const key = await deriveEncryptionKey(pwd, salt)
  const keyBits = await deriveKeyBits(pwd, salt)
  const passwordHash = base64Encode(keyBits)

  const encoded = new TextEncoder().encode(plainContent)
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource, tagLength: 128 },
    key,
    encoded
  )
  const content = base64Encode(cipher)
  return {
    content,
    passwordHash,
    passwordSalt: base64Encode(salt),
    contentIv: base64Encode(iv),
  }
}

/** Şifreli içeriği açar. Şifre yanlışsa hata fırlatır. */
export async function decryptNoteContent(
  encryptedContentBase64: string,
  password: string,
  saltBase64: string,
  ivBase64: string
): Promise<string> {
  const pwd = normalizePassword(password)
  if (!pwd || !saltBase64 || !ivBase64 || !encryptedContentBase64) {
    throw new Error('Missing data')
  }
  const salt = base64Decode(saltBase64)
  const iv = base64Decode(ivBase64)
  const cipher = base64Decode(encryptedContentBase64)
  const key = await deriveEncryptionKey(pwd, salt)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource, tagLength: 128 },
    key,
    cipher as BufferSource
  )
  return new TextDecoder().decode(decrypted)
}
