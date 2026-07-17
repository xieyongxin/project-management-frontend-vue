export interface CurrentUser {
  id: string
  displayName: string
  email: string
  roles: string[]
  permissions: ReadonlySet<string>
  lastLoginAt: Date
}
