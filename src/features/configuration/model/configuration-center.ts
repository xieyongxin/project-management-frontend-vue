export type ConfigurationSection = 'project-types' | 'workflows' | 'roles'
export type ProjectTypeKey = 'scrum' | 'waterfall'
export type WorkflowKey = 'requirement' | 'task' | 'defect'
export type RoleScope = 'global' | 'project'

export interface ProjectTypeTabConfig {
  key: string
  label: string
  enabled: boolean
  error?: string | undefined
}

export interface ProjectTypeConfig {
  typeKey: ProjectTypeKey
  name: string
  method: 'scrum' | 'waterfall'
  description: string
  tabs: ProjectTypeTabConfig[]
  updatedBy: string
  updatedAt: string
}

export interface WorkflowStateConfig {
  id: string
  name: string
  color: string
  initial: boolean
  terminal: boolean
  error?: string | undefined
}

export interface TransitionNotificationConfig {
  enabled: boolean
  recipientRules: string[]
  roleKeys: string[]
  template: string
}

export interface TransitionWebhookConfig {
  enabled: boolean
  url: string
  secretConfigured: boolean
}

export interface WorkflowTransitionConfig {
  id: string
  fromStateId: string
  toStateId: string
  allowedRoleKeys: string[]
  requireComment: boolean
  notification: TransitionNotificationConfig
  webhook: TransitionWebhookConfig
  error?: string | undefined
}

export interface WorkflowConfig {
  key: WorkflowKey
  name: string
  description: string
  states: WorkflowStateConfig[]
  transitions: WorkflowTransitionConfig[]
  updatedBy: string
  updatedAt: string
}

export interface RoleConfig {
  roleKey: string
  name: string
  description: string
  scope: RoleScope
  enabled: boolean
  system: boolean
  used: boolean
  updatedAt: string
  error?: string | undefined
}

export interface AuditEntry {
  id: string
  actor: string
  target: string
  summary: string
  createdAt: string
}

export interface ConfigurationState {
  projectTypes: ProjectTypeConfig[]
  workflows: WorkflowConfig[]
  roles: RoleConfig[]
  auditEntries: AuditEntry[]
}

export interface WorkflowValidationResult {
  valid: boolean
  stateErrors: Record<string, string>
  transitionErrors: Record<string, string>
  summary: string[]
}

export const workflowLabels: Record<WorkflowKey, string> = {
  requirement: '需求',
  task: '任务',
  defect: '缺陷',
}

export const projectTypeLabels: Record<ProjectTypeKey, string> = {
  scrum: '敏捷项目',
  waterfall: '瀑布项目',
}

export const configurationSections: {
  key: ConfigurationSection
  label: string
  description: string
}[] = [
  {
    key: 'project-types',
    label: '项目类型配置',
    description: '配置不同项目类型在项目详情中启用的 Tab 和展示顺序。',
  },
  {
    key: 'workflows',
    label: '工作流配置',
    description: '维护需求、任务和缺陷在新建项目中使用的默认状态流转。',
  },
  {
    key: 'roles',
    label: '角色配置',
    description: '维护项目成员、工作流流转和通知规则可使用的统一角色字典。',
  },
]

export const normalizeConfigurationSection = (
  value: unknown,
): ConfigurationSection =>
  value === 'project-types' || value === 'workflows' || value === 'roles'
    ? value
    : 'project-types'

export const recipientRuleOptions = [
  { label: '负责人', value: 'assignee' },
  { label: '报告人', value: 'reporter' },
  { label: '关注人', value: 'watchers' },
  { label: '指定系统角色', value: 'roles' },
] as const

const createNotification = (enabled = false): TransitionNotificationConfig => ({
  enabled,
  recipientRules: ['assignee'],
  roleKeys: [],
  template: '{工作项编号} 从 {原状态} 流转到 {新状态}，操作人：{操作人}',
})

const createWebhook = (enabled = false): TransitionWebhookConfig => ({
  enabled,
  url: '',
  secretConfigured: false,
})

export const cloneConfigurationState = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T

export const getEnabledTabs = (config: ProjectTypeConfig) =>
  config.tabs.filter((tab) => tab.enabled)

