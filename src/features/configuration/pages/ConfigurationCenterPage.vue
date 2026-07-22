<template>
  <main class="configuration-page">
    <ProjectTypeConfiguration
      v-if="currentSection === 'project-types'"
      :project-types="projectTypes"
      :active-type-key="activeTypeKey"
      :active-project-type="activeProjectType"
      :loading="projectTypesQuery.isLoading.value"
      :saving="saveProjectTypeMutation.isPending.value"
      :can-write="canWriteConfiguration"
      @open="openProjectType"
      @back="goProjectTypeList"
      @reorder-tabs="reorderProjectTypeTabs"
      @save="saveProjectType"
    />

    <WorkflowConfiguration
      v-else-if="currentSection === 'workflows'"
      v-model:active-workflow-key="activeWorkflowKey"
      :active-workflow="activeWorkflow"
      :roles="roles"
      :saving="saveWorkflowMutation.isPending.value"
      :can-write="canWriteConfiguration"
      @set-initial="setInitialState"
      @add-state="addWorkflowState"
      @delete-state="deleteWorkflowState"
      @add-transition="addWorkflowTransition"
      @delete-transition="deleteWorkflowTransition"
      @restore="restoreWorkflow"
      @save="saveWorkflow"
    />

    <RoleConfiguration
      v-else
      :roles="roles"
      :loading="rolesQuery.isLoading.value"
      :can-write="canWriteConfiguration"
      @save-role="saveRole"
    />
  </main>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectTypeConfiguration from '../components/ProjectTypeConfiguration.vue'
import RoleConfiguration from '../components/RoleConfiguration.vue'
import WorkflowConfiguration from '../components/WorkflowConfiguration.vue'
import {
  useConfigurationCurrentUser,
  useProjectTypeConfigs,
  useRestoreWorkflowDefinition,
  useRoleDefinitions,
  useSaveProjectTypeConfig,
  useSaveRoleDefinition,
  useSaveWorkflowDefinition,
  useWorkflowDefinitions,
} from '../api/configuration.queries'
import {
  configurationSections,
  normalizeConfigurationSection,
} from '../model/configuration-center'
import type {
  ProjectTypeConfig,
  RoleConfig,
  WorkflowConfig,
} from '../model/configuration.types'

const route = useRoute()
const router = useRouter()
const currentUserQuery = useConfigurationCurrentUser()
const projectTypesQuery = useProjectTypeConfigs()
const workflowsQuery = useWorkflowDefinitions()
const rolesQuery = useRoleDefinitions()
const saveProjectTypeMutation = useSaveProjectTypeConfig()
const saveWorkflowMutation = useSaveWorkflowDefinition()
const restoreWorkflowMutation = useRestoreWorkflowDefinition()
const saveRoleMutation = useSaveRoleDefinition()
const activeWorkflowKey = ref('requirement')
const projectTypeDrafts = ref<ProjectTypeConfig[]>([])
const workflowDrafts = ref<WorkflowConfig[]>([])

const currentSection = computed(() =>
  normalizeConfigurationSection(route.params.section),
)
const activeTypeKey = computed(() =>
  typeof route.params.typeKey === 'string' ? route.params.typeKey : undefined,
)
const projectTypes = computed(() => projectTypeDrafts.value)
const workflows = computed(() => workflowDrafts.value)
const roles = computed(() => rolesQuery.data.value ?? [])
const activeProjectType = computed(() =>
  projectTypes.value.find((item) => item.type_key === activeTypeKey.value),
)
const activeWorkflow = computed(() =>
  workflows.value.find((item) => item.workflow_key === activeWorkflowKey.value),
)
const canWriteConfiguration = computed(
  () =>
    currentUserQuery.data.value?.permissions.includes('configuration:write') ??
    false,
)

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

watch(
  () => projectTypesQuery.data.value,
  (value) => {
    projectTypeDrafts.value = clone(value ?? [])
  },
  { immediate: true },
)

watch(
  () => workflowsQuery.data.value,
  (value) => {
    workflowDrafts.value = clone(value ?? [])
  },
  { immediate: true },
)

watch(
  currentSection,
  (section) => {
    const title =
      configurationSections.find((item) => item.key === section)?.label ??
      '配置中心'
    document.title = `${title} · 项目协作工作台`
  },
  { immediate: true },
)

