import {
  getCsrfToken,
  getCurrentUser,
  getWecomAuthorize,
  logout,
  mockWecomLogin,
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

export const getWecomAuthorizeTarget = async (returnTo?: string) => {
  return getWecomAuthorize({
    redirect_uri: returnTo ?? window.location.origin,
  })
}

export const loginWithMockWecomEmail = async (
  credentials: LoginCredentials,
) => {
  await mockWecomLogin(credentials)
  return fetchCurrentUser()
}

export const loginWithCredentials = loginWithMockWecomEmail

export const logoutCurrentUser = async () => {
  await logout()
  setCsrfToken(undefined)
}
