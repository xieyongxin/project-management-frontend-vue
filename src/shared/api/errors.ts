import { AxiosError } from 'axios'

export interface AppErrorInit {
  code: string
  message: string
  status?: number | undefined
  traceId?: string | undefined
  cause?: unknown
  fieldErrors?: Record<string, string[]> | undefined
}

export class AppError extends Error {
  readonly code: string
  readonly status: number | undefined
  readonly traceId: string | undefined
  readonly fieldErrors: Record<string, string[]> | undefined

  constructor(init: AppErrorInit) {
    super(init.message)
    this.name = 'AppError'
    this.code = init.code
    this.status = init.status
    this.traceId = init.traceId
    this.fieldErrors = init.fieldErrors
    this.cause = init.cause
  }
}

const isErrorPayload = (
  value: unknown,
): value is {
  code?: unknown
  message?: unknown
  traceId?: unknown
  fieldErrors?: unknown
} => typeof value === 'object' && value !== null

export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof AxiosError) {
    const payload: unknown = error.response?.data

    if (isErrorPayload(payload)) {
      return new AppError({
        code:
          typeof payload.code === 'string'
            ? payload.code
            : 'HTTP_REQUEST_FAILED',
        message:
          typeof payload.message === 'string'
            ? payload.message
            : '请求失败，请稍后重试。',
        status: error.response?.status,
        traceId:
          typeof payload.traceId === 'string' ? payload.traceId : undefined,
        fieldErrors:
          typeof payload.fieldErrors === 'object' &&
          payload.fieldErrors !== null
            ? (payload.fieldErrors as Record<string, string[]>)
            : undefined,
        cause: error,
      })
    }

    return new AppError({
      code: 'HTTP_REQUEST_FAILED',
      message: error.message || '请求失败，请稍后重试。',
      status: error.response?.status,
      cause: error,
    })
  }

  return new AppError({
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : '发生未知错误。',
    cause: error,
  })
}
