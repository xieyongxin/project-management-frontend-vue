import type { CurrentUserDto } from '@/shared/api/generated/models'
import type { CurrentUser } from './current-user'

export const mapCurrentUser = (dto: CurrentUserDto): CurrentUser => ({
  id: dto.id,
  displayName: dto.displayName,
  email: dto.email,
  roles: dto.roles,
  permissions: new Set(dto.permissions),
  lastLoginAt: new Date(dto.lastLoginAt),
})
