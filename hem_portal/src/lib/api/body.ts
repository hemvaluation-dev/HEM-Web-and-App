import { ApiError } from './errors'

export const MAX_REPORT_BYTES = 20 * 1024 * 1024

/** Count streamed bytes as well as Content-Length, which clients can omit or forge. */
export async function readBytes(body: ReadableStream<Uint8Array> | null, maximum: number): Promise<Uint8Array> {
  if (!body) return new Uint8Array()
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maximum) throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'The file or request exceeds the permitted size.')
      chunks.push(value)
    }
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return bytes
}

export async function boundedRequest(request: Request, maximum = MAX_REPORT_BYTES) {
  if (Number(request.headers.get('content-length')) > maximum) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'The request exceeds the permitted size.')
  }
  const bytes = await readBytes(request.body, maximum)
  const headers = new Headers(request.headers)
  headers.delete('content-length')
  return new Request(request.url, { method: request.method, headers, body: new Blob([new Uint8Array(bytes)]) })
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const value: unknown = await (await boundedRequest(request)).json()
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'INVALID_BODY', 'Supply a JSON object.')
  }
  return value as Record<string, unknown>
}