const openProjectType = (row: ProjectTypeConfig) => {
  void router.push(`/configuration/project-types/${row.type_key}`)
}

const goProjectTypeList = () => {
  void router.push('/configuration/project-types')
}

const reorderProjectTypeTabs = (oldIndex: number, newIndex: number) => {
  if (!canWriteConfiguration.value) {
    return
  }

  if (!activeProjectType.value) {
    return
  }

  const [moved] = activeProjectType.value.tabs.splice(oldIndex, 1)

  if (!moved) {
    return
  }

  activeProjectType.value.tabs.splice(newIndex, 0, moved)
  activeProjectType.value.tabs.forEach((tab, index) => {
    tab.sort_order = index + 1
  })
}

const confirmSave = async () => {
  await ElMessageBox.confirm(
    '保存后只影响后续新建项目，不影响已有项目。是否继续保存？',
    '确认保存配置',
    {
      type: 'warning',
      confirmButtonText: '确认保存',
      cancelButtonText: '取消',
    },
  )
}

const saveProjectType = async () => {
  if (!canWriteConfiguration.value) {
    ElMessage.error('当前账号没有配置写入权限。')
    return
  }

  if (!activeProjectType.value) {
    return
  }

  if (!activeProjectType.value.tabs.some((tab) => tab.enabled)) {
    ElMessage.error('至少需要保留一个可用业务 Tab。')
    return
  }

  await confirmSave()
  await saveProjectTypeMutation.mutateAsync(activeProjectType.value)
  ElMessage.success('项目类型配置已保存。')
}

const setInitialState = (stateKey: string) => {
  if (!canWriteConfiguration.value) {
    return
  }

  activeWorkflow.value?.states.forEach((state) => {
    state.initial = state.state_key === stateKey
  })
}

const normalizeKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const uniqueKey = (prefix: string, existingKeys: string[]) => {
  let index = existingKeys.length + 1
  let key = `${prefix}_${index}`

  while (existingKeys.includes(key)) {
    index += 1
    key = `${prefix}_${index}`
  }

  return key
}

const addWorkflowState = () => {
  if (!canWriteConfiguration.value) {
    return
  }

  if (!activeWorkflow.value) {
    return
  }

  const stateKey = uniqueKey(
    'state',
    activeWorkflow.value.states.map((state) => state.state_key),
  )
  activeWorkflow.value.states.push({
    state_key: stateKey,
    name: `新状态 ${activeWorkflow.value.states.length + 1}`,
    color: '#409eff',
    initial: activeWorkflow.value.states.length === 0,
    terminal: false,
    sort_order: activeWorkflow.value.states.length + 1,
  })
}

const deleteWorkflowState = (stateKey: string) => {
  if (!canWriteConfiguration.value) {
    return
  }

  if (!activeWorkflow.value) {
    return
  }

  const nextStates = activeWorkflow.value.states.filter(
    (state) => state.state_key !== stateKey,
  )
  activeWorkflow.value.states.splice(
    0,
    activeWorkflow.value.states.length,
    ...nextStates.map((state, index) => ({ ...state, sort_order: index + 1 })),
  )

  if (
    activeWorkflow.value.states.length > 0 &&
    !activeWorkflow.value.states.some((state) => state.initial)
  ) {
    const firstState = activeWorkflow.value.states[0]

    if (firstState) {
      firstState.initial = true
    }
  }

  const nextTransitions = activeWorkflow.value.transitions.filter(
    (transition) =>
      transition.from_state_key !== stateKey &&
      transition.to_state_key !== stateKey,
  )
  activeWorkflow.value.transitions.splice(
    0,
    activeWorkflow.value.transitions.length,
    ...nextTransitions.map((transition, index) => ({
      ...transition,
      sort_order: index + 1,
    })),
  )
  ElMessage.warning('状态已删除，引用该状态的流转已同步删除。')
}

