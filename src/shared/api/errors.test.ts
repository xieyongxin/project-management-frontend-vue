import { describe, expect, it } from 'vitest'
import { AppError, toAppError } from './errors'

describe('toAppError', () => {
  it('keeps AppError unchanged', () => {
    const error = new AppError({
      code: 'AUTH_SESSION_EXPIRED',
      message: '登录失效',
      status: 401,
    })

    expect(toAppError(error)).toBe(error)
  })

  it('converts unknown error', () => {
    expect(toAppError(new Error('boom')).code).toBe('UNKNOWN_ERROR')
  })
})
