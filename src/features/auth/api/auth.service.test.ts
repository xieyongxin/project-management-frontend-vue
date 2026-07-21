import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentUser, loginWithCredentials } from './auth.service'

const api = vi.hoisted(() => ({
  getCsrfToken: vi.fn(),
  getCurrentUser: vi.fn(),
  mockWecomLogin: vi.fn(),
}))

vi.mock('@/shared/api/generated/auth-api', () => ({
  getCsrfToken: api.getCsrfToken,
  getCurrentUser: api.getCurrentUser,
  getWecomAuthorize: vi.fn(),
  logout: vi.fn(),
  mockWecomLogin: api.mockWecomLogin,
}))

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs in and fetches current user through the generated API client', async () => {
    api.mockWecomLogin.mockResolvedValue(undefined)
    api.getCurrentUser.mockResolvedValue({
      id: 'user-demo-001',
      displayName: '张思远',
      email: 'demo@example.com',
      roles: ['项目成员'],
      permissions: ['dashboard:read'],
      lastLoginAt: '2026-07-19T00:30:00.000Z',
    })
    api.getCsrfToken.mockResolvedValue({ token: 'csrf-token' })

    const user = await loginWithCredentials({
      email: 'demo@example.com',
    })

    expect(api.mockWecomLogin).toHaveBeenCalledWith({
      email: 'demo@example.com',
    })
    expect(user.displayName).toBe('张思远')
    expect(user.permissions.has('dashboard:read')).toBe(true)
  })

  it('rejects current user when not authenticated', async () => {
    api.getCurrentUser.mockRejectedValue({
      code: 'AUTH_SESSION_EXPIRED',
      status: 401,
    })

    await expect(fetchCurrentUser()).rejects.toMatchObject({
      code: 'AUTH_SESSION_EXPIRED',
      status: 401,
    })
  })
})