export const getMoreMenuTabCount = (config: ProjectTypeConfig) =>
  Math.max(0, getEnabledTabs(config).length - 6)

export const validateProjectTypeConfig = (config: ProjectTypeConfig) => {
  const errors: Record<string, string> = {}
  const enabledTabs = getEnabledTabs(config)

  if (enabledTabs.length === 0) {
    config.tabs.forEach((tab) => {
      errors[tab.key] = '至少需要启用一个业务 Tab。'
    })
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateWorkflow = (
  workflow: WorkflowConfig,
): WorkflowValidationResult => {
  const stateErrors: Record<string, string> = {}
  const transitionErrors: Record<string, string> = {}
  const summary: string[] = []
  const stateIds = new Set(workflow.states.map((state) => state.id))
  const names = new Map<string, string[]>()

  workflow.states.forEach((state) => {
    const normalizedName = state.name.trim()

    if (!normalizedName) {
      stateErrors[state.id] = '状态名称不能为空。'
      return
    }

    names.set(normalizedName, [...(names.get(normalizedName) ?? []), state.id])
  })

  names.forEach((ids) => {
    if (ids.length <= 1) {
      return
    }

    ids.forEach((id) => {
      stateErrors[id] = '同一工作流内状态名称必须唯一。'
    })
  })

  const initialStates = workflow.states.filter((state) => state.initial)

  if (initialStates.length !== 1) {
    summary.push('必须有且只有一个起始状态。')
  }

  if (!workflow.states.some((state) => state.terminal)) {
    summary.push('至少需要一个终态。')
  }

  workflow.transitions.forEach((transition) => {
    const transitionIssues: string[] = []

    if (!stateIds.has(transition.fromStateId)) {
      transitionIssues.push('源状态不存在')
    }

    if (!stateIds.has(transition.toStateId)) {
      transitionIssues.push('目标状态不存在')
    }

    if (transition.fromStateId === transition.toStateId) {
      transitionIssues.push('源状态和目标状态不能相同')
    }

    if (transition.allowedRoleKeys.length === 0) {
      transitionIssues.push('至少选择一个允许角色')
    }

    if (transition.webhook.enabled && !transition.webhook.url.trim()) {
      transitionIssues.push('启用 Webhook 后必须填写 URL')
    }

    if (transitionIssues.length > 0) {
      transitionErrors[transition.id] = transitionIssues.join('；')
    }
  })

  workflow.states
    .filter((state) => !state.terminal)
    .forEach((state) => {
      const hasOutgoingTransition = workflow.transitions.some(
        (transition) => transition.fromStateId === state.id,
      )

      if (!hasOutgoingTransition) {
        stateErrors[state.id] =
          stateErrors[state.id] ?? '每个非终态至少需要一条可流出路径。'
      }
    })

  return {
    valid:
      Object.keys(stateErrors).length === 0 &&
      Object.keys(transitionErrors).length === 0 &&
      summary.length === 0,
    stateErrors,
    transitionErrors,
    summary,
  }
}

export const validateRoles = (roles: readonly RoleConfig[]) => {
  const errors: Record<string, string> = {}
  const roleKeys = new Map<string, string[]>()

  roles.forEach((role) => {
    if (!role.name.trim()) {
      errors[role.roleKey] = '角色名称不能为空。'
    }

    if (!role.roleKey.trim()) {
      errors[role.roleKey] = '角色标识不能为空。'
    }

    roleKeys.set(role.roleKey, [
      ...(roleKeys.get(role.roleKey) ?? []),
      role.roleKey,
    ])

    if (role.system && !role.enabled) {
      errors[role.roleKey] = '内置角色不可停用。'
    }
  })

  roleKeys.forEach((keys) => {
    if (keys.length <= 1) {
      return
    }

    keys.forEach((key) => {
      errors[key] = '角色标识必须唯一。'
    })
  })

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const getDefaultConfigurationState = (): ConfigurationState => ({
  projectTypes: [
    {
      typeKey: 'scrum',
      name: '敏捷项目（Scrum）',
      method: 'scrum',
      description: '适用于持续迭代、需求池、Sprint 计划和看板流转的项目。',
      updatedBy: '系统初始化',
      updatedAt: '2026-07-16 09:00',
      tabs: [
        { key: 'overview', label: '概览', enabled: true },
        { key: 'requirements', label: '需求', enabled: true },
        { key: 'tasks', label: '任务', enabled: true },
        { key: 'defects', label: '缺陷', enabled: true },
        { key: 'sprints', label: '迭代', enabled: true },
        { key: 'phases', label: '阶段', enabled: false },
        { key: 'versions', label: '版本', enabled: true },
        { key: 'tests', label: '测试', enabled: true },
        { key: 'members', label: '成员', enabled: true },
        { key: 'activity', label: '动态', enabled: true },
      ],
    },
    {
      typeKey: 'waterfall',
      name: '瀑布项目（Waterfall）',
      method: 'waterfall',
      description: '适用于阶段推进、里程碑验收和阶段质量风险提示的项目。',
      updatedBy: '系统初始化',
      updatedAt: '2026-07-16 09:00',
      tabs: [
        { key: 'overview', label: '概览', enabled: true },
        { key: 'requirements', label: '需求', enabled: true },
        { key: 'tasks', label: '任务', enabled: true },
        { key: 'defects', label: '缺陷', enabled: true },
        { key: 'sprints', label: '迭代', enabled: false },
        { key: 'phases', label: '阶段', enabled: true },
        { key: 'versions', label: '版本', enabled: true },
        { key: 'tests', label: '测试', enabled: true },
        { key: 'members', label: '成员', enabled: true },
        { key: 'activity', label: '动态', enabled: true },
      ],
    },
  ],
  workflows: [
    {
      key: 'requirement',
      name: '需求默认工作流',
      description: '用于 Story、Feature 等需求类工作项的新项目默认流程。',
      updatedBy: '系统初始化',
      updatedAt: '2026-07-16 09:00',
      states: [
        {
          id: 'req-draft',
          name: '草稿',
          color: '#909399',
          initial: true,
          terminal: false,
        },
        {
          id: 'req-reviewing',
          name: '待评审',
          color: '#e6a23c',
          initial: false,
          terminal: false,
        },
        {
          id: 'req-confirmed',
          name: '已确认',
          color: '#409eff',
          initial: false,
          terminal: false,
        },
        {
          id: 'req-accepted',
          name: '已验收',
          color: '#67c23a',
          initial: false,
          terminal: true,
        },
      ],
      transitions: [
        {
          id: 'req-submit',
          fromStateId: 'req-draft',
          toStateId: 'req-reviewing',
          allowedRoleKeys: ['product_manager', 'project_owner'],
          requireComment: false,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
        {
          id: 'req-confirm',
          fromStateId: 'req-reviewing',
          toStateId: 'req-confirmed',
          allowedRoleKeys: ['product_manager', 'project_owner'],
          requireComment: true,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
        {
          id: 'req-accept',
          fromStateId: 'req-confirmed',
          toStateId: 'req-accepted',
          allowedRoleKeys: ['product_manager', 'project_owner'],
          requireComment: true,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
      ],
    },
    {
      key: 'task',
      name: '任务默认工作流',
      description: '用于 Task 的新项目默认流程。',
      updatedBy: '系统初始化',
      updatedAt: '2026-07-16 09:00',
      states: [
        {
          id: 'task-open',
          name: '待处理',
          color: '#909399',
          initial: true,
          terminal: false,
        },
        {
          id: 'task-dev',
          name: '开发中',
          color: '#409eff',
          initial: false,
          terminal: false,
        },
        {
          id: 'task-review',
          name: '代码评审中',
          color: '#e6a23c',
          initial: false,
          terminal: false,
        },
        {
          id: 'task-done',
          name: '已完成',
          color: '#67c23a',
          initial: false,
          terminal: true,
        },
      ],
      transitions: [
        {
          id: 'task-start',
          fromStateId: 'task-open',
          toStateId: 'task-dev',
          allowedRoleKeys: ['developer', 'project_owner'],
          requireComment: false,
          notification: createNotification(),
          webhook: createWebhook(),
        },
        {
          id: 'task-review',
          fromStateId: 'task-dev',
          toStateId: 'task-review',
          allowedRoleKeys: ['developer', 'project_owner'],
          requireComment: false,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
        {
          id: 'task-complete',
          fromStateId: 'task-review',
          toStateId: 'task-done',
          allowedRoleKeys: ['developer', 'project_owner'],
          requireComment: true,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
      ],
    },
    {
      key: 'defect',
      name: '缺陷默认工作流',
      description: '用于 Bug 的新项目默认流程和回归闭环。',
      updatedBy: '系统初始化',
      updatedAt: '2026-07-16 09:00',
      states: [
        {
          id: 'bug-new',
          name: '新提交',
          color: '#f56c6c',
          initial: true,
          terminal: false,
        },
        {
          id: 'bug-fixing',
          name: '处理中',
          color: '#409eff',
          initial: false,
          terminal: false,
        },
        {
          id: 'bug-regression',
          name: '待回归',
          color: '#e6a23c',
          initial: false,
          terminal: false,
        },
        {
          id: 'bug-closed',
          name: '已关闭',
          color: '#67c23a',
          initial: false,
          terminal: true,
        },
        {
          id: 'bug-rejected',
          name: '已拒绝',
          color: '#909399',
          initial: false,
          terminal: true,
        },
      ],
      transitions: [
        {
          id: 'bug-assign',
          fromStateId: 'bug-new',
          toStateId: 'bug-fixing',
          allowedRoleKeys: ['developer', 'project_owner'],
          requireComment: false,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
        {
          id: 'bug-fixed',
          fromStateId: 'bug-fixing',
          toStateId: 'bug-regression',
          allowedRoleKeys: ['developer', 'project_owner'],
          requireComment: true,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
        {
          id: 'bug-close',
          fromStateId: 'bug-regression',
          toStateId: 'bug-closed',
          allowedRoleKeys: ['tester', 'project_owner'],
          requireComment: true,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
        {
          id: 'bug-reject',
          fromStateId: 'bug-new',
          toStateId: 'bug-rejected',
          allowedRoleKeys: ['tester', 'project_owner'],
          requireComment: true,
          notification: createNotification(true),
          webhook: createWebhook(),
        },
      ],
    },
  ],
  roles: [
    {
      roleKey: 'system_admin',
      name: '系统管理员',
      description: '负责系统配置、身份恢复、全局权限和集成管理。',
      scope: 'global',
      enabled: true,
      system: true,
      used: true,
      updatedAt: '2026-07-16 09:00',
    },
    {
      roleKey: 'project_owner',
      name: '项目负责人',
      description: '负责项目配置、成员、计划、质量风险处理和发布。',
      scope: 'project',
      enabled: true,
      system: true,
      used: true,
      updatedAt: '2026-07-16 09:00',
    },
    {
      roleKey: 'product_manager',
      name: '产品经理',
      description: '负责 Epic、Feature、Story、评审和验收。',
      scope: 'project',
      enabled: true,
      system: true,
      used: true,
      updatedAt: '2026-07-16 09:00',
    },
    {
      roleKey: 'developer',
      name: '开发人员',
      description: '负责任务开发、缺陷修复和研发活动查看。',
      scope: 'project',
      enabled: true,
      system: true,
      used: true,
      updatedAt: '2026-07-16 09:00',
    },
    {
      roleKey: 'tester',
      name: '测试人员',
      description: '负责测试用例、计划、执行、缺陷和回归。',
      scope: 'project',
      enabled: true,
      system: true,
      used: true,
      updatedAt: '2026-07-16 09:00',
    },
    {
      roleKey: 'viewer',
      name: '只读成员',
      description: '只读查看所属项目内容。',
      scope: 'project',
      enabled: true,
      system: true,
      used: true,
      updatedAt: '2026-07-16 09:00',
    },
  ],
  auditEntries: [
    {
      id: 'audit-init',
      actor: '系统初始化',
      target: '配置中心',
      summary: '初始化项目类型配置、默认工作流和内置角色字典。',
      createdAt: '2026-07-16 09:00',
    },
  ],
})
