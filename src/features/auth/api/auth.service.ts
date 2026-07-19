import {
  emergencyLogin,
  getCsrfToken,
  getCurrentUser,
  getWecomAuthorize,
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

export const getWecomAuthorizeUrl = async (returnTo?: string) => {
  const response = await getWecomAuthorize({
    redirect_uri: returnTo ?? window.location.origin,
  })

  return response.authorize_url
}

export const loginWithEmergencyCredentials = async (
  credentials: LoginCredentials,
) => {
  await emergencyLogin(credentials)
  return fetchCurrentUser()
}

export const loginWithCredentials = loginWithEmergencyCredentials

export const logoutCurrentUser = async () => {
  await logout()
  setCsrfToken(undefined)
}
