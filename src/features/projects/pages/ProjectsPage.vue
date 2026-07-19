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

    <div class="project-stats-grid">
      <SummaryCard
        v-for="card in statsCards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :description="card.description"
        :tone="card.tone"
        :active="card.active"
        @click="applyStatsFilter(card.status, card.riskStatus)"
      >
        <template #icon>
          <ElIcon><component :is="card.icon" /></ElIcon>
        </template>
      </SummaryCard>
    </div>

    <FilterBar>
      <AppInput
        :model-value="query.keyword"
        class="project-filter__keyword"
        clearable
        placeholder="搜索项目名称、项目标识"
        @update:model-value="handleKeywordChange"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </AppInput>
      <ElSelect
        :model-value="query.method"
        clearable
        placeholder="项目类型"
        @update:model-value="handleMethodChange"
      >
        <ElOption label="Scrum" value="scrum" />
        <ElOption label="Waterfall" value="waterfall" />
      </ElSelect>
      <ElSelect
        :model-value="query.status"
        clearable
        placeholder="项目状态"
        @update:model-value="handleStatusChange"
      >
        <ElOption label="进行中" value="active" />
        <ElOption label="暂停" value="paused" />
        <ElOption label="已归档" value="archived" />
      </ElSelect>
      <ElSelect
        :model-value="query.riskStatus"
        clearable
        placeholder="风险状态"
        @update:model-value="handleRiskStatusChange"
      >
        <ElOption label="健康" value="healthy" />
        <ElOption label="关注" value="attention" />
        <ElOption label="风险" value="risk" />
      </ElSelect>
      <AppButton plain>
        <ElIcon><Filter /></ElIcon>
        高级筛选
      </AppButton>
    </FilterBar>

    <DataTableShell v-if="query.view === 'table'">
      <ElTable
        v-loading="projectsQuery.isLoading.value"
        :data="projects"
        row-key="id"
        @row-click="openProject"
      >
        <ElTableColumn label="项目名称" min-width="220">
          <template #default="{ row }: { row: ProjectSummary }">
            <div class="project-name-cell">
              <span class="project-name-cell__icon">{{
                row.name.slice(0, 1)
              }}</span>
              <div>
                <strong>{{ row.name }}</strong>
                <p>
                  {{ row.identifier }}
                  <span>· {{ visibilityLabel[row.visibility] }}</span>
                </p>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="项目类型" width="120">
          <template #default="{ row }: { row: ProjectSummary }">
            <StatusTag
              :label="methodLabel[row.method]"
              :tone="row.method === 'scrum' ? 'primary' : 'info'"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="110">
          <template #default="{ row }: { row: ProjectSummary }">
            <StatusTag
              :label="statusLabel[row.status]"
              :tone="statusTone[row.status]"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="负责人" width="130">
          <template #default="{ row }: { row: ProjectSummary }">
            {{ row.owner.display_name }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="current_stage"
          label="当前迭代/阶段"
          min-width="160"
        />
        <ElTableColumn label="进度概览" min-width="150">
          <template #default="{ row }: { row: ProjectSummary }">
            <ElProgress
              :percentage="row.task_completion_rate"
              :stroke-width="6"
              :show-text="false"
            />
            <span class="project-progress-text">
              {{ row.task_completion_rate }}% ·
              {{ row.requirement_completion_rate }}% 需求
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="质量概览" width="120">
          <template #default="{ row }: { row: ProjectSummary }">
            <strong>{{ row.test_pass_rate }}</strong>
            <p class="project-progress-text">
              缺陷：{{ row.blocker_or_critical_defect_count }}
            </p>
          </template>
        </ElTableColumn>
        <ElTableColumn label="健康度" width="110">
          <template #default="{ row }: { row: ProjectSummary }">
            <StatusTag
              :label="healthLabel[row.health_status]"
              :tone="healthTone[row.health_status]"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updated_at" label="更新时间" width="150" />
        <ElTableColumn label="操作" width="100" fixed="right">
          <template #default="{ row }: { row: ProjectSummary }">
            <AppButton link type="primary" @click.stop="openProject(row)">
              查看
            </AppButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="project-pagination">
        <span>共 {{ total }} 条</span>
        <ElPagination
          background
          layout="prev, pager, next, sizes"
          :current-page="query.page"
          :page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          @update:current-page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </DataTableShell>

    <section v-else class="project-card-grid">
      <article
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        @click="openProject(project)"
      >
        <div class="project-card__header">
          <div>
            <h3>{{ project.name }}</h3>
            <p>{{ project.identifier }} · {{ methodLabel[project.method] }}</p>
          </div>
          <StatusTag
            :label="healthLabel[project.health_status]"
            :tone="healthTone[project.health_status]"
          />
        </div>
        <p class="project-card__stage">{{ project.current_stage }}</p>
        <ElProgress
          :percentage="project.task_completion_rate"
          :stroke-width="8"
        />
        <div class="project-card__meta">
          <span>负责人：{{ project.owner.display_name }}</span>
          <span>缺陷：{{ project.blocker_or_critical_defect_count }}</span>
        </div>
        <p class="project-card__risk">{{ project.risk_summary }}</p>
      </article>
    </section>

    <CreateProjectDialog
      v-model="createDialogVisible"
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
  Filter,
  FolderChecked,
  Plus,
  Search,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AppButton,
  AppInput,
  DataTableShell,
  FilterBar,
  PageHeader,
  StatusTag,
  SummaryCard,
} from '@/shared/components'
import CreateProjectDialog from '../components/CreateProjectDialog.vue'
import {
  useCreateProject,
  useProjects,
  useProjectStats,
} from '../api/project.queries'
import {
  parseProjectListQuery,
  serializeProjectListQuery,
  type ProjectListQuery,
} from '../model/project-list-query'
import {
  healthLabel,
  healthTone,
  methodLabel,
  statusLabel,
  statusTone,
  visibilityLabel,
} from '../model/project-labels'
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
const createProjectMutation = useCreateProject()

const viewOptions = [
  { label: '表格', value: 'table' },
  { label: '卡片', value: 'card' },
]

const projects = computed(() => projectsQuery.data.value?.data ?? [])
const total = computed(() => projectsQuery.data.value?.pagination.total ?? 0)
const stats = computed(() => statsQuery.data.value)

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

const handleKeywordChange = (value: string | number) => {
  updateQuery({ keyword: String(value), page: 1 })
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

.project-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-2);
}

.project-filter__keyword {
  width: 300px;
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.project-name-cell__icon {
  display: grid;
  flex: none;
  width: 40px;
  height: 40px;
  place-items: center;
  color: white;
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary);
  border-radius: var(--radius-md);
}

.project-name-cell strong {
  font-weight: var(--font-weight-semibold);
}

.project-name-cell p,
.project-progress-text {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.project-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  color: var(--color-text-secondary);
}

.project-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
}

.project-card {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  cursor: pointer;
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.project-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.project-card__header,
.project-card__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.project-card h3,
.project-card p {
  margin: 0;
}

.project-card h3 {
  font-size: var(--font-size-title-sm);
}

.project-card__header p,
.project-card__stage,
.project-card__meta,
.project-card__risk {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

.project-card__risk {
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
}
</style>
