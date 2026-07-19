import { describe, expect, it } from 'vitest'
import { resolveSafeReturnTo } from './return-to'

describe('resolveSafeReturnTo', () => {
  it('keeps internal application paths', () => {
    expect(resolveSafeReturnTo('/projects?status=open#list')).toBe(
      '/projects?status=open#list',
    )
  })

  it('uses the first value from duplicated query params', () => {
    expect(resolveSafeReturnTo(['/tasks', '/projects'])).toBe('/tasks')
  })

  it('rejects external and protocol-relative targets', () => {
    expect(resolveSafeReturnTo('https://example.com')).toBe('/')
    expect(resolveSafeReturnTo('//example.com')).toBe('/')
  })

  it('does not redirect back to the login page after login', () => {
    expect(resolveSafeReturnTo('/login?returnTo=/projects')).toBe('/')
  })
})
