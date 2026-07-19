import { delay, http, HttpResponse } from 'msw'
import {
  currentUser,
  getProjectNavigationFor,
  getProjectOverviewFor,
  getProjectStatsFrom,
  projectTypeConfigs,
  projects,
  recentActivity,
  roles,
  todos,
  users,
  workflows,
  workspaceSummary,
} from './mock-data'
import type {
  ProjectCreateRequest,
  ProjectDto,
  ProjectTypeConfigUpdate,
  RoleCreate,
  RoleUpdate,
  WorkflowUpdate,
} from '@/shared/api/generated/models'

let authenticated = false

const unauthorized = () =>
  HttpResponse.json(
    {
      code: 'AUTH_SESSION_EXPIRED',
      message: '登录状态已失效，请重新登录。',
      traceId: 'mock-auth-401',
    },
    { status: 401 },
  )

const nowText = () => '2026-07-19 08:30'

export const resetMockSession = () => {
  authenticated = false
}

const requireSession = () => (authenticated ? undefined : unauthorized())

const getQuery = (request: Request) => new URL(request.url).searchParams

const filterProjects = (request: Request) => {
  const query = getQuery(request)
  const keyword = query.get('keyword')?.trim().toLowerCase()
  const method = query.get('method')
  const status = query.get('status')
  const riskStatus = query.get('risk_status')

  return projects.filter((project) => {
    if (
      keyword &&
      !project.name.toLowerCase().includes(keyword) &&
      !project.identifier.toLowerCase().includes(keyword)
    ) {
      return false
    }

    if (method && project.method !== method) {
      return false
    }

    if (status && project.status !== status) {
      return false
    }

    if (riskStatus && project.health_status !== riskStatus) {
      return false
    }

    return true
  })
}

