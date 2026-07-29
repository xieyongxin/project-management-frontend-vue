<template>
  <section class="project-detail-page" aria-label="项目详情">
    <AsyncPageSkeleton v-if="navigationQuery.isLoading.value" />
    <PageError
      v-else-if="navigationQuery.isError.value"
      title="项目加载失败"
      description="项目不存在，或当前用户无权访问。"
      @retry="() => navigationQuery.refetch()"
    />
    <template v-else-if="navigation">
      <header v-if="!isWorkItemEditorPage" class="project-detail-header">
        <div>
          <h1>{{ navigation.project.name }}</h1>
          <div class="project-detail-header__meta">
            <StatusTag
              :label="methodLabel[navigation.project.method]"
              :tone="navigation.project.method === 'scrum' ? 'primary' : 'info'"
            />
            <span>{{ navigation.project.identifier }}</span>
            <span>{{ navigation.project.current_stage }}</span>
            <StatusTag
              :label="healthLabel[navigation.project.health_status]"
              :tone="healthTone[navigation.project.health_status]"
            />
          </div>
        </div>
        <div class="project-detail-header__actions">
          <EButton v-if="canManageProject" @click="openProjectEdit">
            编辑项目
          </EButton>
          <EButton :disabled="isProjectArchived" @click="openCreateRequirement">
            新建需求
          </EButton>
          <EButton :disabled="isProjectArchived" @click="openCreateTask">
            新建任务
          </EButton>
          <EButton :disabled="isProjectArchived" @click="openCreateDefect">
            新建缺陷
          </EButton>
        </div>
      </header>

      <nav
        v-if="!isWorkItemEditorPage"
        class="project-tabs"
        aria-label="项目导航"
      >
        <RouterLink
          v-for="tab in navigation.tabs"
          :key="tab.tab_key"
          :to="tab.route"
          class="project-tabs__item"
        >
          {{ tab.name }}
        </RouterLink>
        <EDropdown
          v-if="navigation.more_tabs.length || navigation.system_entries.length"
        >
          <button class="project-tabs__item project-tabs__more" type="button">
            更多
            <EIcon><ArrowDown /></EIcon>
          </button>
          <template #dropdown>
            <EDropdownMenu>
              <EDropdownItem
                v-for="tab in navigation.more_tabs"
                :key="tab.tab_key"
                @click="router.push(tab.route)"
              >
                {{ tab.name }}
              </EDropdownItem>
              <EDropdownItem
                v-for="entry in navigation.system_entries"
                :key="entry.tab_key"
                divided
                @click="router.push(entry.route)"
              >
                {{ entry.name }}
              </EDropdownItem>
            </EDropdownMenu>
          </template>
        </EDropdown>
      </nav>

      <main class="project-detail-content">
        <section v-if="createKind" class="requirement-editor-shell">
          <RequirementObjectHeader
            :model-value="workItemForm.title"
            :placeholder="createTitlePlaceholder"
            :kind-label="workItemCreateKindLabel"
            context="新建工作项"
            status="未保存"
            :priority="priorityDisplayLabel(workItemForm.priority)"
            :priority-tone="priorityToneValue(workItemForm.priority)"
            @update:model-value="updateWorkItemFormField('title', $event)"
          >
            <template #back>
              <EButton link type="primary" @click="cancelCreateWorkItem">
                ← 返回{{ workItemCreateKindLabel }}列表
              </EButton>
            </template>
            <template #actions>
              <EButton @click="cancelCreateWorkItem">取消</EButton>
              <EButton
                type="primary"
                :loading="createWorkItemMutation.isPending.value"
                @click="submitWorkItem"
              >
                创建
              </EButton>
            </template>
          </RequirementObjectHeader>
          <RequirementSummaryBar :items="createWorkItemSummaryItems" />
          <WorkItemEditor
            mode="create"
            :kind="createKind"
            title-placement="header"
            :show-sidebar-actions="false"
            :form="workItemForm"
            :members="membersQuery.data.value ?? []"
            :requirements="createParentOptions"
            @update-field="updateWorkItemFormField"
          />
        </section>

        <WorkItemDetailPanel v-else-if="workItemId" />

        <section
          v-else-if="section === 'overview'"
          class="project-overview-grid"
        >
          <SummaryCard
            label="项目健康度"
            :value="overviewHealthLabel"
            description="后端根据进度、测试和缺陷统计"
            tone="success"
          />
          <SummaryCard
            label="需求进度"
            :value="`${overview?.requirement_progress ?? 0}%`"
            description="已确认 / 已验收需求"
            tone="primary"
          />
          <SummaryCard
            label="任务进度"
            :value="`${overview?.task_progress ?? 0}%`"
            description="任务完成情况"
            tone="info"
          />
          <SummaryCard
            label="测试进度"
            :value="`${overview?.test_progress ?? 0}%`"
            description="测试执行通过率"
            tone="purple"
          />
          <section class="project-detail-panel project-detail-panel--wide">
            <h2>质量风险</h2>
            <p>
              {{ overview?.defect_summary ?? navigation.project.risk_summary }}
            </p>
          </section>
          <ActivityTimeline
            class="project-detail-panel project-detail-panel--wide"
            :events="overview?.recent_activity ?? []"
          />
        </section>

        <WorkItemListPanel
          v-else-if="['requirements', 'tasks', 'defects'].includes(section)"
          :key="section"
          :kind="section"
        />
        <SprintPanel v-else-if="section === 'sprints'" />
        <PhasePanel v-else-if="section === 'phases'" />
        <VersionPanel v-else-if="section === 'versions'" />
        <TestPanel v-else-if="section === 'tests'" />
        <MemberPanel v-else-if="section === 'members'" />
        <ActivityTimeline
          v-else-if="section === 'activity'"
          class="project-detail-panel"
          :events="activityQuery.data.value ?? []"
        />
        <ConfigurationPanel v-else-if="section === 'configuration'" />
        <section v-else class="project-detail-panel">
          <EmptyState
            title="模块不可用"
            description="当前项目未启用该业务模块。"
          />
        </section>
      </main>

      <EDialog v-model="projectEditVisible" title="编辑项目资料" width="720px">
        <EForm label-width="104px">
          <EFormItem label="项目名称">
            <EInput v-model="projectEditForm.name" />
          </EFormItem>
          <EFormItem label="项目负责人">
            <ESelect v-model="projectEditForm.owner_id">
              <EOption
                v-for="user in projectOwnerOptions"
                :key="user.id"
                :label="user.display_name"
                :value="user.id"
              />
            </ESelect>
          </EFormItem>
          <EFormItem label="默认处理人">
            <ESelect v-model="projectEditForm.default_assignee_id" clearable>
              <EOption
                v-for="user in projectOwnerOptions"
                :key="user.id"
                :label="user.display_name"
                :value="user.id"
              />
            </ESelect>
          </EFormItem>
          <EFormItem label="可见性">
            <ESelect v-model="projectEditForm.visibility">
              <EOption label="私有" value="private" />
              <EOption label="公开" value="public" />
            </ESelect>
          </EFormItem>
          <EFormItem label="项目周期">
            <div class="project-edit-date-row">
              <EDatePicker
                v-model="projectEditForm.start_at"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="开始日期"
              />
              <EDatePicker
                v-model="projectEditForm.end_at"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="结束日期"
              />
            </div>
          </EFormItem>
          <EFormItem label="项目描述">
            <EInput
              v-model="projectEditForm.description"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
            />
          </EFormItem>
        </EForm>
        <template #footer>
          <EButton @click="projectEditVisible = false">取消</EButton>
          <EButton
            type="primary"
            :loading="updateProjectMutation.isPending.value"
            @click="submitProjectEdit"
          >
            保存
          </EButton>
        </template>
      </EDialog>
    </template>
  </section>
</template>
<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { ArrowDown } from '@element-plus/icons-vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElOption,
  ElSelect,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTimeline,
  ElTimelineItem,
  ElMessage,
  ElMessageBox,
} from 'element-plus'
import {
  computed,
  defineComponent,
  h,
  onMounted,
  reactive,
  ref,
  type PropType,
  watch,
} from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  AsyncPageSkeleton,
  EmptyState,
  PageError,
  StatusTag,
  SummaryCard,
} from '@/shared/components'
import type {
  ProjectActivityEvent,
  ProjectPhase,
  ProjectSprint,
  ProjectSprintCategory,
  ProjectTestRun,
  ProjectVersion,
  ProjectVersionStage,
  WorkItem,
  WorkItemCreatePayload,
  WorkItemSummary,
} from '../model/project-detail.types'
import RichTextEditor from '../components/RichTextEditor.vue'
import RequirementObjectHeader from '../components/RequirementObjectHeader.vue'
import RequirementSummaryBar from '../components/RequirementSummaryBar.vue'
import WorkItemEditor from '../components/WorkItemEditor.vue'
import type {
  WorkItemEditorField,
  WorkItemEditorForm,
} from '../components/WorkItemEditor.vue'
import { projectDetailApi } from '../api/project-detail.api'
import {
  useProject,
  useProjectCreateTemplate,
  useProjectCurrentUser,
  useProjectNavigation,
  useProjectOverview,
  useUpdateProject,
} from '../api/project.queries'
import { healthLabel, healthTone, methodLabel } from '../model/project-labels'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const EButton = ElButton as any
const EDatePicker = ElDatePicker as any
const EDialog = ElDialog as any
const EDropdown = ElDropdown as any
const EDropdownItem = ElDropdownItem as any
const EDropdownMenu = ElDropdownMenu as any
const EForm = ElForm as any
const EFormItem = ElFormItem as any
const EIcon = ElIcon as any
const EInput = ElInput as any
const EOption = ElOption as any
const ESelect = ElSelect as any
const ETabPane = ElTabPane as any
const ETable = ElTable as any
const ETableColumn = ElTableColumn as any
const ETabs = ElTabs as any
const ETag = ElTag as any
const ETimeline = ElTimeline as any
const ETimelineItem = ElTimelineItem as any

const projectId = computed(() => String(route.params.projectId))
const section = computed(() => String(route.params.section ?? 'overview'))
const workItemId = computed(() => String(route.params.workItemId ?? ''))
type WorkItemCreateMode = 'requirement' | 'task' | 'defect'
const createKind = computed<WorkItemCreateMode | ''>(() => {
  if (route.query.mode !== 'create') {
    return ''
  }
  const type = String(route.query.type ?? '')
  if (type === 'requirement' || type === 'task' || type === 'defect') {
    return type
  }
  return ''
})
const isWorkItemEditorPage = computed(() =>
  Boolean(createKind.value || workItemId.value),
)

const navigationQuery = useProjectNavigation(projectId)
const overviewQuery = useProjectOverview(projectId)
const projectQuery = useProject(projectId)
const projectCreateTemplateQuery = useProjectCreateTemplate()
const currentUserQuery = useProjectCurrentUser()
const updateProjectMutation = useUpdateProject()
const navigation = computed(() => navigationQuery.data.value)
const overview = computed(() => overviewQuery.data.value)
const projectDetail = computed(() => projectQuery.data.value)
const projectOwnerOptions = computed(
  () => projectCreateTemplateQuery.data.value?.owners ?? [],
)
const currentUser = computed(() => currentUserQuery.data.value)
const acceptanceStatusLabel: Record<string, string> = {
  not_started: '未验收',
  accepted: '已通过',
  rejected: '已拒绝',
}
const isProjectArchived = computed(
  () => navigation.value?.project.status === 'archived',
)
const canManageProject = computed(() => {
  const user = currentUser.value
  const project = navigation.value?.project
  if (!user || !project || project.status === 'archived') {
    return false
  }
  if (user.roles.includes('system_admin') || project.owner.id === user.id) {
    return true
  }
  return (membersQuery.data.value ?? []).some(
    (member: any) =>
      member.user.id === user.id &&
      member.active &&
      member.role_key === 'project_owner',
  )
})

