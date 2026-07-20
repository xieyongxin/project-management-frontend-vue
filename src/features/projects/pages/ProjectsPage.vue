<template>
  <section class="projects-page" aria-label="项目管理">
    <PageHeader title="项目管理" breadcrumb="项目管理 / 项目列表">
      <template #actions>
        <AppButton type="primary" @click="createDialogVisible = true">
          <ElIcon><Plus /></ElIcon>
          新建项目
        </AppButton>
        <ElSegmented
          :model-value="query.view"
          :options="viewOptions"
          @update:model-value="handleViewChange"
        />
      </template>
    </PageHeader>

    <ProjectStatsSection :cards="statsCards" @apply="applyStatsFilter" />

    <ProjectFilters
      :query="query"
      :project-types="projectCreateTemplate.project_types"
      @keyword-change="handleKeywordChange"
      @method-change="handleMethodChange"
      @status-change="handleStatusChange"
      @risk-status-change="handleRiskStatusChange"
    />

    <ProjectTableView
      v-if="query.view === 'table'"
      :projects="projects"
      :loading="projectsQuery.isLoading.value"
      :total="total"
      :page="query.page"
      :page-size="query.pageSize"
      @open="openProject"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />

    <ProjectCardView v-else :projects="projects" @open="openProject" />

    <CreateProjectDialog
      v-model="createDialogVisible"
      :template="projectCreateTemplate"
      :template-loading="projectCreateTemplateQuery.isLoading.value"
      :submitting="createProjectMutation.isPending.value"
      @submit="handleCreateProject"
    />
  </section>
</template>

<script setup lang="ts">
import {
  Box,
  CircleCheck,
  DataAnalysis,
  FolderChecked,
  Plus,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppButton, PageHeader } from '@/shared/components'
import CreateProjectDialog from '../components/CreateProjectDialog.vue'
import ProjectCardView from '../components/ProjectCardView.vue'
import ProjectFilters from '../components/ProjectFilters.vue'
import ProjectStatsSection from '../components/ProjectStatsSection.vue'
import ProjectTableView from '../components/ProjectTableView.vue'
import {
  useCreateProject,
  useProjectCreateTemplate,
  useProjects,
  useProjectStats,
} from '../api/project.queries'
import {
  parseProjectListQuery,
  serializeProjectListQuery,
  type ProjectListQuery,
} from '../model/project-list-query'
import type {
  ProjectCreatePayload,
  ProjectSummary,
} from '../model/project.types'

const route = useRoute()
const router = useRouter()
const createDialogVisible = ref(false)
const query = computed(() => parseProjectListQuery(route.query))
const projectsQuery = useProjects(query)
const statsQuery = useProjectStats(query)
const projectCreateTemplateQuery = useProjectCreateTemplate()
const createProjectMutation = useCreateProject()

const viewOptions = [
  { label: '表格', value: 'table' },
  { label: '卡片', value: 'card' },
]

const projects = computed(() => projectsQuery.data.value?.data ?? [])
const total = computed(() => projectsQuery.data.value?.pagination.total ?? 0)
const stats = computed(() => statsQuery.data.value)
const projectCreateTemplate = computed(
  () =>
    projectCreateTemplateQuery.data.value ?? {
      project_types: [],
      owners: [],
    },
)
const statsCards = computed(() => [
  {
    key: 'all',
    label: '全部项目',
    value: stats.value?.total_count ?? '--',
    description: '点击查看全部',
    tone: 'primary' as const,
    icon: DataAnalysis,
    status: undefined,
    riskStatus: undefined,
    active: !query.value.status && !query.value.riskStatus,
  },
  {
    key: 'active',
    label: '进行中',
    value: stats.value?.active_count ?? '--',
    description: '当前活跃项目',
    tone: 'success' as const,
    icon: CircleCheck,
    status: 'active' as const,
    riskStatus: undefined,
    active: query.value.status === 'active',
  },
  {
    key: 'paused',
    label: '暂停',
    value: stats.value?.paused_count ?? '--',
    description: '需要关注恢复',
    tone: 'warning' as const,
    icon: Box,
    status: 'paused' as const,
    riskStatus: undefined,
    active: query.value.status === 'paused',
  },
  {
    key: 'archived',
    label: '已归档',
    value: stats.value?.archived_count ?? '--',
    description: '只读沉淀项目',
    tone: 'purple' as const,
    icon: FolderChecked,
    status: 'archived' as const,
    riskStatus: undefined,
    active: query.value.status === 'archived',
  },
  {
    key: 'risk',
    label: '风险项目',
    value: stats.value?.risk_count ?? '--',
    description: '阻塞或质量风险',
    tone: 'danger' as const,
    icon: Warning,
    status: undefined,
    riskStatus: 'risk' as const,
    active: query.value.riskStatus === 'risk',
  },
])

const normalizeEmpty = (value: unknown) =>
  typeof value === 'string' && value ? value : undefined

const updateQuery = (patch: Partial<ProjectListQuery>) => {
  const next = { ...query.value, ...patch }
  void router.replace({
    path: '/projects',
    query: serializeProjectListQuery(next),
  })
}

const handleViewChange = (value: unknown) => {
  updateQuery({
    view: value === 'card' ? 'card' : 'table',
    page: 1,
  })
}

const handleKeywordChange = (value: string) => {
  updateQuery({ keyword: value, page: 1 })
}

const handleMethodChange = (value: unknown) => {
  updateQuery({
    method: normalizeEmpty(value) as ProjectListQuery['method'],
    page: 1,
  })
}

const handleStatusChange = (value: unknown) => {
  updateQuery({
    status: normalizeEmpty(value) as ProjectListQuery['status'],
    page: 1,
  })
}

const handleRiskStatusChange = (value: unknown) => {
  updateQuery({
    riskStatus: normalizeEmpty(value) as ProjectListQuery['riskStatus'],
    page: 1,
  })
}

const applyStatsFilter = (
  status: ProjectListQuery['status'],
  riskStatus: ProjectListQuery['riskStatus'],
) => {
  updateQuery({ status, riskStatus, page: 1 })
}

const handlePageChange = (page: number) => {
  updateQuery({ page })
}

const handlePageSizeChange = (pageSize: number) => {
  updateQuery({ pageSize, page: 1 })
}

const openProject = (project: ProjectSummary) => {
  void router.push(`/projects/${project.id}/overview`)
}

const handleCreateProject = (payload: ProjectCreatePayload) => {
  createProjectMutation.mutate(payload, {
    onSuccess: (project) => {
      createDialogVisible.value = false
      ElMessage.success('项目已创建，已复制当前项目类型配置和默认工作流。')
      void router.push(`/projects/${project.id}/overview`)
    },
  })
}

onMounted(() => {
  document.title = '项目管理 · 项目协作工作台'
})
</script>

<style scoped>
.projects-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
