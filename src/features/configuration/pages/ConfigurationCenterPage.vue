<template>
  <div class="configuration-page">
    <aside class="configuration-sidebar">
      <h1>配置中心</h1>
      <ElMenu
        class="configuration-menu"
        :default-active="currentSection"
        @select="handleSectionSelect"
      >
        <ElMenuItem
          v-for="item in configurationSections"
          :key="item.key"
          :index="item.key"
        >
          {{ item.label }}
        </ElMenuItem>
      </ElMenu>
    </aside>

    <main class="configuration-content">
      <section v-if="currentSection === 'project-types'">
        <PageHeader
          title="项目类型配置"
          description="配置不同项目类型在项目详情中启用的 Tab 和展示顺序。"
        />

        <DataTableShell v-if="!activeTypeKey">
          <ElTable
            v-loading="projectTypesQuery.isLoading.value"
            :data="projectTypes"
          >
            <ElTableColumn prop="name" label="项目类型" />
            <ElTableColumn label="说明" min-width="260">
              <template #default="{ row }: { row: ProjectTypeConfig }">
                {{
                  row.method === 'scrum'
                    ? '面向迭代交付的项目类型'
                    : '面向阶段交付的项目类型'
                }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="启用 Tab 数" width="130">
              <template #default="{ row }: { row: ProjectTypeConfig }">
                {{ row.tabs.filter((tab) => tab.enabled).length }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="更多菜单 Tab 数" width="150">
              <template #default="{ row }: { row: ProjectTypeConfig }">
                {{
                  Math.max(0, row.tabs.filter((tab) => tab.enabled).length - 6)
                }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="updated_by" label="最后修改人" width="130" />
            <ElTableColumn prop="updated_at" label="最后修改时间" width="170" />
            <ElTableColumn label="操作" width="120">
              <template #default="{ row }: { row: ProjectTypeConfig }">
                <ElButton type="primary" link @click="openProjectType(row)">
                  配置
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </DataTableShell>

        <section v-else-if="activeProjectType" class="configuration-panel">
          <div class="configuration-panel__header">
            <ElButton plain @click="goProjectTypeList">返回</ElButton>
            <div>
              <h2>{{ activeProjectType.name }}配置</h2>
              <p>启用的前 6 个 Tab 展示在顶部，超过 6 个自动进入“更多”菜单。</p>
            </div>
            <ElButton
              type="primary"
              :loading="saveProjectTypeMutation.isPending.value"
              @click="saveProjectType"
            >
              保存
            </ElButton>
          </div>
          <ElAlert
            class="mb-[var(--space-2)]"
            type="info"
            show-icon
            :closable="false"
            title="保存后只影响后续新建项目，不影响已有项目。"
          />
          <ElTable :data="activeProjectType.tabs">
            <ElTableColumn label="拖拽" width="80">
              <template #default>
                <span class="drag-handle">⋮⋮</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="name" label="Tab 名称" />
            <ElTableColumn label="是否启用" width="120">
              <template
                #default="{ row }: { row: ProjectTypeConfig['tabs'][number] }"
              >
                <ElSwitch v-model="row.enabled" />
              </template>
            </ElTableColumn>
          </ElTable>
        </section>
      </section>

      <section
        v-else-if="currentSection === 'workflows'"
        class="configuration-workflow"
      >
        <PageHeader
          title="工作流配置"
          description="配置需求、任务和缺陷默认工作流；保存后只影响后续新建项目。"
        >
          <template #actions>
            <ElButton :disabled="!activeWorkflow" @click="restoreWorkflow">
              恢复默认工作流
            </ElButton>
            <ElButton
              type="primary"
              :disabled="!activeWorkflow"
              :loading="saveWorkflowMutation.isPending.value"
              @click="saveWorkflow"
            >
              保存
            </ElButton>
          </template>
        </PageHeader>
        <ElTabs v-model="activeWorkflowKey">
          <ElTabPane label="需求" name="requirement" />
          <ElTabPane label="任务" name="task" />
          <ElTabPane label="缺陷" name="defect" />
        </ElTabs>
        <div v-if="activeWorkflow" class="workflow-grid">
          <section class="configuration-panel">
            <h2>状态列表</h2>
            <ElTable :data="activeWorkflow.states">
              <ElTableColumn prop="name" label="状态名称">
                <template
                  #default="{ row }: { row: WorkflowConfig['states'][number] }"
                >
                  <ElInput v-model="row.name" />
                </template>
              </ElTableColumn>
              <ElTableColumn label="颜色" width="100">
                <template
                  #default="{ row }: { row: WorkflowConfig['states'][number] }"
                >
                  <ElColorPicker v-model="row.color" />
                </template>
              </ElTableColumn>
              <ElTableColumn label="起始" width="90">
                <template
                  #default="{ row }: { row: WorkflowConfig['states'][number] }"
                >
                  <ElRadio
                    :model-value="row.initial"
                    :value="true"
                    @change="setInitialState(row.state_key)"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="终态" width="90">
                <template
                  #default="{ row }: { row: WorkflowConfig['states'][number] }"
                >
                  <ElSwitch v-model="row.terminal" />
                </template>
              </ElTableColumn>
            </ElTable>

            <h2 class="mt-[var(--space-3)]">流转列表</h2>
            <ElTable :data="activeWorkflow.transitions">
              <ElTableColumn label="源状态">
                <template
                  #default="{
                    row,
                  }: {
                    row: WorkflowConfig['transitions'][number]
                  }"
                >
                  <ElSelect v-model="row.from_state_key">
                    <ElOption
                      v-for="state in activeWorkflow.states"
                      :key="state.state_key"
                      :label="state.name"
                      :value="state.state_key"
                    />
                  </ElSelect>
                </template>
              </ElTableColumn>
              <ElTableColumn label="目标状态">
                <template
                  #default="{
                    row,
                  }: {
                    row: WorkflowConfig['transitions'][number]
                  }"
                >
                  <ElSelect v-model="row.to_state_key">
                    <ElOption
                      v-for="state in activeWorkflow.states"
                      :key="state.state_key"
                      :label="state.name"
                      :value="state.state_key"
                    />
                  </ElSelect>
                </template>
              </ElTableColumn>
              <ElTableColumn label="允许角色">
                <template
                  #default="{
                    row,
                  }: {
                    row: WorkflowConfig['transitions'][number]
                  }"
                >
                  <ElSelect
                    v-model="row.allowed_role_keys"
                    multiple
                    collapse-tags
                  >
                    <ElOption
                      v-for="role in roles"
                      :key="role.role_key"
                      :label="role.name"
                      :value="role.role_key"
                    />
                  </ElSelect>
                </template>
              </ElTableColumn>
              <ElTableColumn label="需评论" width="90">
                <template
                  #default="{
                    row,
                  }: {
                    row: WorkflowConfig['transitions'][number]
                  }"
                >
                  <ElSwitch v-model="row.require_comment" />
                </template>
              </ElTableColumn>
            </ElTable>
          </section>

          <aside class="configuration-panel workflow-preview">
            <h2>流程预览（只读）</h2>
            <ol>
              <li v-for="state in activeWorkflow.states" :key="state.state_key">
                <span :style="{ borderColor: state.color }">{{
                  state.name
                }}</span>
              </li>
            </ol>
          </aside>
        </div>
      </section>

      <section v-else class="configuration-panel">
        <PageHeader
          title="角色配置"
          description="维护项目成员、工作流和通知可使用的角色。"
        />
        <ElTable v-loading="rolesQuery.isLoading.value" :data="roles">
          <ElTableColumn prop="name" label="角色名称" />
          <ElTableColumn prop="role_key" label="角色标识" />
          <ElTableColumn label="适用范围" width="120">
            <template #default="{ row }: { row: RoleConfig }">
              {{ row.scope === 'global' ? '全局' : '项目内' }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="启用状态" width="120">
            <template #default="{ row }: { row: RoleConfig }">
              <ElSwitch
                v-model="row.enabled"
                :disabled="row.is_system"
                @change="() => saveRole(row)"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="是否内置" width="120">
            <template #default="{ row }: { row: RoleConfig }">
              <StatusTag
                :label="row.is_system ? '是' : '否'"
                :tone="row.is_system ? 'primary' : 'neutral'"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="updated_at" label="最后修改时间" />
        </ElTable>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataTableShell, PageHeader, StatusTag } from '@/shared/components'
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
  type ConfigurationSection,
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