const activityQuery = useQuery({
  queryKey: computed(() => ['projects', projectId.value, 'activity']),
  queryFn: () => projectDetailApi.activity(projectId.value),
  enabled: computed(() => Boolean(projectId.value)),
})

const membersQuery = useQuery({
  queryKey: computed(() => ['projects', projectId.value, 'members']),
  queryFn: () => projectDetailApi.members(projectId.value),
  enabled: computed(() => Boolean(projectId.value)),
})

const priorityText: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const priorityTone: Record<string, 'high' | 'medium' | 'low'> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
}

const prioritySummaryTone: Record<
  string,
  'primary' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
}

const priorityDisplayLabel = (priority?: string) =>
  priority ? (priorityText[priority] ?? priority) : '-'

const priorityToneValue = (priority?: string) =>
  priority ? (priorityTone[priority] ?? 'medium') : 'medium'

const prioritySummaryToneValue = (priority?: string) =>
  priority ? (prioritySummaryTone[priority] ?? 'neutral') : 'neutral'

function workItemKindLabel(kind: WorkItemCreateMode | '' | WorkItem['type']) {
  if (kind === 'task') {
    return '任务'
  }
  if (kind === 'defect' || kind === 'bug') {
    return '缺陷'
  }
  return '需求'
}

const formatPlanRange = (startAt?: string, endAt?: string) => {
  if (startAt && endAt) {
    return `${startAt} ～ ${endAt}`
  }
  if (startAt) {
    return startAt
  }
  if (endAt) {
    return endAt
  }
  return '-'
}

const formatHours = (hours?: number) => {
  if (!hours || hours <= 0) {
    return '-'
  }
  return `${hours} 小时`
}

const resolveMemberName = (userId?: string) => {
  if (!userId) {
    return '未分配'
  }
  return (
    membersQuery.data.value?.find((member: any) => member.user.id === userId)
      ?.user.display_name ?? '未分配'
  )
}

const requirementOptionsQuery = useQuery({
  queryKey: computed(() => [
    'projects',
    projectId.value,
    'requirements',
    'options',
  ]),
  queryFn: () =>
    projectDetailApi.workItems(projectId.value, 'requirements', {
      page: 1,
      page_size: 100,
    }),
  enabled: computed(() => Boolean(projectId.value)),
})

const taskOptionsQuery = useQuery({
  queryKey: computed(() => ['projects', projectId.value, 'tasks', 'options']),
  queryFn: () =>
    projectDetailApi.workItems(projectId.value, 'tasks', {
      page: 1,
      page_size: 100,
    }),
  enabled: computed(() => Boolean(projectId.value)),
})

const createMode = ref<WorkItemCreateMode>('requirement')
const workItemCreateKindLabel = computed(() =>
  workItemKindLabel(createKind.value),
)
const createTitlePlaceholder = computed(
  () => `请输入${workItemCreateKindLabel.value}标题`,
)
const overviewHealthLabel = computed(() => {
  const health = overview.value?.health
  if (!health) {
    return '--'
  }
  return healthLabel[health as keyof typeof healthLabel] ?? health
})
const createParentOptions = computed(() => {
  if (createKind.value === 'defect') {
    return [
      ...(requirementOptionsQuery.data.value?.data ?? []),
      ...(taskOptionsQuery.data.value?.data ?? []),
    ]
  }
  return requirementOptionsQuery.data.value?.data ?? []
})
const projectEditVisible = ref(false)
type WorkItemForm = WorkItemCreatePayload & {
  title: string
  description: string
  acceptance: string
  assignee_id?: string
  parent_id?: string
  start_at: string
  end_at: string
  requirement_detail: {
    source: string
    business_value: string
  }
  task_detail: {
    category: string
    technical_notes: string
    review_required: boolean
    code_review_url: string
  }
  bug_detail: {
    bug_type: string
    environment: string
    reproduce_steps: string
    expected_result: string
    actual_result: string
    found_in_version_id?: string | null
    fixed_in_version_id?: string | null
    source_test_run_id?: string | null
    source_test_plan_id?: string | null
    regression_test_run_id?: string | null
    fix_summary: string
    reopened_count: number
  }
}

const workItemForm = reactive<WorkItemForm>({
  project_id: projectId.value,
  type: 'story',
  title: '',
  description: '<p></p>',
  acceptance: '<p></p>',
  priority: 'medium',
  severity: '',
  start_at: '',
  end_at: '',
  story_points: 0,
  estimated_hours: 0,
  remaining_hours: 0,
  requirement_detail: {
    source: '',
    business_value: '',
  },
  task_detail: {
    category: 'development',
    technical_notes: '',
    review_required: true,
    code_review_url: '',
  },
  bug_detail: {
    bug_type: 'functional',
    environment: '',
    reproduce_steps: '',
    expected_result: '',
    actual_result: '',
    found_in_version_id: null,
    fixed_in_version_id: null,
    source_test_run_id: null,
    source_test_plan_id: null,
    regression_test_run_id: null,
    fix_summary: '',
    reopened_count: 0,
  },
})

const createWorkItemSummaryItems = computed(() => [
  {
    label: '负责人',
    value: resolveMemberName(workItemForm.assignee_id),
  },
  {
    label: '状态',
    value: '未保存',
    tone: 'neutral' as const,
  },
  {
    label: '优先级',
    value: priorityDisplayLabel(workItemForm.priority),
    tone: prioritySummaryToneValue(workItemForm.priority),
  },
  {
    label: '计划时间',
    value: formatPlanRange(workItemForm.start_at, workItemForm.end_at),
  },
  {
    label: '预计工作量',
    value: formatHours(workItemForm.estimated_hours),
  },
])

const createWorkItemMutation = useMutation({
  mutationFn: (payload: WorkItemCreatePayload) =>
    projectDetailApi.createWorkItem(payload),
  onSuccess: async (item) => {
    await queryClient.invalidateQueries({ queryKey: ['projects'] })
    await router.push(`/projects/${projectId.value}/work-items/${item.id}`)
  },
})

const projectEditForm = reactive({
  row_version: 0,
  name: '',
  owner_id: '',
  default_assignee_id: '',
  visibility: 'private',
  start_at: '',
  end_at: '',
  description: '',
})

function openProjectEdit() {
  const project = projectDetail.value
  if (!project) {
    ElMessage.warning('项目资料尚未加载完成')
    return
  }
  Object.assign(projectEditForm, {
    row_version: project.row_version,
    name: project.name,
    owner_id: project.owner.id,
    default_assignee_id: project.default_assignee?.id ?? '',
    visibility: project.visibility,
    start_at: project.start_at,
    end_at: project.end_at,
    description: project.description,
  })
  projectEditVisible.value = true
}

function resetWorkItemForm(kind: WorkItemCreateMode) {
  createMode.value = kind
  Object.assign(workItemForm, {
    project_id: projectId.value,
    type: kind === 'task' ? 'task' : kind === 'defect' ? 'bug' : 'story',
    title: '',
    description: '<p></p>',
    acceptance: kind === 'requirement' ? '<p></p>' : '',
    priority: 'medium',
    severity: '',
    start_at: '',
    end_at: '',
    story_points: 0,
    estimated_hours: 0,
    remaining_hours: 0,
    assignee_id: undefined,
    parent_id: undefined,
    requirement_detail: {
      source: '',
      business_value: '',
    },
    task_detail: {
      category: 'development',
      technical_notes: '',
      review_required: true,
      code_review_url: '',
    },
    bug_detail: {
      bug_type: 'functional',
      environment: '',
      reproduce_steps: '',
      expected_result: '',
      actual_result: '',
      found_in_version_id: null,
      fixed_in_version_id: null,
      source_test_run_id: null,
      source_test_plan_id: null,
      regression_test_run_id: null,
      fix_summary: '',
      reopened_count: 0,
    },
  })
}

watch(
  () => [createKind.value, projectId.value] as const,
  ([kind]) => {
    if (kind) {
      resetWorkItemForm(kind)
    }
  },
  { immediate: true },
)

function submitProjectEdit() {
  if (!projectEditForm.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }
  if (!projectEditForm.owner_id) {
    ElMessage.warning('请选择项目负责人')
    return
  }
  if (
    projectEditForm.start_at &&
    projectEditForm.end_at &&
    projectEditForm.start_at > projectEditForm.end_at
  ) {
    ElMessage.warning('开始日期不能晚于结束日期')
    return
  }
  updateProjectMutation.mutate(
    {
      projectId: projectId.value,
      payload: {
        row_version: projectEditForm.row_version,
        name: projectEditForm.name.trim(),
        owner_id: projectEditForm.owner_id,
        default_assignee_id: projectEditForm.default_assignee_id || null,
        visibility: projectEditForm.visibility as any,
        start_at: projectEditForm.start_at,
        end_at: projectEditForm.end_at,
        description: projectEditForm.description.trim(),
      },
    },
    {
      onSuccess: () => {
        projectEditVisible.value = false
        ElMessage.success('项目资料已保存')
        void Promise.all([
          projectQuery.refetch(),
          navigationQuery.refetch(),
          overviewQuery.refetch(),
        ])
      },
    },
  )
}

function openCreateRequirement() {
  resetWorkItemForm('requirement')
  void router.push({
    path: `/projects/${projectId.value}/requirements`,
    query: { mode: 'create', type: 'requirement' },
  })
}

function openCreateTask() {
  resetWorkItemForm('task')
  void router.push({
    path: `/projects/${projectId.value}/tasks`,
    query: { mode: 'create', type: 'task' },
  })
}

function openCreateDefect() {
  resetWorkItemForm('defect')
  void router.push({
    path: `/projects/${projectId.value}/defects`,
    query: { mode: 'create', type: 'defect' },
  })
}

function cancelCreateWorkItem() {
  void router.push({
    path: `/projects/${projectId.value}/${section.value}`,
  })
}

function isRichTextBlank(value: string) {
  const normalized = value.trim()
  return (
    !normalized ||
    normalized === '<p></p>' ||
    normalized === '<p><br></p>' ||
    normalized === '<p>&nbsp;</p>'
  )
}

function stringFieldValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString()
  }
  return ''
}

function numberFieldValue(value: unknown) {
  return typeof value === 'number'
    ? value
    : Number(stringFieldValue(value)) || 0
}

function updateFormField(
  form: WorkItemEditorForm,
  field: WorkItemEditorField,
  value: unknown,
) {
  switch (field) {
    case 'title':
      form.title = stringFieldValue(value)
      break
    case 'description':
      form.description = stringFieldValue(value)
      break
    case 'acceptance':
      form.acceptance = stringFieldValue(value)
      break
    case 'priority':
      form.priority = stringFieldValue(value)
      break
    case 'severity':
      form.severity = stringFieldValue(value)
      break
    case 'assignee_id':
      if (value) {
        form.assignee_id = stringFieldValue(value)
      } else {
        delete form.assignee_id
      }
      break
    case 'parent_id':
      if (value) {
        form.parent_id = stringFieldValue(value)
      } else {
        delete form.parent_id
      }
      break
    case 'start_at':
      form.start_at = stringFieldValue(value)
      break
    case 'end_at':
      form.end_at = stringFieldValue(value)
      break
    case 'estimated_hours':
      form.estimated_hours = numberFieldValue(value)
      break
    case 'remaining_hours':
      form.remaining_hours = numberFieldValue(value)
      break
    case 'requirement_detail.source':
      form.requirement_detail.source = stringFieldValue(value)
      break
    case 'requirement_detail.business_value':
      form.requirement_detail.business_value = stringFieldValue(value)
      break
    case 'task_detail.category':
      form.task_detail.category = stringFieldValue(value)
      break
    case 'task_detail.technical_notes':
      form.task_detail.technical_notes = stringFieldValue(value)
      break
    case 'task_detail.review_required':
      form.task_detail.review_required = value === true
      break
    case 'task_detail.code_review_url':
      form.task_detail.code_review_url = stringFieldValue(value)
      break
    case 'bug_detail.bug_type':
      form.bug_detail.bug_type = stringFieldValue(value)
      break
    case 'bug_detail.environment':
      form.bug_detail.environment = stringFieldValue(value)
      break
    case 'bug_detail.reproduce_steps':
      form.bug_detail.reproduce_steps = stringFieldValue(value)
      break
    case 'bug_detail.expected_result':
      form.bug_detail.expected_result = stringFieldValue(value)
      break
    case 'bug_detail.actual_result':
      form.bug_detail.actual_result = stringFieldValue(value)
      break
    case 'bug_detail.fix_summary':
      form.bug_detail.fix_summary = stringFieldValue(value)
  }
}

