import sharp from 'sharp'
import { ApiError } from '@/lib/api/errors'
import { readBytes } from '@/lib/api/body'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** Only the configured storage service may be contacted by the report renderer. */
export function storageImageUrl(value: string, storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL): URL {
  let url: URL
  try {
    url = new URL(value)
    const storage = new URL(storageUrl || '')
    if (url.protocol !== 'https:' || url.origin !== storage.origin || url.username || url.password ||
      !/^\/storage\/v1\/object\/(public|sign)\//.test(url.pathname)) throw new Error()
  } catch {
    throw new ApiError(400, 'INVALID_IMAGE_URL', 'Report images must come from this workspace’s storage.')
  }
  return url
}

export async function reportImage(value: unknown): Promise<Uint8Array | null> {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') throw new ApiError(400, 'INVALID_IMAGE', 'Supply an image URL or encoded image.')
  let bytes: Uint8Array
  if (value.startsWith('data:')) {
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(value)
    if (!match) throw new ApiError(400, 'INVALID_IMAGE', 'Use a JPEG, PNG, or WebP image.')
    if (match[2].length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) throw new ApiError(413, 'IMAGE_TOO_LARGE', 'Each report image must be at most 8 MB.')
    bytes = Buffer.from(match[2], 'base64')
  } else {
    const url = storageImageUrl(value)
    let response: Response
    try {
      response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error()
    } catch {
      throw new ApiError(502, 'IMAGE_UNAVAILABLE', 'A report image could not be loaded. Please try again.')
    }
    if (!IMAGE_TYPES.has(response.headers.get('content-type')?.split(';')[0].trim() || '')) {
      await response.body?.cancel()
      throw new ApiError(400, 'INVALID_IMAGE', 'Use a JPEG, PNG, or WebP image.')
    }
    bytes = await readBytes(response.body, MAX_IMAGE_BYTES)
  }
  try {
    // Decode locally before forwarding to PDF/DOCX. Never let renderers fetch remote input.
    return new Uint8Array(await sharp(bytes, { limitInputPixels: 40_000_000, animated: false })
      .rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 }).toBuffer())
  } catch {
    throw new ApiError(400, 'INVALID_IMAGE', 'A report image is invalid or exceeds the supported dimensions.')
  }
}

export async function reportImageDataUrl(value: unknown): Promise<string> {
  const bytes = await reportImage(value)
  return bytes ? `data:image/jpeg;base64,${Buffer.from(bytes).toString('base64')}` : ''
}