const addWorkflowTransition = () => {
  if (!canWriteConfiguration.value) {
    return
  }

  if (!activeWorkflow.value || activeWorkflow.value.states.length < 2) {
    ElMessage.error('至少需要两个状态才能新增流转。')
    return
  }

  const fromState = activeWorkflow.value.states[0]
  const toState = activeWorkflow.value.states[1]

  if (!fromState || !toState) {
    return
  }

  const transitionKey = uniqueKey(
    normalizeKey(`${fromState.name}_to_${toState.name}`) || 'transition',
    activeWorkflow.value.transitions.map(
      (transition) => transition.transition_key,
    ),
  )

  activeWorkflow.value.transitions.push({
    transition_key: transitionKey,
    name: `${fromState.name} → ${toState.name}`,
    from_state_key: fromState.state_key,
    to_state_key: toState.state_key,
    allowed_role_keys: [],
    require_comment: false,
    notify_enabled: false,
    notify_rule: '',
    notify_template: '',
    webhook_enabled: false,
    webhook_url: '',
    webhook_secret_set: false,
    sort_order: activeWorkflow.value.transitions.length + 1,
  })
}

const deleteWorkflowTransition = (index: number) => {
  if (!canWriteConfiguration.value) {
    return
  }

  activeWorkflow.value?.transitions.splice(index, 1)
  activeWorkflow.value?.transitions.forEach((transition, nextIndex) => {
    transition.sort_order = nextIndex + 1
  })
}

const validateWorkflow = (workflow: WorkflowConfig) => {
  if (workflow.states.length === 0) {
    return '工作流至少需要一个状态。'
  }

  if (workflow.states.filter((state) => state.initial).length !== 1) {
    return '工作流必须有且只有一个起始状态。'
  }

  if (!workflow.states.some((state) => state.terminal)) {
    return '工作流至少需要一个终态。'
  }

  const stateKeys = new Set(workflow.states.map((state) => state.state_key))
  const outgoing = new Map<string, number>()

  for (const transition of workflow.transitions) {
    if (!transition.name.trim()) {
      return '每条流转都必须填写名称。'
    }

    if (transition.from_state_key === transition.to_state_key) {
      return '工作流不允许自环流转。'
    }

    if (
      !stateKeys.has(transition.from_state_key) ||
      !stateKeys.has(transition.to_state_key)
    ) {
      return '流转引用了不存在的状态。'
    }

    if (transition.notify_enabled && !transition.notify_template.trim()) {
      return '启用通知后必须填写通知文案模板。'
    }

    if (transition.webhook_enabled && !transition.webhook_url.trim()) {
      return '启用 Webhook 后必须填写 Webhook URL。'
    }

    outgoing.set(
      transition.from_state_key,
      (outgoing.get(transition.from_state_key) ?? 0) + 1,
    )
  }

  const blockedState = workflow.states.find(
    (state) => !state.terminal && !outgoing.has(state.state_key),
  )

  return blockedState
    ? `非终态“${blockedState.name}”至少需要一条流出路径。`
    : undefined
}

const saveWorkflow = async () => {
  if (!canWriteConfiguration.value) {
    ElMessage.error('当前账号没有配置写入权限。')
    return
  }

  if (!activeWorkflow.value) {
    return
  }

  const validationMessage = validateWorkflow(activeWorkflow.value)

  if (validationMessage) {
    ElMessage.error(validationMessage)
    return
  }

  await confirmSave()
  await saveWorkflowMutation.mutateAsync(activeWorkflow.value)
  ElMessage.success('工作流配置已保存。')
}

const restoreWorkflow = async () => {
  if (!canWriteConfiguration.value) {
    ElMessage.error('当前账号没有配置写入权限。')
    return
  }

  if (!activeWorkflow.value) {
    return
  }

  await ElMessageBox.confirm(
    '确认恢复当前默认工作流？恢复后仍需保存。',
    '恢复默认工作流',
    {
      type: 'warning',
      confirmButtonText: '恢复默认',
      cancelButtonText: '取消',
    },
  )
  const restored = await restoreWorkflowMutation.mutateAsync(
    activeWorkflow.value,
  )
  const index = workflowDrafts.value.findIndex(
    (item) => item.id === restored.id,
  )
  if (index !== -1) {
    workflowDrafts.value[index] = clone(restored)
  }
  ElMessage.success('已恢复默认工作流。')
}

const saveRole = (role: RoleConfig) => {
  if (!canWriteConfiguration.value) {
    ElMessage.error('当前账号没有配置写入权限。')
    return
  }

  saveRoleMutation.mutate(role, {
    onSuccess: () => ElMessage.success('角色配置已保存。'),
  })
}
</script>

<style scoped>
.configuration-page {
  min-width: 0;
}
</style>