function updateWorkItemFormField(field: WorkItemEditorField, value: unknown) {
  updateFormField(workItemForm, field, value)
}

function submitWorkItem() {
  if (!workItemForm.title.trim()) {
    ElMessage.warning(
      createMode.value === 'task'
        ? '请输入任务标题'
        : createMode.value === 'defect'
          ? '请输入缺陷标题'
          : '请输入需求标题',
    )
    return
  }
  if (createMode.value !== 'defect' && !workItemForm.assignee_id) {
    ElMessage.warning(
      createMode.value === 'task' ? '请选择任务负责人' : '请选择需求负责人',
    )
    return
  }
  if (
    createMode.value === 'requirement' &&
    (!workItemForm.start_at || !workItemForm.end_at)
  ) {
    ElMessage.warning('请选择计划开始和结束时间')
    return
  }
  if (
    workItemForm.start_at &&
    workItemForm.end_at &&
    workItemForm.start_at > workItemForm.end_at
  ) {
    ElMessage.warning('计划开始时间不能晚于结束时间')
    return
  }
  if (
    createMode.value === 'requirement' &&
    isRichTextBlank(workItemForm.description)
  ) {
    ElMessage.warning('请输入需求描述')
    return
  }
  if (
    createMode.value === 'requirement' &&
    isRichTextBlank(workItemForm.acceptance)
  ) {
    ElMessage.warning('请输入验收标准')
    return
  }
  if (
    createMode.value === 'task' &&
    ((workItemForm.estimated_hours ?? 0) < 0 ||
      (workItemForm.remaining_hours ?? 0) < 0)
  ) {
    ElMessage.warning('任务工时不能为负数')
    return
  }
  createWorkItemMutation.mutate({
    ...workItemForm,
    requirement_detail:
      createMode.value === 'requirement'
        ? { ...workItemForm.requirement_detail }
        : null,
    task_detail:
      createMode.value === 'task' ? { ...workItemForm.task_detail } : null,
    bug_detail:
      createMode.value === 'defect' ? { ...workItemForm.bug_detail } : null,
    type:
      createMode.value === 'task'
        ? 'task'
        : createMode.value === 'defect'
          ? 'bug'
          : 'story',
  })
}

const WorkItemListPanel = defineComponent({
  props: { kind: { type: String, required: true } },
  setup(props) {
    const keyword = ref('')
    const status = ref('')
    const query = useQuery({
      queryKey: computed(() => [
        'projects',
        projectId.value,
        props.kind,
        keyword.value,
        status.value,
      ]),
      queryFn: () => {
        const params: {
          keyword?: string
          status?: string
          page: number
          page_size: number
        } = {
          page: 1,
          page_size: 50,
        }
        if (keyword.value) {
          params.keyword = keyword.value
        }
        if (status.value) {
          params.status = status.value
        }
        return projectDetailApi.workItems(
          projectId.value,
          props.kind as any,
          params,
        )
      },
    })
    const title = computed(() =>
      props.kind === 'tasks'
        ? '任务管理'
        : props.kind === 'defects'
          ? '缺陷管理'
          : '需求管理',
    )
    const statusOptions = computed(() => {
      if (props.kind === 'tasks') {
        return [
          { label: '待处理', value: 'pending' },
          { label: '进行中', value: 'in_progress' },
          { label: '代码评审', value: 'code_review' },
          { label: '待测试', value: 'ready_for_test' },
          { label: '已完成', value: 'completed' },
          { label: '已关闭', value: 'closed' },
        ]
      }
      if (props.kind === 'defects') {
        return [
          { label: '新提交', value: 'submitted' },
          { label: '处理中', value: 'processing' },
          { label: '挂起', value: 'suspended' },
          { label: '已修复', value: 'fixed' },
          { label: '回归中', value: 'regressing' },
          { label: '重新打开', value: 'reopened' },
          { label: '已拒绝', value: 'rejected' },
          { label: '已关闭', value: 'closed' },
        ]
      }
      return [
        { label: '草稿', value: 'draft' },
        { label: '待评审', value: 'reviewing' },
        { label: '已就绪', value: 'ready' },
        { label: '开发中', value: 'developing' },
        { label: '测试中', value: 'testing' },
        { label: '待验收', value: 'accepting' },
        { label: '已完成', value: 'completed' },
        { label: '已关闭', value: 'closed' },
      ]
    })
    return () =>
      h('section', { class: 'project-detail-panel work-item-list-panel' }, [
        h('div', { class: 'work-item-list-panel__toolbar' }, [
          h('h2', title.value),
          h('div', { class: 'work-item-list-panel__filters' }, [
            h(EInput, {
              modelValue: keyword.value,
              'onUpdate:modelValue': (v: string) => (keyword.value = v),
              placeholder: '搜索编号、标题',
              clearable: true,
            }),
            h(
              ESelect,
              {
                modelValue: status.value,
                'onUpdate:modelValue': (v: string) => (status.value = v),
                placeholder: '状态',
                clearable: true,
              },
              () =>
                statusOptions.value.map((option) =>
                  h(EOption, {
                    label: option.label,
                    value: option.value,
                  }),
                ),
            ),
          ]),
        ]),
        h('div', { class: 'work-item-list-panel__table-wrap' }, [
          h(
            ETable,
            {
              data: query.data.value?.data ?? [],
              stripe: true,
              fit: true,
              onRowClick: (row: WorkItemSummary) =>
                router.push(
                  `/projects/${projectId.value}/work-items/${row.id}`,
                ),
            },
            () => [
              h(ETableColumn, {
                prop: 'number',
                label: '编号',
                width: 140,
                showOverflowTooltip: true,
              }),
              h(ETableColumn, {
                prop: 'title',
                label: '标题',
                minWidth: 220,
                showOverflowTooltip: true,
              }),
              h(
                ETableColumn,
                { label: '状态', width: 120 },
                {
                  default: ({ row }: any) =>
                    h(
                      ETag,
                      { color: row.status_color, effect: 'dark' },
                      () => row.status_name,
                    ),
                },
              ),
              h(ETableColumn, {
                prop: 'priority',
                label: '优先级',
                width: 86,
                showOverflowTooltip: true,
              }),
              h(
                ETableColumn,
                { label: '负责人', width: 116, showOverflowTooltip: true },
                {
                  default: ({ row }: any) => row.assignee?.display_name ?? '-',
                },
              ),
              props.kind === 'defects'
                ? h(ETableColumn, {
                    prop: 'severity',
                    label: '严重程度',
                    width: 108,
                    showOverflowTooltip: true,
                  })
                : null,
              props.kind === 'tasks'
                ? h(
                    ETableColumn,
                    {
                      label: '父需求',
                      minWidth: 180,
                      showOverflowTooltip: true,
                    },
                    {
                      default: ({ row }: any) =>
                        row.parent
                          ? `${row.parent.number} ${row.parent.title}`
                          : '独立任务',
                    },
                  )
                : props.kind === 'defects'
                  ? h(
                      ETableColumn,
                      {
                        label: '关联项',
                        minWidth: 180,
                        showOverflowTooltip: true,
                      },
                      {
                        default: ({ row }: any) =>
                          row.parent
                            ? `${row.parent.number} ${row.parent.title}`
                            : '未关联',
                      },
                    )
                  : h(
                      ETableColumn,
                      { label: '验收', width: 100, showOverflowTooltip: true },
                      {
                        default: ({ row }: any) =>
                          acceptanceStatusLabel[row.acceptance_status] ?? '-',
                      },
                    ),
              props.kind === 'tasks'
                ? h(ETableColumn, {
                    prop: 'remaining_hours',
                    label: '剩余工时',
                    width: 104,
                  })
                : null,
              props.kind === 'tasks'
                ? h(
                    ETableColumn,
                    {
                      label: '代码评审',
                      width: 104,
                      showOverflowTooltip: true,
                    },
                    {
                      default: ({ row }: any) =>
                        row.task_detail?.review_required
                          ? row.task_detail?.code_review_url
                            ? '已关联'
                            : '需要'
                          : '不需要',
                    },
                  )
                : null,
              props.kind === 'defects'
                ? h(
                    ETableColumn,
                    {
                      label: '缺陷类型',
                      width: 112,
                      showOverflowTooltip: true,
                    },
                    {
                      default: ({ row }: any) => {
                        const bugType = row.bug_detail?.bug_type as
                          string | undefined
                        return bugType?.trim() ? bugType : '未分类'
                      },
                    },
                  )
                : null,
              h(ETableColumn, {
                prop: 'end_at',
                label: '计划结束',
                width: 128,
                showOverflowTooltip: true,
              }),
              h(ETableColumn, {
                prop: 'updated_at',
                label: '更新时间',
                width: 144,
                showOverflowTooltip: true,
              }),
            ],
          ),
        ]),
      ])
  },
})