export const handlers = [
  http.get('/api/v1/auth/wecom/authorize', async ({ request }) => {
    await delay(120)
    const redirectUri = getQuery(request).get('redirect_uri') ?? '/workspace'

    return HttpResponse.json({
      authorize_url: `/api/v1/auth/wecom/callback?code=mock-wecom-code&state=${encodeURIComponent(redirectUri)}`,
    })
  }),

  http.get('/api/v1/auth/wecom/callback', async () => {
    await delay(150)
    authenticated = true
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/auth/emergency/login', async ({ request }) => {
    await delay(250)
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    if (body.email !== 'demo@example.com' || body.password !== 'demo1234') {
      return HttpResponse.json(
        {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: '应急管理员账号或密码不正确。',
          traceId: 'mock-auth-login',
        },
        { status: 401 },
      )
    }

    authenticated = true
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/auth/login', async ({ request }) => {
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

  http.post('/api/v1/auth/logout', async ({ request }) => {
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

  http.get('/api/v1/me', async () => {
    await delay(160)
    return authenticated ? HttpResponse.json(currentUser) : unauthorized()
  }),

  http.get('/api/v1/auth/me', async () => {
    await delay(160)
    return authenticated ? HttpResponse.json(currentUser) : unauthorized()
  }),

  http.get('/api/v1/auth/csrf', async () => {
    await delay(80)
    return authenticated
      ? HttpResponse.json({ token: 'mock-csrf-token' })
      : unauthorized()
  }),

  http.get('/api/v1/analytics/workspace/summary', async () => {
    const error = requireSession()
    if (error) return error
    await delay(180)
    return HttpResponse.json(workspaceSummary)
  }),

  http.get('/api/v1/work-items/my-todos', async ({ request }) => {
    const error = requireSession()
    if (error) return error
    await delay(180)
    const type = getQuery(request).get('type')
    const data =
      !type || type === 'all'
        ? todos
        : todos.filter((todo) => todo.type === type)
    return HttpResponse.json(data)
  }),

  http.get('/api/v1/activity/recent', async () => {
    const error = requireSession()
    if (error) return error
    await delay(180)
    return HttpResponse.json(recentActivity)
  }),

  http.get('/api/v1/project-type-configs', async () => {
    const error = requireSession()
    if (error) return error
    await delay(120)
    return HttpResponse.json(projectTypeConfigs)
  }),

  http.patch(
    '/api/v1/project-type-configs/:id',
    async ({ params, request }) => {
      const error = requireSession()
      if (error) return error
      const body = (await request.json()) as ProjectTypeConfigUpdate
      const index = projectTypeConfigs.findIndex(
        (item) => item.id === params.id,
      )

      const current = projectTypeConfigs[index]

      if (!current) {
        return HttpResponse.json(
          { code: 'resource_not_found', message: '配置不存在' },
          { status: 404 },
        )
      }

      const next: typeof current = {
        ...current,
        tabs: body.tabs,
        row_version: body.row_version + 1,
        updated_by: currentUser.displayName,
        updated_at: nowText(),
      }
      projectTypeConfigs[index] = next
      return HttpResponse.json(next)
    },
  ),

  http.get('/api/v1/workflow-definitions', async () => {
    const error = requireSession()
    if (error) return error
    await delay(120)
    return HttpResponse.json(workflows)
  }),

  http.patch(
    '/api/v1/workflow-definitions/:id',
    async ({ params, request }) => {
      const error = requireSession()
      if (error) return error
      const body = (await request.json()) as WorkflowUpdate
      const index = workflows.findIndex((item) => item.id === params.id)

      const current = workflows[index]

      if (!current) {
        return HttpResponse.json(
          { code: 'resource_not_found', message: '工作流不存在' },
          { status: 404 },
        )
      }

      const next: typeof current = {
        ...current,
        states: body.states,
        transitions: body.transitions,
        row_version: body.row_version + 1,
        updated_by: currentUser.displayName,
        updated_at: nowText(),
      }
      workflows[index] = next
      return HttpResponse.json(next)
    },
  ),

  http.post('/api/v1/workflow-definitions/:id/validate', async () => {
    await delay(80)
    return HttpResponse.json({ valid: true, errors: [], warnings: [] })
  }),

  http.post(
    '/api/v1/workflow-definitions/:id/restore-default',
    async ({ params }) => {
      const error = requireSession()
      if (error) return error
      await delay(120)
      const workflow = workflows.find((item) => item.id === params.id)
      return workflow
        ? HttpResponse.json(workflow)
        : HttpResponse.json(
            { code: 'resource_not_found', message: '工作流不存在' },
            { status: 404 },
          )
    },
  ),

  http.get('/api/v1/role-definitions', async () => {
    const error = requireSession()
    if (error) return error
    await delay(120)
    return HttpResponse.json(roles)
  }),

  http.post('/api/v1/role-definitions', async ({ request }) => {
    const error = requireSession()
    if (error) return error
    const body = (await request.json()) as RoleCreate
    const role = {
      id: `role-${Date.now()}`,
      role_key: body.role_key,
      name: body.name,
      description: body.description ?? '',
      scope: body.scope,
      enabled: true,
      is_system: false,
      row_version: 1,
      updated_at: nowText(),
    }
    roles.push(role)
    return HttpResponse.json(role)
  }),

  http.patch('/api/v1/role-definitions/:id', async ({ params, request }) => {
    const error = requireSession()
    if (error) return error
    const body = (await request.json()) as RoleUpdate
    const index = roles.findIndex((role) => role.id === params.id)

    const current = roles[index]

    if (!current) {
      return HttpResponse.json(
        { code: 'resource_not_found', message: '角色不存在' },
        { status: 404 },
      )
    }

    const next: typeof current = {
      ...current,
      ...body,
      row_version: body.row_version + 1,
      updated_at: nowText(),
    }
    roles[index] = next
    return HttpResponse.json(next)
  }),

  http.delete('/api/v1/role-definitions/:id', async ({ params }) => {
    const error = requireSession()
    if (error) return error
    await delay(120)
    const role = roles.find((item) => item.id === params.id)

    if (!role || role.is_system) {
      return HttpResponse.json(
        { code: 'business_rule_failed', message: '内置角色不可删除。' },
        { status: 422 },
      )
    }

    const roleIndex = roles.findIndex((item) => item.id === params.id)
    roles.splice(roleIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/projects', async ({ request }) => {
    const error = requireSession()
    if (error) return error
    await delay(200)
    const query = getQuery(request)
    const page = Number(query.get('page') ?? 1)
    const pageSize = Number(query.get('page_size') ?? 10)
    const filtered = filterProjects(request)
    const start = (page - 1) * pageSize
    return HttpResponse.json({
      data: filtered.slice(start, start + pageSize),
      pagination: {
        page,
        page_size: pageSize,
        total: filtered.length,
      },
    })
  }),

  http.get('/api/v1/projects/stats', async ({ request }) => {
    const error = requireSession()
    if (error) return error
    await delay(120)
    return HttpResponse.json(getProjectStatsFrom(filterProjects(request)))
  }),

  http.post('/api/v1/projects', async ({ request }) => {
    const error = requireSession()
    if (error) return error
    const body = (await request.json()) as ProjectCreateRequest
    const owner = users.find((user) => user.id === body.owner_id) ?? users[0]
    const project: ProjectDto = {
      id: `project-${Date.now()}`,
      identifier: body.identifier,
      name: body.name,
      method: body.method,
      status: 'active',
      visibility: body.visibility,
      owner,
      current_stage:
        body.method === 'scrum' ? '迭代 1 / Sprint 1/6' : '需求阶段 / 阶段 1/6',
      requirement_completion_rate: 0,
      task_completion_rate: 0,
      test_pass_rate: 'A',
      blocker_or_critical_defect_count: 0,
      health_status: 'healthy',
      risk_summary: '新项目暂无风险',
      updated_at: nowText(),
      description: body.description ?? '',
    }
    projects.unshift(project)
    return HttpResponse.json(project)
  }),

  http.get('/api/v1/projects/:id', async ({ params }) => {
    const error = requireSession()
    if (error) return error
    await delay(120)
    const project = projects.find((item) => item.id === params.id)
    return project
      ? HttpResponse.json(project)
      : HttpResponse.json(
          { code: 'resource_not_found', message: '项目不存在' },
          { status: 404 },
        )
  }),

  http.get('/api/v1/projects/:id/navigation', async ({ params }) => {
    const error = requireSession()
    if (error) return error
    await delay(120)
    const project = projects.find((item) => item.id === params.id)
    return project
      ? HttpResponse.json(getProjectNavigationFor(project))
      : HttpResponse.json(
          { code: 'resource_not_found', message: '项目不存在' },
          { status: 404 },
        )
  }),

  http.get('/api/v1/projects/:id/overview', async ({ params }) => {
    const error = requireSession()
    if (error) return error
    await delay(120)
    const project = projects.find((item) => item.id === params.id)
    return project
      ? HttpResponse.json(getProjectOverviewFor(project))
      : HttpResponse.json(
          { code: 'resource_not_found', message: '项目不存在' },
          { status: 404 },
        )
  }),
]
