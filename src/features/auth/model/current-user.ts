export interface CurrentUser {
  id: string
  displayName: string
  email: string
  roles: string[]
  permissions: ReadonlySet<string>
  lastLoginAt: Date
}

export type { WecomAuthorizeResponse } from '@/shared/api/generated/models'