const WorkItemDetailPanel = defineComponent({
  setup() {
    const activeTab = ref('detail')
    const comment = ref('')
    const transitionComment = ref('')
    const acceptanceComment = ref('')
    const devRecord = reactive({
      record_type: 'branch',
      title: '',
      url: '',
      status: '',
      summary: '',
    })
    const query = useQuery({
      queryKey: computed(() => ['work-items', workItemId.value]),
      queryFn: () => projectDetailApi.workItem(workItemId.value),
      enabled: computed(() => Boolean(workItemId.value)),
    })
    const draft = reactive({
      title: '',
      description: '',
      acceptance: '',
      parent_id: '',
      assignee_id: '',
      priority: 'medium',
      severity: '',
      start_at: '',
      end_at: '',
      story_points: 0,
      estimated_hours: 0,
      remaining_hours: 0,
      requirement_detail: {
        source: '',
        business_value: '',
      },
      task_detail: {
        category: 'development',
        technical_notes: '',
        review_required: true,
        code_review_url: '',
      },
      bug_detail: {
        bug_type: 'functional',
        environment: '',
        reproduce_steps: '',
        expected_result: '',
        actual_result: '',
        found_in_version_id: null as string | null,
        fixed_in_version_id: null as string | null,
        source_test_run_id: null as string | null,
        source_test_plan_id: null as string | null,
        regression_test_run_id: null as string | null,
        fix_summary: '',
        reopened_count: 0,
      },
    })
    const detailParentOptions = computed(() => [
      ...(requirementOptionsQuery.data.value?.data ?? []),
      ...(taskOptionsQuery.data.value?.data ?? []),
    ])
    watch(
      () => query.data.value,
      (item) => {
        if (!item) {
          return
        }
        Object.assign(draft, {
          title: item.title,
          description: item.description,
          acceptance: item.acceptance,
          parent_id: item.parent?.id ?? '',
          assignee_id: item.assignee?.id ?? '',
          priority: item.priority,
          severity: item.severity,
          start_at: item.start_at,
          end_at: item.end_at,
          story_points: item.story_points,
          estimated_hours: item.estimated_hours,
          remaining_hours: item.remaining_hours,
          requirement_detail: {
            source: item.requirement_detail?.source ?? '',
            business_value: item.requirement_detail?.business_value ?? '',
          },
          task_detail: {
            category: item.task_detail?.category ?? 'development',
            technical_notes: item.task_detail?.technical_notes ?? '',
            review_required: item.task_detail?.review_required ?? true,
            code_review_url: item.task_detail?.code_review_url ?? '',
          },
          bug_detail: {
            bug_type: item.bug_detail?.bug_type ?? 'functional',
            environment: item.bug_detail?.environment ?? '',
            reproduce_steps: item.bug_detail?.reproduce_steps ?? '',
            expected_result: item.bug_detail?.expected_result ?? '',
            actual_result: item.bug_detail?.actual_result ?? '',
            found_in_version_id: item.bug_detail?.found_in_version_id ?? null,
            fixed_in_version_id: item.bug_detail?.fixed_in_version_id ?? null,
            source_test_run_id: item.bug_detail?.source_test_run_id ?? null,
            source_test_plan_id: item.bug_detail?.source_test_plan_id ?? null,
            regression_test_run_id:
              item.bug_detail?.regression_test_run_id ?? null,
            fix_summary: item.bug_detail?.fix_summary ?? '',
            reopened_count: item.bug_detail?.reopened_count ?? 0,
          },
        })
      },
      { immediate: true },
    )
    const saveMutation = useMutation({
      mutationFn: (item: WorkItem) =>
        projectDetailApi.updateWorkItem(item.id, {
          project_id: item.project_id,
          type: item.type,
          title: draft.title,
          parent_id: draft.parent_id || null,
          description: draft.description,
          acceptance: draft.acceptance,
          assignee_id: draft.assignee_id || null,
          priority: draft.priority,
          severity: draft.severity,
          start_at: draft.start_at,
          end_at: draft.end_at,
          story_points: draft.story_points,
          estimated_hours: draft.estimated_hours,
          remaining_hours: draft.remaining_hours,
          requirement_detail: { ...draft.requirement_detail },
          task_detail: { ...draft.task_detail } as any,
          bug_detail: { ...draft.bug_detail } as any,
          row_version: item.row_version,
        }),
      onSuccess: () => query.refetch(),
    })
    const acceptanceMutation = useMutation({
      mutationFn: ({
        item,
        status,
      }: {
        item: WorkItem
        status: 'accepted' | 'rejected'
      }) =>
        projectDetailApi.createRequirementAcceptance(item.id, {
          status,
          comment: acceptanceComment.value,
          evidence_urls: [],
          row_version: item.row_version,
        }),
      onSuccess: () => {
        acceptanceComment.value = ''
        return query.refetch()
      },
    })
    const transitionMutation = useMutation({
      mutationFn: ({ item, key }: { item: WorkItem; key: string }) =>
        projectDetailApi.transitionWorkItem(item.id, {
          transition_key: key,
          comment: transitionComment.value,
          row_version: item.row_version,
        }),
      onSuccess: () => query.refetch(),
    })
    const commentMutation = useMutation({
      mutationFn: (item: WorkItem) =>
        projectDetailApi.createWorkItemComment(item.id, {
          content: comment.value,
        }),
      onSuccess: () => query.refetch(),
    })
    const devMutation = useMutation({
      mutationFn: (item: WorkItem) =>
        projectDetailApi.createDevRecord(item.id, devRecord as any),
      onSuccess: () => query.refetch(),
    })
    const submitAcceptance = (
      item: WorkItem,
      status: 'accepted' | 'rejected',
    ) => {
      if (status === 'rejected' && !acceptanceComment.value.trim()) {
        ElMessage.warning('请填写验收拒绝原因')
        return
      }
      acceptanceMutation.mutate({ item, status })
    }
    return () => {
      const item = query.data.value
      if (!item) return h(AsyncPageSkeleton)
      return h(
        'section',
        {
          class: 'requirement-editor-shell',
        },
        [
          h(
            RequirementObjectHeader,
            {
              modelValue: draft.title,
              'onUpdate:modelValue': (value: string) =>
                updateFormField(draft, 'title', value),
              number: item.number,
              kindLabel: workItemKindLabel(item.type),
              context: item.parent
                ? `${item.parent.number} ${item.parent.title}`
                : '项目工作项',
              status: item.status_name,
              statusColor: item.status_color,
              priority: priorityDisplayLabel(draft.priority),
              priorityTone: priorityToneValue(draft.priority),
              createdBy:
                item.created_by?.display_name ?? item.reporter.display_name,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            },
            {
              back: () =>
                h(
                  EButton,
                  {
                    link: true,
                    type: 'primary',
                    onClick: () =>
                      router.push(
                        `/projects/${projectId.value}/${section.value}`,
                      ),
                  },
                  () => `← 返回${workItemKindLabel(item.type)}列表`,
                ),
              actions: () => [
                h(
                  EButton,
                  {
                    onClick: () =>
                      router.push(
                        `/projects/${projectId.value}/${section.value}`,
                      ),
                  },
                  () => '取消',
                ),
                h(
                  EButton,
                  {
                    type: 'primary',
                    loading: saveMutation.isPending.value,
                    onClick: () => saveMutation.mutate(item),
                  },
                  () => '保存',
                ),
              ],
            },
          ),
          h(RequirementSummaryBar, {
            items: [
              {
                label: '负责人',
                value: resolveMemberName(draft.assignee_id),
              },
              {
                label: '状态',
                value: item.status_name,
                tone: 'primary',
              },
              {
                label: '优先级',
                value: priorityDisplayLabel(draft.priority),
                tone: prioritySummaryToneValue(draft.priority),
              },
              {
                label: '计划时间',
                value: formatPlanRange(draft.start_at, draft.end_at),
              },
              {
                label: '预计工作量',
                value: formatHours(draft.estimated_hours),
              },
            ],
          }),
          h(
            WorkItemEditor,
            {
              mode: 'detail',
              kind:
                item.type === 'task'
                  ? 'task'
                  : item.type === 'bug'
                    ? 'defect'
                    : 'requirement',
              titlePlacement: 'header',
              showSidebarActions: false,
              form: draft,
              members: membersQuery.data.value ?? [],
              requirements:
                item.type === 'bug'
                  ? detailParentOptions.value
                  : (requirementOptionsQuery.data.value?.data ?? []),
              item,
              onUpdateField: (field: WorkItemEditorField, value: unknown) =>
                updateFormField(draft, field, value),
            },
            {
              actions: () =>
                h(
                  EButton,
                  {
                    type: 'primary',
                    loading: saveMutation.isPending.value,
                    onClick: () => saveMutation.mutate(item),
                  },
                  () => '保存',
                ),
              tabs: () => [
                h('div', { class: 'transition-bar' }, [
                  h(EInput, {
                    modelValue: transitionComment.value,
                    'onUpdate:modelValue': (v: string) =>
                      (transitionComment.value = v),
                    placeholder: '填写流转备注',
                  }),
                  ...item.available_transitions.map((transition) =>
                    h(
                      EButton,
                      {
                        type: 'primary',
                        onClick: () =>
                          transitionMutation.mutate({
                            item,
                            key: transition.transition_key,
                          }),
                      },
                      () => transition.name,
                    ),
                  ),
                ]),
                h(
                  ETabs,
                  {
                    modelValue: activeTab.value,
                    'onUpdate:modelValue': (v: string) => (activeTab.value = v),
                  },
                  () => [
                    h(ETabPane, { label: '评论', name: 'comments' }, () => [
                      h(
                        'div',
                        { class: 'comment-list' },
                        item.comments.map((entry) =>
                          h('article', { class: 'comment-item' }, [
                            h('strong', entry.author.display_name),
                            h('span', entry.created_at),
                            h('div', { innerHTML: entry.content }),
                          ]),
                        ),
                      ),
                      h(RichTextEditor, {
                        modelValue: comment.value,
                        'onUpdate:modelValue': (v: string) =>
                          (comment.value = v),
                      }),
                      h(
                        EButton,
                        {
                          type: 'primary',
                          onClick: () => commentMutation.mutate(item),
                        },
                        () => '发表评论',
                      ),
                    ]),
                    item.type === 'story'
                      ? h(
                          ETabPane,
                          { label: '验收', name: 'acceptance' },
                          () => [
                            h('div', { class: 'detail-summary' }, [
                              h(
                                'span',
                                `当前状态：${
                                  acceptanceStatusLabel[
                                    item.requirement_detail
                                      ?.acceptance_status ??
                                      item.acceptance_status
                                  ] ?? '-'
                                }`,
                              ),
                              h(
                                'span',
                                `验收人：${
                                  item.requirement_detail?.accepted_by
                                    ?.display_name ?? '-'
                                }`,
                              ),
                              h(
                                'span',
                                `验收时间：${
                                  item.requirement_detail?.accepted_at ?? '-'
                                }`,
                              ),
                            ]),
                            item.requirement_detail?.rejected_reason
                              ? h(
                                  'p',
                                  `拒绝原因：${
                                    item.requirement_detail.rejected_reason
                                  }`,
                                )
                              : null,
                            h(EInput, {
                              modelValue: acceptanceComment.value,
                              'onUpdate:modelValue': (v: string) =>
                                (acceptanceComment.value = v),
                              type: 'textarea',
                              rows: 3,
                              placeholder: '填写验收意见；拒绝时必填',
                            }),
                            item.status === 'accepting'
                              ? h('div', { class: 'inline-form' }, [
                                  h(
                                    EButton,
                                    {
                                      type: 'primary',
                                      loading:
                                        acceptanceMutation.isPending.value,
                                      onClick: () =>
                                        submitAcceptance(item, 'accepted'),
                                    },
                                    () => '验收通过',
                                  ),
                                  h(
                                    EButton,
                                    {
                                      type: 'danger',
                                      loading:
                                        acceptanceMutation.isPending.value,
                                      onClick: () =>
                                        submitAcceptance(item, 'rejected'),
                                    },
                                    () => '验收拒绝',
                                  ),
                                ])
                              : null,
                            h(
                              ETable,
                              { data: item.requirement_acceptances },
                              () => [
                                h(ETableColumn, {
                                  label: '结果',
                                  width: 120,
                                  prop: 'status',
                                }),
                                h(ETableColumn, {
                                  label: '意见',
                                  prop: 'comment',
                                  minWidth: 220,
                                }),
                                h(ETableColumn, {
                                  label: '处理人',
                                  width: 140,
                                  prop: 'accepted_by.display_name',
                                }),
                                h(ETableColumn, {
                                  label: '时间',
                                  width: 180,
                                  prop: 'accepted_at',
                                }),
                              ],
                            ),
                          ],
                        )
                      : null,
                    h(ETabPane, { label: '开发', name: 'dev' }, () => [
                      h(ETable, { data: item.dev_records }, () => [
                        h(ETableColumn, {
                          prop: 'record_type',
                          label: '类型',
                          width: 120,
                        }),
                        h(ETableColumn, { prop: 'title', label: '标题' }),
                        h(ETableColumn, {
                          prop: 'status',
                          label: '状态',
                          width: 120,
                        }),
                        h(ETableColumn, { prop: 'summary', label: '摘要' }),
                      ]),
                      h('div', { class: 'inline-form' }, [
                        h(
                          ESelect,
                          {
                            modelValue: devRecord.record_type,
                            'onUpdate:modelValue': (v: string) =>
                              (devRecord.record_type = v),
                          },
                          () => [
                            h(EOption, { label: 'Branch', value: 'branch' }),
                            h(EOption, { label: 'Commit', value: 'commit' }),
                            h(EOption, { label: 'PR', value: 'pull_request' }),
                            h(EOption, { label: 'CI', value: 'ci' }),
                          ],
                        ),
                        h(EInput, {
                          modelValue: devRecord.title,
                          'onUpdate:modelValue': (v: string) =>
                            (devRecord.title = v),
                          placeholder: '标题',
                        }),
                        h(
                          EButton,
                          {
                            type: 'primary',
                            onClick: () => devMutation.mutate(item),
                          },
                          () => '添加',
                        ),
                      ]),
                    ]),
                    h(ETabPane, { label: '测试', name: 'tests' }, () =>
                      h(ETable, { data: item.test_runs }, () => [
                        h(ETableColumn, { prop: 'title', label: '执行' }),
                        h(ETableColumn, {
                          prop: 'status',
                          label: '状态',
                          width: 120,
                        }),
                        h(
                          ETableColumn,
                          { label: '执行人', width: 140 },
                          {
                            default: ({ row }: any) =>
                              row.executor?.display_name ?? '-',
                          },
                        ),
                      ]),
                    ),
                    h(ETabPane, { label: '历史', name: 'history' }, () =>
                      h(ETimeline, () =>
                        item.history.map((entry) =>
                          h(
                            ETimelineItem,
                            { timestamp: entry.created_at },
                            () =>
                              `${entry.actor.display_name} ${entry.summary}`,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            },
          ),
        ],
      )
    }
  },
})

const SprintPanel = defineComponent({
  setup() {
    const selectedSprintId = ref('')
    const query = useQuery({
      queryKey: computed(() => ['projects', projectId.value, 'sprints']),
      queryFn: () => projectDetailApi.sprints(projectId.value),
      enabled: computed(() => Boolean(projectId.value)),
    })
    const categoriesQuery = useQuery({
      queryKey: computed(() => [
        'projects',
        projectId.value,
        'sprint-categories',
      ]),
      queryFn: () => projectDetailApi.sprintCategories(projectId.value),
      enabled: computed(() => Boolean(projectId.value)),
    })

    const createForm = reactive({
      name: '',
      goal: '',
      assignee_id: '',
      category_id: '',
    })
    const detailForm = reactive({
      name: '',
      goal: '',
      description: '',
      start_date: '',
      end_date: '',
      assignee_id: '',
      category_id: '',
      planned_story_points: 0,
      planned_workload_hours: 0,
    })
    const categoryForm = reactive({ name: '', color: '#409EFF' })

    const sprintRows = computed(() => query.data.value ?? [])
    const categoryRows = computed(() => categoriesQuery.data.value ?? [])
    const memberOptions = computed(() =>
      (membersQuery.data.value ?? [])
        .filter((member: any) => member.active)
        .map((member: any) => member.user),
    )
    const selectedSprint = computed<ProjectSprint | undefined>(() => {
      const rows = sprintRows.value
      return (
        rows.find((sprint) => sprint.id === selectedSprintId.value) ?? rows[0]
      )
    })

    watch(
      selectedSprint,
      (sprint) => {
        if (!sprint) {
          return
        }
        selectedSprintId.value = sprint.id
        detailForm.name = sprint.name
        detailForm.goal = sprint.goal
        detailForm.description = sprint.description
        detailForm.start_date = sprint.start_date
        detailForm.end_date = sprint.end_date
        detailForm.assignee_id = sprint.assignee?.id ?? ''
        detailForm.category_id = sprint.category?.id ?? ''
        detailForm.planned_story_points = sprint.planned_story_points
        detailForm.planned_workload_hours = sprint.planned_workload_hours
      },
      { immediate: true },
    )

    const createMutation = useMutation({
      mutationFn: () =>
        projectDetailApi.createSprint(projectId.value, {
          name: createForm.name.trim(),
          goal: createForm.goal.trim(),
          status: 'pending',
          assignee_id: createForm.assignee_id || null,
          category_id: createForm.category_id || null,
        }),
      onSuccess: (rows) => {
        selectedSprintId.value = rows.at(-1)?.id ?? selectedSprintId.value
        createForm.name = ''
        createForm.goal = ''
        createForm.assignee_id = ''
        createForm.category_id = ''
        ElMessage.success('迭代已创建')
        void query.refetch()
      },
    })
    const categoryMutation = useMutation({
      mutationFn: () =>
        projectDetailApi.createSprintCategory(projectId.value, {
          name: categoryForm.name.trim(),
          color: categoryForm.color || '#409EFF',
        }),
      onSuccess: () => {
        categoryForm.name = ''
        ElMessage.success('迭代分类已创建')
        void categoriesQuery.refetch()
      },
    })
    const saveMutation = useMutation({
      mutationFn: ({
        sprint,
        payload,
      }: {
        sprint: ProjectSprint
        payload: Record<string, unknown>
      }) => projectDetailApi.updateSprint(sprint.id, payload as any),
      onSuccess: (sprint) => {
        selectedSprintId.value = sprint.id
        ElMessage.success('迭代已保存')
        void query.refetch()
      },
    })
    const transitionMutation = useMutation({
      mutationFn: ({
        sprint,
        action,
      }: {
        sprint: ProjectSprint
        action: 'start' | 'complete' | 'reopen'
      }) => {
        const payload = { row_version: sprint.row_version }
        if (action === 'start') {
          return projectDetailApi.startSprint(sprint.id, payload)
        }
        if (action === 'complete') {
          return projectDetailApi.completeSprint(sprint.id, payload)
        }
        return projectDetailApi.reopenSprint(sprint.id, payload)
      },
      onSuccess: (sprint) => {
        selectedSprintId.value = sprint.id
        void Promise.all([query.refetch(), overviewQuery.refetch()])
      },
    })

    const statusLabel: Record<string, string> = {
      pending: '未开始',
      in_progress: '进行中',
      completed: '已完成',
    }
    const statusTone: Record<string, 'info' | 'success' | 'warning'> = {
      pending: 'info',
      in_progress: 'warning',
      completed: 'success',
    }
    const capacityTone: Record<
      string,
      'info' | 'success' | 'warning' | 'danger'
    > = {
      unknown: 'info',
      normal: 'success',
      busy: 'warning',
      overloaded: 'danger',
      critical: 'danger',
    }

    const sprintCountByStatus = (status: string) =>
      sprintRows.value.filter((sprint) => sprint.status === status).length

    const sprintReportText = (sprint: ProjectSprint) => {
      const latestSummary = sprint.latest_report?.summary?.trim()
      if (latestSummary) {
        return latestSummary
      }
      const reportSummary = sprint.report_summary.trim()
      if (reportSummary) {
        return reportSummary
      }
      return '暂无报告快照'
    }

    const createSprintSubmit = () => {
      if (!createForm.name.trim()) {
        ElMessage.warning('请输入迭代名称')
        return
      }
      createMutation.mutate()
    }

    const createCategorySubmit = () => {
      if (!categoryForm.name.trim()) {
        ElMessage.warning('请输入分类名称')
        return
      }
      categoryMutation.mutate()
    }

    const saveSelectedSprint = () => {
      const sprint = selectedSprint.value
      if (!sprint) {
        return
      }
      if (!detailForm.name.trim()) {
        ElMessage.warning('请输入迭代名称')
        return
      }
      saveMutation.mutate({
        sprint,
        payload: {
          name: detailForm.name.trim(),
          goal: detailForm.goal,
          description: detailForm.description,
          status: sprint.status,
          start_date: detailForm.start_date,
          end_date: detailForm.end_date,
          assignee_id: detailForm.assignee_id || null,
          category_id: detailForm.category_id || null,
          planned_story_points: Number(detailForm.planned_story_points) || 0,
          planned_workload_hours:
            Number(detailForm.planned_workload_hours) || 0,
          row_version: sprint.row_version,
        },
      })
    }

    const renderMemberOptions = () =>
      memberOptions.value.map((user: any) =>
        h(EOption, {
          key: user.id,
          label: user.display_name,
          value: user.id,
        }),
      )

    const renderCategoryOptions = () =>
      categoryRows.value.map((category: ProjectSprintCategory) =>
        h(EOption, {
          key: category.id,
          label: category.name,
          value: category.id,
        }),
      )

    const renderTransitionButton = (
      sprint: ProjectSprint,
      action: 'start' | 'complete' | 'reopen',
      label: string,
      type: 'primary' | 'success' | 'warning',
    ) =>
      h(
        EButton,
        {
          size: 'small',
          type,
          disabled:
            isProjectArchived.value || transitionMutation.isPending.value,
          onClick: (event: MouseEvent) => {
            event.stopPropagation()
            transitionMutation.mutate({ sprint, action })
          },
        },
        () => label,
      )

    const renderSprintActions = (sprint: ProjectSprint) => {
      if (sprint.status === 'pending') {
        return renderTransitionButton(sprint, 'start', '开始', 'primary')
      }
      if (sprint.status === 'in_progress') {
        return renderTransitionButton(sprint, 'complete', '完成', 'success')
      }
      return renderTransitionButton(sprint, 'reopen', '重开', 'warning')
    }

    return () =>
      h('section', { class: 'project-detail-panel sprint-panel' }, [
        h('div', { class: 'panel-heading' }, [
          h('div', [
            h('h2', '迭代'),
            h(
              'p',
              { class: 'eyebrow' },
              '按状态、范围、测试和报告查看 Scrum 迭代',
            ),
          ]),
          h('div', { class: 'sprint-status-summary' }, [
            h(
              ETag,
              { type: 'info' },
              () => `未开始 ${sprintCountByStatus('pending')}`,
            ),
            h(
              ETag,
              { type: 'warning' },
              () => `进行中 ${sprintCountByStatus('in_progress')}`,
            ),
            h(
              ETag,
              { type: 'success' },
              () => `已完成 ${sprintCountByStatus('completed')}`,
            ),
          ]),
        ]),
        h('div', { class: 'sprint-create-row' }, [
          h(EInput, {
            modelValue: createForm.name,
            'onUpdate:modelValue': (value: string) => (createForm.name = value),
            placeholder: '迭代名称',
          }),
          h(EInput, {
            modelValue: createForm.goal,
            'onUpdate:modelValue': (value: string) => (createForm.goal = value),
            placeholder: '迭代目标',
          }),
          h(
            ESelect,
            {
              modelValue: createForm.assignee_id,
              'onUpdate:modelValue': (value: string) =>
                (createForm.assignee_id = value),
              clearable: true,
              placeholder: '负责人',
            },
            renderMemberOptions,
          ),
          h(
            ESelect,
            {
              modelValue: createForm.category_id,
              'onUpdate:modelValue': (value: string) =>
                (createForm.category_id = value),
              clearable: true,
              placeholder: '分类',
            },
            renderCategoryOptions,
          ),
          h(
            EButton,
            {
              type: 'primary',
              loading: createMutation.isPending.value,
              disabled: isProjectArchived.value,
              onClick: createSprintSubmit,
            },
            () => '新建',
          ),
        ]),
        h('div', { class: 'sprint-category-row' }, [
          h(EInput, {
            modelValue: categoryForm.name,
            'onUpdate:modelValue': (value: string) =>
              (categoryForm.name = value),
            placeholder: '轻量分类名称',
          }),
          h(EInput, {
            modelValue: categoryForm.color,
            'onUpdate:modelValue': (value: string) =>
              (categoryForm.color = value),
            placeholder: '#409EFF',
          }),
          h(
            EButton,
            {
              loading: categoryMutation.isPending.value,
              disabled: isProjectArchived.value,
              onClick: createCategorySubmit,
            },
            () => '添加分类',
          ),
        ]),
        h('div', { class: 'sprint-table-wrap' }, [
          h(
            ETable,
            {
              data: sprintRows.value,
              rowKey: 'id',
              highlightCurrentRow: true,
              onRowClick: (row: ProjectSprint) => {
                selectedSprintId.value = row.id
              },
            },
            () => [
              h(ETableColumn, { prop: 'name', label: '迭代', minWidth: 160 }),
              h(ETableColumn, {
                prop: 'category.name',
                label: '分类',
                width: 120,
              }),
              h(
                ETableColumn,
                { label: '状态', width: 120 },
                {
                  default: ({ row }: { row: ProjectSprint }) =>
                    h(
                      ETag,
                      { type: statusTone[row.status] ?? 'info' },
                      () => statusLabel[row.status] ?? row.status,
                    ),
                },
              ),
              h(ETableColumn, {
                label: '负责人',
                width: 140,
                formatter: (row: ProjectSprint) =>
                  row.assignee?.display_name ?? '-',
              }),
              h(
                ETableColumn,
                { label: '范围', width: 140 },
                {
                  default: ({ row }: { row: ProjectSprint }) =>
                    `${row.completed_work_items}/${row.total_work_items} 项`,
                },
              ),
              h(
                ETableColumn,
                { label: '质量', width: 150 },
                {
                  default: ({ row }: { row: ProjectSprint }) =>
                    `${row.test_run_passed}/${row.test_run_total} 通过`,
                },
              ),
              h(
                ETableColumn,
                { label: '容量', width: 160 },
                {
                  default: ({ row }: { row: ProjectSprint }) =>
                    h(
                      ETag,
                      { type: capacityTone[row.capacity_status] ?? 'info' },
                      () =>
                        row.capacity_hours
                          ? `${Math.round(row.capacity_usage_percent)}%`
                          : '未计算',
                    ),
                },
              ),
              h(
                ETableColumn,
                { label: '操作', width: 120 },
                {
                  default: ({ row }: { row: ProjectSprint }) =>
                    renderSprintActions(row),
                },
              ),
            ],
          ),
        ]),
        selectedSprint.value
          ? h('div', { class: 'sprint-detail' }, [
              h('div', { class: 'sprint-detail__heading' }, [
                h('div', [
                  h('h3', selectedSprint.value.name),
                  h(
                    'p',
                    { class: 'eyebrow' },
                    `${formatPlanRange(
                      selectedSprint.value.start_date,
                      selectedSprint.value.end_date,
                    )} · ${
                      selectedSprint.value.assignee?.display_name ?? '未分配'
                    }`,
                  ),
                ]),
                h(
                  ETag,
                  {
                    type: statusTone[selectedSprint.value.status] ?? 'info',
                  },
                  () =>
                    statusLabel[selectedSprint.value?.status ?? ''] ??
                    selectedSprint.value?.status,
                ),
              ]),
              h('div', { class: 'sprint-metrics' }, [
                h('div', [
                  h('strong', String(selectedSprint.value.total_work_items)),
                  h('span', '范围项'),
                ]),
                h('div', [
                  h(
                    'strong',
                    `${selectedSprint.value.completed_story_points}/${selectedSprint.value.planned_story_points}`,
                  ),
                  h('span', '故事点'),
                ]),
                h('div', [
                  h(
                    'strong',
                    `${selectedSprint.value.completed_workload_hours}/${selectedSprint.value.planned_workload_hours}`,
                  ),
                  h('span', '工时'),
                ]),
                h('div', [
                  h(
                    'strong',
                    `${selectedSprint.value.test_run_passed}/${selectedSprint.value.test_run_total}`,
                  ),
                  h('span', '测试通过'),
                ]),
              ]),
              h('div', { class: 'sprint-detail-form' }, [
                h(EInput, {
                  modelValue: detailForm.name,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.name = value),
                  placeholder: '迭代名称',
                }),
                h(EInput, {
                  modelValue: detailForm.goal,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.goal = value),
                  placeholder: '迭代目标',
                }),
                h(EInput, {
                  modelValue: detailForm.description,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.description = value),
                  placeholder: '迭代描述',
                }),
                h(EInput, {
                  modelValue: detailForm.start_date,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.start_date = value),
                  placeholder: '开始日期 YYYY-MM-DD',
                }),
                h(EInput, {
                  modelValue: detailForm.end_date,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.end_date = value),
                  placeholder: '结束日期 YYYY-MM-DD',
                }),
                h(
                  ESelect,
                  {
                    modelValue: detailForm.assignee_id,
                    'onUpdate:modelValue': (value: string) =>
                      (detailForm.assignee_id = value),
                    clearable: true,
                    placeholder: '负责人',
                  },
                  renderMemberOptions,
                ),
                h(
                  ESelect,
                  {
                    modelValue: detailForm.category_id,
                    'onUpdate:modelValue': (value: string) =>
                      (detailForm.category_id = value),
                    clearable: true,
                    placeholder: '分类',
                  },
                  renderCategoryOptions,
                ),
                h(EInput, {
                  type: 'number',
                  modelValue: detailForm.planned_story_points,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.planned_story_points = Number(value) || 0),
                  placeholder: '计划故事点',
                }),
                h(EInput, {
                  type: 'number',
                  modelValue: detailForm.planned_workload_hours,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.planned_workload_hours = Number(value) || 0),
                  placeholder: '计划工时',
                }),
                h(
                  EButton,
                  {
                    type: 'primary',
                    loading: saveMutation.isPending.value,
                    disabled: isProjectArchived.value,
                    onClick: saveSelectedSprint,
                  },
                  () => '保存详情',
                ),
              ]),
              h('div', { class: 'sprint-report' }, [
                h('h3', '迭代报告快照'),
                h('p', sprintReportText(selectedSprint.value)),
              ]),
            ])
          : h('p', { class: 'eyebrow' }, '暂无迭代'),
      ])
  },
})