const isConfigurationSection = (
  value: unknown,
): value is ConfigurationSection =>
  value === 'project-types' || value === 'workflows' || value === 'roles'

const currentSection = computed<ConfigurationSection>(() =>
  isConfigurationSection(route.params.section)
    ? route.params.section
    : 'project-types',
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

const handleSectionSelect = (key: string) => {
  if (isConfigurationSection(key)) {
    void router.push(`/configuration/${key}`)
  }
}

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
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  gap: var(--space-3);
  min-height: calc(100dvh - 112px);
}

.configuration-sidebar,
.configuration-panel {
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.configuration-sidebar {
  padding: var(--space-2);
}

.configuration-sidebar h1 {
  margin: var(--space-1) var(--space-1) var(--space-2);
  font-size: var(--font-size-title-sm);
}

.configuration-menu {
  border-right: 0;
}

.configuration-content {
  min-width: 0;
}

.configuration-content > section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.configuration-panel {
  padding: var(--space-3);
}

.configuration-panel__header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-2);
  align-items: start;
  margin-bottom: var(--space-2);
}

.configuration-panel h2,
.configuration-panel p {
  margin: 0;
}

.configuration-panel p {
  color: var(--color-text-secondary);
}

.drag-handle {
  color: var(--color-text-muted);
  cursor: grab;
}

.workflow-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: var(--space-2);
}

.workflow-preview ol {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-2) 0 0;
  padding: 0;
  list-style: none;
}

.workflow-preview span {
  display: block;
  padding: var(--space-1) var(--space-2);
  text-align: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
}
</style>
