import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/shared/config/env'
import { logger } from '@/shared/lib/logger'
import { toAppError } from './errors'

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData

export const UNAUTHORIZED_EVENT = 'app:unauthorized'

const safeMethods = new Set(['get', 'head', 'options'])
let csrfToken: string | undefined

export const setCsrfToken = (token: string | undefined) => {
  csrfToken = token
}

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
})

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toLowerCase() ?? 'get'

  if (!safeMethods.has(method) && csrfToken) {
    config.headers.set('X-CSRF-Token', csrfToken)
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const appError = toAppError(error)
    const log =
      appError.status === 401 || appError.status === 403
        ? logger.warn
        : logger.error

    log('API 请求失败', {
      code: appError.code,
      status: appError.status,
      traceId: appError.traceId,
    })

    if (appError.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    }

    return Promise.reject(appError)
  },
)

export const apiClient = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const response = await axiosInstance.request<T>({
    ...config,
    ...options,
    headers: {
      ...config.headers,
      ...options?.headers,
    },
  })

  return response.data
}