const PhasePanel = defineComponent({
  setup() {
    const query = useQuery({
      queryKey: computed(() => ['projects', projectId.value, 'phases']),
      queryFn: () => projectDetailApi.phases(projectId.value),
    })
    const mutation = useMutation({
      mutationFn: (phase: ProjectPhase) =>
        projectDetailApi.updatePhase(phase.id, {
          row_version: phase.row_version,
          status: phase.status,
          description: phase.description,
          deliverable: phase.deliverable,
        } as any),
      onSuccess: () => query.refetch(),
    })
    return () =>
      h('section', { class: 'project-detail-panel' }, [
        h('h2', 'Phases'),
        h(ETable, { data: query.data.value ?? [] }, () => [
          h(ETableColumn, { prop: 'name', label: 'Phase' }),
          h(ETableColumn, { prop: 'status', label: 'Status', width: 120 }),
          h(ETableColumn, { prop: 'deliverable', label: 'Deliverable' }),
          h(ETableColumn, {
            prop: 'work_item_count',
            label: 'Items',
            width: 100,
          }),
          h(
            ETableColumn,
            { label: 'Action', width: 120 },
            {
              default: ({ row }: any) =>
                h(
                  EButton,
                  {
                    size: 'small',
                    onClick: () =>
                      mutation.mutate({
                        ...row,
                        status:
                          row.status === 'active' ? 'completed' : 'active',
                      }),
                  },
                  () => 'Toggle',
                ),
            },
          ),
        ]),
      ])
  },
})

