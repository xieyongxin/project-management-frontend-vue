import { describe, expect, it } from 'vitest'
import { authKeys } from './auth.keys'

describe('authKeys', () => {
  it('builds stable current user key', () => {
    expect(authKeys.currentUser()).toEqual(['auth', 'current-user'])
  })
})
