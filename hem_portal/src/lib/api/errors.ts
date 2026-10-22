export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export type ActionResult = { success: true; error?: never } | { success?: never; error: string }

export function actionError(error: unknown): ActionResult {
  return { error: error instanceof ApiError ? error.message : 'The request could not be completed. Please try again.' }
}

export function requireUuid(value: unknown, field = 'id'): asserts value is string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new ApiError(400, 'INVALID_ID', `${field} must be a valid UUID.`)
  }
}