const VersionPanel = defineComponent({
  setup() {
    const selectedVersionId = ref('')
    const query = useQuery({
      queryKey: computed(() => ['projects', projectId.value, 'versions']),
      queryFn: () => projectDetailApi.versions(projectId.value),
      enabled: computed(() => Boolean(projectId.value)),
    })
    const stagesQuery = useQuery({
      queryKey: computed(() => ['projects', projectId.value, 'version-stages']),
      queryFn: () => projectDetailApi.versionStages(projectId.value),
      enabled: computed(() => Boolean(projectId.value)),
    })
    const scopeOptionsQuery = useQuery({
      queryKey: computed(() => [
        'projects',
        projectId.value,
        'version-scope-options',
      ]),
      queryFn: async () => {
        const [requirements, tasks, defects] = await Promise.all([
          projectDetailApi.workItems(projectId.value, 'requirements', {
            page: 1,
            page_size: 100,
          }),
          projectDetailApi.workItems(projectId.value, 'tasks', {
            page: 1,
            page_size: 100,
          }),
          projectDetailApi.workItems(projectId.value, 'defects', {
            page: 1,
            page_size: 100,
          }),
        ])
        return [...requirements.data, ...tasks.data, ...defects.data]
      },
      enabled: computed(() => Boolean(projectId.value)),
    })

    const createForm = reactive({
      name: '',
      stage_id: '',
      assignee_id: '',
    })
    const detailForm = reactive({
      name: '',
      stage_id: '',
      assignee_id: '',
      start_at: '',
      release_at: '',
      description: '',
      test_conclusion: '',
      risk_summary: '',
    })
    const scopeForm = reactive({ work_item_id: '' })

    const versionRows = computed(() => query.data.value ?? [])
    const stageRows = computed(() => stagesQuery.data.value ?? [])
    const editableStageRows = computed(() =>
      stageRows.value.filter((stage) => stage.type !== 'released'),
    )
    const memberOptions = computed(() =>
      (membersQuery.data.value ?? [])
        .filter((member: any) => member.active)
        .map((member: any) => member.user),
    )
    const selectedVersion = computed<ProjectVersion | undefined>(() => {
      const rows = versionRows.value
      return (
        rows.find((version) => version.id === selectedVersionId.value) ??
        rows[0]
      )
    })
    const availableScopeOptions = computed(() => {
      const version = selectedVersion.value
      if (!version) {
        return []
      }
      return (scopeOptionsQuery.data.value ?? []).filter(
        (item) => item.version_id !== version.id,
      )
    })

    watch(
      [selectedVersion, stageRows],
      ([version, stages]) => {
        const pendingStageId =
          stages.find((stage) => stage.type === 'pending')?.id ?? ''
        if (!version) {
          if (!createForm.stage_id) {
            createForm.stage_id = pendingStageId
          }
          return
        }
        selectedVersionId.value = version.id
        detailForm.name = version.name
        detailForm.stage_id = version.stage?.id ?? ''
        detailForm.assignee_id = version.assignee?.id ?? ''
        detailForm.start_at = version.start_at
        detailForm.release_at = version.release_at
        detailForm.description = version.description
        detailForm.test_conclusion = version.test_conclusion
        detailForm.risk_summary = version.risk_summary
        if (!createForm.stage_id) {
          createForm.stage_id = pendingStageId
        }
      },
      { immediate: true },
    )

    const createMutation = useMutation({
      mutationFn: () =>
        projectDetailApi.createVersion(projectId.value, {
          name: createForm.name.trim(),
          stage_id: createForm.stage_id || null,
          assignee_id: createForm.assignee_id || null,
        }),
      onSuccess: (version) => {
        selectedVersionId.value = version.id
        createForm.name = ''
        createForm.assignee_id = ''
        ElMessage.success('版本已创建')
        void query.refetch()
      },
    })
    const saveMutation = useMutation({
      mutationFn: ({
        version,
        payload,
      }: {
        version: ProjectVersion
        payload: Record<string, unknown>
      }) => projectDetailApi.updateVersion(version.id, payload as any),
      onSuccess: (version) => {
        selectedVersionId.value = version.id
        ElMessage.success('版本已保存')
        void query.refetch()
      },
    })
    const releaseMutation = useMutation({
      mutationFn: (version: ProjectVersion) =>
        projectDetailApi.releaseVersion(version.id, {
          environment: 'production',
          summary: version.risk_summary,
          row_version: version.row_version,
        }),
      onSuccess: (version) => {
        selectedVersionId.value = version.id
        ElMessage.success('版本已发布')
        void Promise.all([query.refetch(), overviewQuery.refetch()])
      },
    })
    const scopeMutation = useMutation({
      mutationFn: ({
        version,
        workItemId,
      }: {
        version: ProjectVersion
        workItemId: string
      }) =>
        projectDetailApi.addVersionScope(version.id, {
          row_version: version.row_version,
          items: [{ target_type: 'work_item', target_id: workItemId }],
        }),
      onSuccess: (version) => {
        selectedVersionId.value = version.id
        scopeForm.work_item_id = ''
        ElMessage.success('已加入版本范围')
        void Promise.all([query.refetch(), scopeOptionsQuery.refetch()])
      },
    })

    const statusLabel: Record<string, string> = {
      pending: '未开始',
      in_progress: '进行中',
      released: '已发布',
      archived: '已归档',
    }
    const statusTone: Record<string, 'info' | 'success' | 'warning'> = {
      pending: 'info',
      in_progress: 'warning',
      released: 'success',
      archived: 'info',
    }

    const renderStageOptions = (stages: ProjectVersionStage[]) =>
      stages.map((stage) =>
        h(EOption, {
          key: stage.id,
          label: stage.name,
          value: stage.id,
        }),
      )

    const renderMemberOptions = () =>
      memberOptions.value.map((user: any) =>
        h(EOption, {
          key: user.id,
          label: user.display_name,
          value: user.id,
        }),
      )

    const versionReleaseIssues = (version: ProjectVersion) => {
      const issues: string[] = []
      if (version.open_blocker_defect_count > 0) {
        issues.push(
          `${version.open_blocker_defect_count} 个阻塞/严重缺陷未关闭`,
        )
      }
      if (version.test_plan_count === 0) {
        issues.push('未关联测试计划')
      } else if (version.incomplete_test_plan_count > 0) {
        issues.push(`${version.incomplete_test_plan_count} 个测试计划未完成`)
      }
      return issues
    }

    const submitCreateVersion = () => {
      if (!createForm.name.trim()) {
        ElMessage.warning('请输入版本名称')
        return
      }
      createMutation.mutate()
    }

    const submitSaveVersion = () => {
      const version = selectedVersion.value
      if (!version) {
        return
      }
      if (!detailForm.name.trim()) {
        ElMessage.warning('请输入版本名称')
        return
      }
      saveMutation.mutate({
        version,
        payload: {
          name: detailForm.name.trim(),
          stage_id: detailForm.stage_id || null,
          assignee_id: detailForm.assignee_id || null,
          start_at: detailForm.start_at,
          release_at: detailForm.release_at,
          description: detailForm.description,
          test_conclusion: detailForm.test_conclusion,
          risk_summary: detailForm.risk_summary,
          row_version: version.row_version,
        },
      })
    }

    const submitReleaseVersion = (version: ProjectVersion) => {
      const issues = versionReleaseIssues(version)
      if (issues.length > 0) {
        ElMessage.warning(issues.join('；'))
        return
      }
      releaseMutation.mutate(version)
    }

    const submitAddScope = () => {
      const version = selectedVersion.value
      if (!version || !scopeForm.work_item_id) {
        ElMessage.warning('请选择要加入范围的工作项')
        return
      }
      scopeMutation.mutate({
        version,
        workItemId: scopeForm.work_item_id,
      })
    }

    return () =>
      h('section', { class: 'project-detail-panel version-panel' }, [
        h('div', { class: 'panel-heading' }, [
          h('div', [
            h('h2', '版本'),
            h(
              'p',
              { class: 'eyebrow' },
              '维护发布范围、阶段、质量风险和发布动作',
            ),
          ]),
          h(
            EButton,
            {
              type: 'primary',
              loading: createMutation.isPending.value,
              disabled: isProjectArchived.value,
              onClick: submitCreateVersion,
            },
            () => '新建版本',
          ),
        ]),
        h('div', { class: 'version-create-row' }, [
          h(EInput, {
            modelValue: createForm.name,
            'onUpdate:modelValue': (value: string) => (createForm.name = value),
            placeholder: '版本名称',
          }),
          h(
            ESelect,
            {
              modelValue: createForm.stage_id,
              'onUpdate:modelValue': (value: string) =>
                (createForm.stage_id = value),
              placeholder: '阶段',
            },
            () => renderStageOptions(editableStageRows.value),
          ),
          h(
            ESelect,
            {
              modelValue: createForm.assignee_id,
              'onUpdate:modelValue': (value: string) =>
                (createForm.assignee_id = value),
              clearable: true,
              placeholder: '负责人',
            },
            renderMemberOptions,
          ),
        ]),
        h('div', { class: 'version-table-wrap' }, [
          h(
            ETable,
            {
              data: versionRows.value,
              rowKey: 'id',
              highlightCurrentRow: true,
              onRowClick: (row: ProjectVersion) => {
                selectedVersionId.value = row.id
              },
            },
            () => [
              h(ETableColumn, { prop: 'name', label: '版本', minWidth: 160 }),
              h(
                ETableColumn,
                { label: '阶段', width: 120 },
                {
                  default: ({ row }: { row: ProjectVersion }) =>
                    row.stage?.name ?? '-',
                },
              ),
              h(
                ETableColumn,
                { label: '状态', width: 120 },
                {
                  default: ({ row }: { row: ProjectVersion }) =>
                    h(
                      ETag,
                      { type: statusTone[row.status] ?? 'info' },
                      () => statusLabel[row.status] ?? row.status,
                    ),
                },
              ),
              h(ETableColumn, {
                label: '负责人',
                width: 140,
                formatter: (row: ProjectVersion) =>
                  row.assignee?.display_name ?? '-',
              }),
              h(ETableColumn, {
                prop: 'scope_count',
                label: '范围',
                width: 100,
              }),
              h(
                ETableColumn,
                { label: '风险', minWidth: 180 },
                {
                  default: ({ row }: { row: ProjectVersion }) =>
                    versionReleaseIssues(row).join('；') ||
                    row.risk_summary ||
                    '-',
                },
              ),
              h(
                ETableColumn,
                { label: '操作', width: 120 },
                {
                  default: ({ row }: { row: ProjectVersion }) =>
                    h(
                      EButton,
                      {
                        size: 'small',
                        type: 'primary',
                        disabled:
                          row.status === 'released' || isProjectArchived.value,
                        onClick: (event: MouseEvent) => {
                          event.stopPropagation()
                          submitReleaseVersion(row)
                        },
                      },
                      () => '发布',
                    ),
                },
              ),
            ],
          ),
        ]),
        selectedVersion.value
          ? h('div', { class: 'version-detail' }, [
              h('div', { class: 'version-detail__heading' }, [
                h('div', [
                  h('h3', selectedVersion.value.name),
                  h(
                    'p',
                    { class: 'eyebrow' },
                    `${formatPlanRange(
                      selectedVersion.value.start_at,
                      selectedVersion.value.release_at,
                    )} · ${
                      selectedVersion.value.assignee?.display_name ?? '未分配'
                    }`,
                  ),
                ]),
                h(
                  ETag,
                  { type: statusTone[selectedVersion.value.status] ?? 'info' },
                  () =>
                    statusLabel[selectedVersion.value?.status ?? ''] ??
                    selectedVersion.value?.status,
                ),
              ]),
              h('div', { class: 'version-metrics' }, [
                h('div', [
                  h('strong', String(selectedVersion.value.scope_count)),
                  h('span', '范围项'),
                ]),
                h('div', [
                  h('strong', String(selectedVersion.value.test_plan_count)),
                  h('span', '测试计划'),
                ]),
                h('div', [
                  h(
                    'strong',
                    String(selectedVersion.value.incomplete_test_plan_count),
                  ),
                  h('span', '未完成计划'),
                ]),
                h('div', [
                  h(
                    'strong',
                    String(selectedVersion.value.open_blocker_defect_count),
                  ),
                  h('span', '阻塞缺陷'),
                ]),
              ]),
              h('div', { class: 'version-detail-form' }, [
                h(EInput, {
                  modelValue: detailForm.name,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.name = value),
                  placeholder: '版本名称',
                }),
                h(
                  ESelect,
                  {
                    modelValue: detailForm.stage_id,
                    'onUpdate:modelValue': (value: string) =>
                      (detailForm.stage_id = value),
                    placeholder: '阶段',
                  },
                  () => renderStageOptions(editableStageRows.value),
                ),
                h(
                  ESelect,
                  {
                    modelValue: detailForm.assignee_id,
                    'onUpdate:modelValue': (value: string) =>
                      (detailForm.assignee_id = value),
                    clearable: true,
                    placeholder: '负责人',
                  },
                  renderMemberOptions,
                ),
                h(EInput, {
                  modelValue: detailForm.start_at,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.start_at = value),
                  placeholder: '开始日期 YYYY-MM-DD',
                }),
                h(EInput, {
                  modelValue: detailForm.release_at,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.release_at = value),
                  placeholder: '计划发布时间',
                }),
                h(EInput, {
                  modelValue: detailForm.description,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.description = value),
                  placeholder: '版本描述',
                }),
                h(EInput, {
                  modelValue: detailForm.test_conclusion,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.test_conclusion = value),
                  placeholder: '测试结论',
                }),
                h(EInput, {
                  modelValue: detailForm.risk_summary,
                  'onUpdate:modelValue': (value: string) =>
                    (detailForm.risk_summary = value),
                  placeholder: '风险说明',
                }),
                h(
                  EButton,
                  {
                    type: 'primary',
                    loading: saveMutation.isPending.value,
                    disabled: isProjectArchived.value,
                    onClick: submitSaveVersion,
                  },
                  () => '保存详情',
                ),
              ]),
              h('div', { class: 'version-scope-row' }, [
                h(
                  ESelect,
                  {
                    modelValue: scopeForm.work_item_id,
                    'onUpdate:modelValue': (value: string) =>
                      (scopeForm.work_item_id = value),
                    filterable: true,
                    clearable: true,
                    placeholder: '选择工作项加入版本范围',
                  },
                  () =>
                    availableScopeOptions.value.map((item: WorkItemSummary) =>
                      h(EOption, {
                        key: item.id,
                        label: `${item.number} ${item.title}`,
                        value: item.id,
                      }),
                    ),
                ),
                h(
                  EButton,
                  {
                    loading: scopeMutation.isPending.value,
                    disabled: isProjectArchived.value,
                    onClick: submitAddScope,
                  },
                  () => '加入范围',
                ),
              ]),
            ])
          : h('p', { class: 'eyebrow' }, '暂无版本'),
      ])
  },
})

