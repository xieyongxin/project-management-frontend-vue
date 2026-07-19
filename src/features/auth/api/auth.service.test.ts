import { describe, expect, it } from 'vitest'
import { fetchCurrentUser, loginWithCredentials } from './auth.service'

describe('auth.service', () => {
  it('logs in and fetches current user through mock API', async () => {
    const user = await loginWithCredentials({
      email: 'demo@example.com',
      password: 'demo1234',
    })

    expect(user.displayName).toBe('张思远')
    expect(user.permissions.has('dashboard:read')).toBe(true)
  })

  it('rejects current user when not authenticated', async () => {
    await expect(fetchCurrentUser()).rejects.toMatchObject({
      code: 'AUTH_SESSION_EXPIRED',
      status: 401,
    })
  })
})
