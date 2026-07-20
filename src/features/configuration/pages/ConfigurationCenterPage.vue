<template>
  <main class="configuration-page">
    <ProjectTypeConfiguration
      v-if="currentSection === 'project-types'"
      :project-types="projectTypes"
      :active-type-key="activeTypeKey"
      :active-project-type="activeProjectType"
      :loading="projectTypesQuery.isLoading.value"
      :saving="saveProjectTypeMutation.isPending.value"
      @open="openProjectType"
      @back="goProjectTypeList"
      @save="saveProjectType"
    />

    <WorkflowConfiguration
      v-else-if="currentSection === 'workflows'"
      v-model:active-workflow-key="activeWorkflowKey"
      :active-workflow="activeWorkflow"
      :roles="roles"
      :saving="saveWorkflowMutation.isPending.value"
      @set-initial="setInitialState"
      @restore="restoreWorkflow"
      @save="saveWorkflow"
    />

    <RoleConfiguration
      v-else
      :roles="roles"
      :loading="rolesQuery.isLoading.value"
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
  activeWorkflow.value?.states.forEach((state) => {
    state.initial = state.state_key === stateKey
  })
}

const saveWorkflow = async () => {
  if (!activeWorkflow.value) {
    return
  }

  await confirmSave()
  await saveWorkflowMutation.mutateAsync(activeWorkflow.value)
  ElMessage.success('工作流配置已保存。')
}

const restoreWorkflow = async () => {
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
