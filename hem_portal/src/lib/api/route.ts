import { NextResponse } from 'next/server'
import { ApiError } from './errors'
import { authenticate } from '@/lib/auth/session'
import { withCapacity, type Workload } from './capacity'

export { ApiError, requireUuid } from './errors'
export { authenticate } from '@/lib/auth/session'

export type ApiContext = Awaited<ReturnType<typeof authenticate>>

type Handler = (request: Request, context: ApiContext) => Promise<Response>

/** Cookie sessions for the portal; verified bearer tokens for other clients. */
export function withApi(handler: Handler, options: { roles?: string[]; workload?: Workload } = {}) {
  return async (request: Request) => {
    const requestId = crypto.randomUUID()
    try {
      // Same-origin browser mutations. Bearer clients authenticate independently.
      const origin = request.headers.get('origin')
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !request.headers.has('authorization') &&
        ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site')) {
        throw new ApiError(403, 'INVALID_ORIGIN', 'This request origin is not allowed.')
      }
      const context = await authenticate(request)
      if (options.roles && !options.roles.includes(context.profile.role || '')) throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.')
      const response = options.workload
        ? await withCapacity(options.workload, () => handler(request, context))
        : await handler(request, context)
      if (response.status >= 400) {
        const body = await response.text()
        let message = body
        try { message = JSON.parse(body).error || body } catch { /* Legacy text responses. */ }
        const status = response.status
        const normalized = NextResponse.json({ error: status >= 500 ? 'The request could not be completed. Please try again.' : message, code: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED', requestId }, { status })
        normalized.headers.set('X-Request-ID', requestId)
        normalized.headers.set('Cache-Control', 'no-store')
        return normalized
      }
      response.headers.set('X-Request-ID', requestId)
      response.headers.set('Cache-Control', 'no-store')
      return response
    } catch (error) {
      const known = error instanceof ApiError
      const malformed = error instanceof SyntaxError
      if (!known && !malformed) console.error(`[API ${requestId}] Unhandled request failure`)
      return NextResponse.json({ error: known ? error.message : malformed ? 'The request body is not valid JSON.' : 'The request could not be completed. Please try again.', code: known ? error.code : malformed ? 'INVALID_JSON' : 'INTERNAL_ERROR', requestId }, { status: known ? error.status : malformed ? 400 : 500, headers: { 'X-Request-ID': requestId, 'Cache-Control': 'no-store' } })
    }
  }
}