const TestPanel = defineComponent({
  setup() {
    const boardQuery = useQuery({
      queryKey: computed(() => ['projects', projectId.value, 'tests']),
      queryFn: () => projectDetailApi.testBoard(projectId.value),
    })
    const selectedRunId = ref('')
    const runQuery = useQuery({
      queryKey: computed(() => [
        'projects',
        projectId.value,
        'test-runs',
        selectedRunId.value,
      ]),
      queryFn: () =>
        projectDetailApi.testRun(projectId.value, selectedRunId.value),
      enabled: computed(() => Boolean(selectedRunId.value)),
    })
    const stepMutation = useMutation({
      mutationFn: ({
        runId,
        stepId,
        status,
      }: {
        runId: string
        stepId: string
        status: string
      }) =>
        projectDetailApi.updateTestRunStep(runId, stepId, {
          status,
          actual_result: status === 'passed' ? 'passed' : 'failed',
        } as any),
      onSuccess: () => runQuery.refetch(),
    })
    const defectMutation = useMutation({
      mutationFn: (runId: string) =>
        projectDetailApi.createOrLinkRunDefect(runId, {
          mode: 'create',
          payload: {
            project_id: projectId.value,
            type: 'bug',
            title: 'Created from test failure',
            description: '<p>Auto created from test failure</p>',
            priority: 'high',
            severity: 'major',
            bug_detail: {
              bug_type: 'functional',
              environment: '',
              reproduce_steps: 'Auto created from failed test run',
              expected_result: '',
              actual_result: '',
              source_test_run_id: runId,
              source_test_plan_id: runQuery.data.value?.plan_id ?? null,
              regression_test_run_id: null,
              fix_summary: '',
              reopened_count: 0,
            },
          },
        } as any),
      onSuccess: () => runQuery.refetch(),
    })
    return () =>
      h('section', { class: 'project-detail-panel' }, [
        h('h2', 'Testing'),
        h(ETable, { data: boardQuery.data.value?.plans ?? [] }, () => [
          h(ETableColumn, { prop: 'name', label: 'Plan' }),
          h(ETableColumn, { prop: 'status', label: 'Status', width: 120 }),
          h(
            ETableColumn,
            { label: 'Runs', width: 160 },
            { default: ({ row }: any) => `${row.run_passed}/${row.run_total}` },
          ),
          h(ETableColumn, { prop: 'scope', label: 'Scope' }),
        ]),
        h(
          ETable,
          {
            data: boardQuery.data.value?.runs ?? [],
            onRowClick: (row: ProjectTestRun) => (selectedRunId.value = row.id),
          },
          () => [
            h(ETableColumn, { prop: 'title', label: 'Run' }),
            h(ETableColumn, { prop: 'status', label: 'Status', width: 120 }),
            h(
              ETableColumn,
              { label: 'Executor', width: 140 },
              { default: ({ row }: any) => row.executor?.display_name ?? '-' },
            ),
          ],
        ),
        runQuery.data.value
          ? h('div', { class: 'test-run-detail' }, [
              h('div', { class: 'panel-heading' }, [
                h('h3', runQuery.data.value.title),
                h(
                  EButton,
                  {
                    type: 'danger',
                    onClick: () =>
                      defectMutation.mutate(runQuery.data.value!.id),
                  },
                  () => 'Create Defect',
                ),
              ]),
              h(ETable, { data: runQuery.data.value.steps }, () => [
                h(ETableColumn, { prop: 'step_order', label: '#', width: 60 }),
                h(ETableColumn, { prop: 'action', label: 'Action' }),
                h(ETableColumn, { prop: 'expected_result', label: 'Expected' }),
                h(ETableColumn, {
                  prop: 'status',
                  label: 'Status',
                  width: 120,
                }),
                h(
                  ETableColumn,
                  { label: 'Action', width: 180 },
                  {
                    default: ({ row }: any) => [
                      h(
                        EButton,
                        {
                          size: 'small',
                          onClick: () =>
                            stepMutation.mutate({
                              runId: runQuery.data.value!.id,
                              stepId: row.id,
                              status: 'passed',
                            }),
                        },
                        () => 'Pass',
                      ),
                      h(
                        EButton,
                        {
                          size: 'small',
                          type: 'danger',
                          onClick: () =>
                            stepMutation.mutate({
                              runId: runQuery.data.value!.id,
                              stepId: row.id,
                              status: 'failed',
                            }),
                        },
                        () => 'Fail',
                      ),
                    ],
                  },
                ),
              ]),
            ])
          : null,
      ])
  },
})

