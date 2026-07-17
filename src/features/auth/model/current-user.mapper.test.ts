import { describe, expect, it } from 'vitest'
import { mapCurrentUser } from './current-user.mapper'

describe('mapCurrentUser', () => {
  it('maps DTO to domain user', () => {
    const user = mapCurrentUser({
      id: 'user-1',
      displayName: '演示用户',
      email: 'demo@example.com',
      roles: ['成员'],
      permissions: ['dashboard:read'],
      lastLoginAt: '2026-07-14T03:30:00.000Z',
    })

    expect(user.permissions.has('dashboard:read')).toBe(true)
    expect(user.lastLoginAt).toBeInstanceOf(Date)
  })
})
