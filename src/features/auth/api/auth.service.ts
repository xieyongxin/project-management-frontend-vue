import {
  getCsrfToken,
  getCurrentUser,
  login,
  logout,
} from '@/shared/api/generated/auth-api'
import { setCsrfToken } from '@/shared/api/client'
import type { LoginCredentials } from '../model/login.schema'
import { mapCurrentUser } from '../model/current-user.mapper'

const refreshCsrfToken = async () => {
  const response = await getCsrfToken()
  setCsrfToken(response.token)
}

export const fetchCurrentUser = async () => {
  const dto = await getCurrentUser()
  await refreshCsrfToken()
  return mapCurrentUser(dto)
}

export const loginWithCredentials = async (credentials: LoginCredentials) => {
  await login(credentials)
  return fetchCurrentUser()
}

export const logoutCurrentUser = async () => {
  await logout()
  setCsrfToken(undefined)
}
