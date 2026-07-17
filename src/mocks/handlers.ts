import { delay, http, HttpResponse } from 'msw'

let authenticated = false

const currentUser = {
  id: 'user-demo-001',
  displayName: '演示用户',
  email: 'demo@example.com',
  roles: ['项目成员'],
  permissions: [
    'dashboard:read',
    'project:read',
    'task:read',
    'file:read',
    'approval:read',
    'settings:read',
  ],
  lastLoginAt: '2026-07-14T03:30:00.000Z',
}

const unauthorized = () =>
  HttpResponse.json(
    {
      code: 'AUTH_SESSION_EXPIRED',
      message: '登录状态已失效，请重新登录。',
      traceId: 'mock-auth-401',
    },
    { status: 401 },
  )

export const resetMockSession = () => {
  authenticated = false
}

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(250)
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    if (body.email !== 'demo@example.com' || body.password !== 'demo1234') {
      return HttpResponse.json(
        {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: '邮箱或密码不正确。',
          traceId: 'mock-auth-login',
        },
        { status: 401 },
      )
    }

    authenticated = true
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    await delay(150)

    if (!authenticated) {
      return unauthorized()
    }

    if (request.headers.get('X-CSRF-Token') !== 'mock-csrf-token') {
      return HttpResponse.json(
        {
          code: 'AUTH_CSRF_INVALID',
          message: '安全校验失败，请刷新页面后重试。',
        },
        { status: 403 },
      )
    }

    authenticated = false
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/auth/me', async () => {
    await delay(200)
    return authenticated ? HttpResponse.json(currentUser) : unauthorized()
  }),

  http.get('/api/auth/csrf', async () => {
    await delay(80)
    return authenticated
      ? HttpResponse.json({ token: 'mock-csrf-token' })
      : unauthorized()
  }),
]
