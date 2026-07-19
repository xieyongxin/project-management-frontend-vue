const defaultReturnTo = '/'

const isLoginPath = (path: string) =>
  path === '/login' || path.startsWith('/login?') || path.startsWith('/login#')

const isInternalPath = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')

export const resolveSafeReturnTo = (
  value: unknown,
  fallback = defaultReturnTo,
) => {
  const candidate: unknown = Array.isArray(value) ? value[0] : value

  if (typeof candidate !== 'string') {
    return fallback
  }

  if (!isInternalPath(candidate) || isLoginPath(candidate)) {
    return fallback
  }

  return candidate
}