const MemberPanel = defineComponent({
  setup() {
    const userID = ref('')
    const roleKey = ref('developer')
    const usersQuery = useQuery({
      queryKey: ['users', 'enabled'],
      queryFn: () => projectDetailApi.users({ status: 'enabled' }),
    })
    const mutation = useMutation({
      mutationFn: () =>
        projectDetailApi.saveProjectMember(projectId.value, {
          user_id: userID.value,
          role_key: roleKey.value,
        } as any),
      onSuccess: () => {
        userID.value = ''
        return membersQuery.refetch()
      },
    })
    const removeMutation = useMutation({
      mutationFn: (memberId: string) =>
        projectDetailApi.removeProjectMember(projectId.value, memberId),
      onSuccess: () => membersQuery.refetch(),
    })
    const removeMember = async (member: any) => {
      try {
        await ElMessageBox.confirm(
          `确定将 ${member.user.display_name} 移出项目吗？`,
          '移除成员',
          {
            type: 'warning',
            confirmButtonText: '移除',
            cancelButtonText: '取消',
          },
        )
        removeMutation.mutate(member.id)
      } catch {
        // user cancelled
      }
    }
    return () =>
      h('section', { class: 'project-detail-panel' }, [
        h('div', { class: 'panel-heading' }, [
          h('h2', 'Members'),
          h(
            EButton,
            {
              type: 'primary',
              disabled: !userID.value,
              onClick: () => mutation.mutate(),
            },
            () => 'Save',
          ),
        ]),
        h('div', { class: 'inline-form' }, [
          h(
            ESelect,
            {
              modelValue: userID.value,
              'onUpdate:modelValue': (v: string) => (userID.value = v),
              placeholder: 'Select member',
            },
            () =>
              (usersQuery.data.value ?? []).map((user: any) =>
                h(EOption, {
                  label: user.display_name,
                  value: user.id,
                }),
              ),
          ),
          h(
            ESelect,
            {
              modelValue: roleKey.value,
              'onUpdate:modelValue': (v: string) => (roleKey.value = v),
              placeholder: 'Role',
            },
            () => [
              h(EOption, { label: 'Project Owner', value: 'project_owner' }),
              h(EOption, {
                label: 'Product Manager',
                value: 'product_manager',
              }),
              h(EOption, { label: 'Developer', value: 'developer' }),
              h(EOption, { label: 'Tester', value: 'tester' }),
              h(EOption, { label: 'Viewer', value: 'viewer' }),
            ],
          ),
        ]),
        h(ETable, { data: membersQuery.data.value ?? [] }, () => [
          h(
            ETableColumn,
            { label: 'Member', minWidth: 160 },
            { default: ({ row }: any) => row.user.display_name },
          ),
          h(ETableColumn, { prop: 'role_name', label: 'Role', width: 140 }),
          h(ETableColumn, {
            prop: 'requirement_count',
            label: 'Req',
            width: 90,
          }),
          h(ETableColumn, { prop: 'task_count', label: 'Task', width: 90 }),
          h(ETableColumn, { prop: 'defect_count', label: 'Bug', width: 90 }),
          h(ETableColumn, { prop: 'test_run_count', label: 'Test', width: 90 }),
          h(
            ETableColumn,
            { label: 'Actions', width: 110, fixed: 'right' },
            {
              default: ({ row }: any) =>
                h(
                  EButton,
                  {
                    link: true,
                    type: 'danger',
                    loading: removeMutation.isPending.value,
                    onClick: () => void removeMember(row),
                  },
                  () => 'Remove',
                ),
            },
          ),
        ]),
      ])
  },
})

const ActivityTimeline = defineComponent({
  props: {
    events: { type: Array as PropType<ProjectActivityEvent[]>, required: true },
  },
  setup(props) {
    return () =>
      h('section', [
        h('h2', 'Recent Activity'),
        h(ETimeline, () =>
          props.events.map((event) =>
            h(
              ETimelineItem,
              { timestamp: event.timeText },
              () => `${event.actor} ${event.content}`,
            ),
          ),
        ),
      ])
  },
})

const ConfigurationPanel = defineComponent({
  setup() {
    const query = useQuery({
      queryKey: computed(() => ['projects', projectId.value, 'configuration']),
      queryFn: () => projectDetailApi.configuration(projectId.value),
    })
    return () =>
      h('section', { class: 'project-detail-panel' }, [
        h('h2', 'Project Configuration Snapshot'),
        h(ETable, { data: query.data.value?.project_type.tabs ?? [] }, () => [
          h(ETableColumn, { prop: 'name', label: 'Tab' }),
          h(ETableColumn, { prop: 'module_key', label: 'Module' }),
          h(ETableColumn, { prop: 'sort_order', label: 'Order', width: 100 }),
        ]),
        h('h3', 'Workflows'),
        h(ETable, { data: query.data.value?.workflows ?? [] }, () => [
          h(ETableColumn, { prop: 'name', label: 'Name' }),
          h(ETableColumn, { prop: 'target_type', label: 'Target', width: 120 }),
          h(
            ETableColumn,
            { label: 'States', width: 100 },
            { default: ({ row }: any) => row.states.length },
          ),
          h(
            ETableColumn,
            { label: 'Transitions', width: 100 },
            { default: ({ row }: any) => row.transitions.length },
          ),
        ]),
      ])
  },
})

onMounted(() => {
  document.title = '项目详情 · 项目协作工作台'
})
</script>
<style scoped>
.project-detail-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  max-width: 1520px;
  margin: 0 auto;
}

.project-detail-content {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.requirement-editor-shell {
  display: grid;
  gap: 16px;
  width: 100%;
}

.project-detail-header,
.project-tabs,
.project-detail-panel {
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.project-detail-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
}

.project-detail-header h1,
.project-detail-header p {
  margin: 0;
}

.project-detail-header h1 {
  margin-top: 6px;
  font-size: var(--font-size-title);
}

.project-detail-header__breadcrumb,
.project-detail-header__meta {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

.project-detail-header__meta,
.project-detail-header__actions,
.panel-actions,
.inline-form,
.transition-bar,
.detail-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
}

.project-edit-date-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-1);
}

.project-tabs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1);
}

.project-tabs__item {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 var(--space-2);
  color: var(--color-text-secondary);
  text-decoration: none;
  background: transparent;
  border: 0;
  border-radius: var(--radius-md);
}

.project-tabs__item.router-link-active {
  color: var(--color-primary);
  background: var(--color-primary-subtle);
}

.project-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
}

.project-detail-panel {
  min-width: 0;
  padding: var(--space-3);
}

.work-item-list-panel {
  display: grid;
  gap: 16px;
  overflow: hidden;
}

.work-item-list-panel__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  min-width: 0;
}

.work-item-list-panel__toolbar h2 {
  flex: none;
}

.work-item-list-panel__filters {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 320px;
}

.work-item-list-panel__filters :deep(.el-input) {
  width: 260px;
  max-width: 100%;
}

.work-item-list-panel__filters :deep(.el-select) {
  width: 180px;
}

.work-item-list-panel__table-wrap {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.work-item-list-panel__table-wrap :deep(.el-table) {
  width: 100%;
  max-width: 100%;
}

.work-item-list-panel__table-wrap :deep(.el-table__inner-wrapper),
.work-item-list-panel__table-wrap :deep(.el-table__body-wrapper),
.work-item-list-panel__table-wrap :deep(.el-scrollbar) {
  max-width: 100%;
}

.project-detail-panel--wide {
  grid-column: span 2;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.project-detail-panel h2,
.project-detail-panel h3,
.project-detail-panel p {
  margin: 0;
}

.project-detail-panel h2 {
  font-size: var(--font-size-title-sm);
}

.project-detail-panel h3 {
  margin-top: var(--space-3);
  margin-bottom: var(--space-1);
  font-size: var(--font-size-body-lg);
}

.sprint-panel {
  display: grid;
  gap: 16px;
  overflow: hidden;
}

.sprint-status-summary,
.sprint-create-row,
.sprint-category-row,
.sprint-detail__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.sprint-create-row :deep(.el-input) {
  width: 220px;
  max-width: 100%;
}

.sprint-create-row :deep(.el-select),
.sprint-category-row :deep(.el-input) {
  width: 180px;
  max-width: 100%;
}

.sprint-table-wrap {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
}

.sprint-detail {
  display: grid;
  gap: 16px;
  padding-top: 4px;
  border-top: 1px solid rgba(40, 70, 100, 0.1);
}

.sprint-detail__heading {
  justify-content: space-between;
}

.sprint-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
}

.sprint-metrics > div {
  display: grid;
  gap: 2px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(40, 70, 100, 0.1);
}

.sprint-metrics strong {
  font-size: var(--font-size-body-lg);
}

.sprint-metrics span,
.sprint-report p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

.sprint-detail-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 8px;
}

.sprint-report {
  display: grid;
  gap: 6px;
}

.version-panel {
  display: grid;
  gap: 16px;
  overflow: hidden;
}

.version-create-row,
.version-detail__heading,
.version-scope-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.version-create-row :deep(.el-input),
.version-create-row :deep(.el-select),
.version-scope-row :deep(.el-select) {
  width: 240px;
  max-width: 100%;
}

.version-table-wrap {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
}

.version-detail {
  display: grid;
  gap: 16px;
  padding-top: 4px;
  border-top: 1px solid rgba(40, 70, 100, 0.1);
}

.version-detail__heading {
  justify-content: space-between;
}

.version-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
}

.version-metrics > div {
  display: grid;
  gap: 2px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(40, 70, 100, 0.1);
}

.version-metrics strong {
  font-size: var(--font-size-body-lg);
}

.version-metrics span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

.version-detail-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 8px;
}

.eyebrow {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

.detail-summary,
.transition-bar,
.inline-form,
.comment-list,
.test-run-detail {
  margin-bottom: var(--space-2);
}

.transition-bar {
  padding: 12px 0 4px;
}

.transition-bar :deep(.el-input) {
  min-width: 260px;
  flex: 1;
}

.comment-list {
  display: grid;
  gap: 8px;
}

.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid rgba(40, 70, 100, 0.1);
}

.comment-item span {
  margin-left: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

@media (max-width: 960px) {
  .project-detail-header,
  .panel-heading {
    flex-direction: column;
  }

  .project-overview-grid {
    grid-template-columns: 1fr;
  }

  .sprint-metrics,
  .sprint-detail-form,
  .version-metrics,
  .version-detail-form {
    grid-template-columns: 1fr;
  }

  .project-detail-panel--wide {
    grid-column: auto;
  }
}
</style>
