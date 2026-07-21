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
      <header class="project-detail-header">
        <div>
          <p class="project-detail-header__breadcrumb">项目管理 / 项目详情</p>
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
          <EButton @click="openCreateWorkItem('story')">新建需求</EButton>
          <EButton @click="openCreateWorkItem('task')">新建任务</EButton>
          <EButton type="primary" @click="openCreateWorkItem('bug')">
            新建缺陷
          </EButton>
        </div>
      </header>

      <nav class="project-tabs" aria-label="项目导航">
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
        <WorkItemDetailPanel v-if="workItemId" />

        <section
          v-else-if="section === 'overview'"
          class="project-overview-grid"
        >
          <SummaryCard
            label="项目健康度"
            :value="overview?.health ?? '--'"
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

      <EDialog v-model="createDialogVisible" title="创建工作项" width="760px">
        <EForm label-width="96px">
          <EFormItem label="类型">
            <ESelect v-model="workItemForm.type">
              <EOption label="Epic" value="epic" />
              <EOption label="Feature" value="feature" />
              <EOption label="Story" value="story" />
              <EOption label="Task" value="task" />
              <EOption label="Bug" value="bug" />
            </ESelect>
          </EFormItem>
          <EFormItem label="标题">
            <EInput v-model="workItemForm.title" />
          </EFormItem>
          <EFormItem label="负责人">
            <ESelect v-model="workItemForm.assignee_id" clearable>
              <EOption
                v-for="member in membersQuery.data.value ?? []"
                :key="member.user.id"
                :label="member.user.display_name"
                :value="member.user.id"
              />
            </ESelect>
          </EFormItem>
          <EFormItem label="描述">
            <RichTextEditor v-model="workItemForm.description" />
          </EFormItem>
          <EFormItem label="验收标准">
            <RichTextEditor v-model="workItemForm.acceptance" />
          </EFormItem>
        </EForm>
        <template #footer>
          <EButton @click="createDialogVisible = false">取消</EButton>
          <EButton
            type="primary"
            :loading="createWorkItemMutation.isPending.value"
            @click="submitWorkItem"
          >
            创建
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
} from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  AppButton,
  AsyncPageSkeleton,
  EmptyState,
  PageError,
  StatusTag,
  SummaryCard,
} from '@/shared/components'
import type {
  ProjectActivityEvent,
  ProjectPhase,
  ProjectTestRun,
  ProjectVersion,
  WorkItem,
  WorkItemCreatePayload,
  WorkItemSummary,
} from '../model/project-detail.types'
import RichTextEditor from '../components/RichTextEditor.vue'
import { projectDetailApi } from '../api/project-detail.api'
import {
  useProjectNavigation,
  useProjectOverview,
} from '../api/project.queries'
import { healthLabel, healthTone, methodLabel } from '../model/project-labels'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const EButton = ElButton as any
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

const navigationQuery = useProjectNavigation(projectId)
const overviewQuery = useProjectOverview(projectId)
const navigation = computed(() => navigationQuery.data.value)
const overview = computed(() => overviewQuery.data.value)

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

const createDialogVisible = ref(false)
type WorkItemForm = WorkItemCreatePayload & {
  title: string
  description: string
  acceptance: string
}

const workItemForm = reactive<WorkItemForm>({
  project_id: projectId.value,
  type: 'story',
  title: '',
  description: '<p></p>',
  acceptance: '<p></p>',
  priority: 'medium',
  severity: '',
  story_points: 0,
  estimated_hours: 0,
  remaining_hours: 0,
})

const createWorkItemMutation = useMutation({
  mutationFn: (payload: WorkItemCreatePayload) =>
    projectDetailApi.createWorkItem(payload),
  onSuccess: async (item) => {
    createDialogVisible.value = false
    await queryClient.invalidateQueries({ queryKey: ['projects'] })
    await router.push(`/projects/${projectId.value}/work-items/${item.id}`)
  },
})

function openCreateWorkItem(type: string) {
  Object.assign(workItemForm, {
    project_id: projectId.value,
    type,
    title: '',
    description: '<p></p>',
    acceptance: '<p></p>',
    priority: type === 'bug' ? 'high' : 'medium',
    severity: type === 'bug' ? 'major' : '',
    story_points: 0,
    estimated_hours: 0,
    remaining_hours: 0,
    assignee_id: undefined,
  })
  createDialogVisible.value = true
}

function submitWorkItem() {
  if (!workItemForm.title.trim()) {
    ElMessage.warning('Please enter a title')
    return
  }
  createWorkItemMutation.mutate({ ...workItemForm })
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
        ? 'Tasks'
        : props.kind === 'defects'
          ? 'Defects'
          : 'Requirements',
    )
    return () =>
      h('section', { class: 'project-detail-panel' }, [
        h('div', { class: 'panel-heading' }, [
          h('h2', title.value),
          h('div', { class: 'panel-actions' }, [
            h(EInput, {
              modelValue: keyword.value,
              'onUpdate:modelValue': (v: string) => (keyword.value = v),
              placeholder: 'Search',
            }),
            h(
              ESelect,
              {
                modelValue: status.value,
                'onUpdate:modelValue': (v: string) => (status.value = v),
                placeholder: 'Status',
                clearable: true,
              },
              () => [
                h(EOption, {
                  label: 'Open',
                  value:
                    props.kind === 'defects'
                      ? 'new'
                      : props.kind === 'tasks'
                        ? 'todo'
                        : 'draft',
                }),
                h(EOption, {
                  label: 'Active',
                  value:
                    props.kind === 'defects'
                      ? 'triaged'
                      : props.kind === 'tasks'
                        ? 'doing'
                        : 'reviewing',
                }),
                h(EOption, {
                  label: 'Done',
                  value:
                    props.kind === 'defects'
                      ? 'verified'
                      : props.kind === 'tasks'
                        ? 'done'
                        : 'accepted',
                }),
              ],
            ),
          ]),
        ]),
        h(
          ETable,
          {
            data: query.data.value?.data ?? [],
            stripe: true,
            onRowClick: (row: WorkItemSummary) =>
              router.push(`/projects/${projectId.value}/work-items/${row.id}`),
          },
          () => [
            h(ETableColumn, { prop: 'number', label: 'Number', width: 160 }),
            h(ETableColumn, { prop: 'title', label: 'Title', minWidth: 260 }),
            h(
              ETableColumn,
              { label: 'Status', width: 140 },
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
              label: 'Priority',
              width: 100,
            }),
            h(
              ETableColumn,
              { label: 'Assignee', width: 140 },
              { default: ({ row }: any) => row.assignee?.display_name ?? '-' },
            ),
          ],
        ),
      ])
  },
})

const WorkItemDetailPanel = defineComponent({
  setup() {
    const activeTab = ref('detail')
    const comment = ref('')
    const transitionComment = ref('')
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
      priority: 'medium',
      severity: '',
      story_points: 0,
      estimated_hours: 0,
      remaining_hours: 0,
    })
    const saveMutation = useMutation({
      mutationFn: (item: WorkItem) =>
        projectDetailApi.updateWorkItem(item.id, {
          project_id: item.project_id,
          type: item.type,
          title: draft.title,
          description: draft.description,
          acceptance: draft.acceptance,
          priority: draft.priority,
          severity: draft.severity,
          story_points: draft.story_points,
          estimated_hours: draft.estimated_hours,
          remaining_hours: draft.remaining_hours,
          row_version: item.row_version,
        }),
      onSuccess: () => query.refetch(),
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
    return () => {
      const item = query.data.value
      if (!item) return h(AsyncPageSkeleton)
      Object.assign(draft, {
        title: item.title,
        description: item.description,
        acceptance: item.acceptance,
        priority: item.priority,
        severity: item.severity,
        story_points: item.story_points,
        estimated_hours: item.estimated_hours,
        remaining_hours: item.remaining_hours,
      })
      return h('section', { class: 'project-detail-panel' }, [
        h('div', { class: 'panel-heading' }, [
          h('div', [
            h('p', { class: 'eyebrow' }, item.number),
            h('h2', item.title),
          ]),
          h(
            AppButton,
            {
              plain: true,
              onClick: () =>
                router.push(`/projects/${projectId.value}/${section.value}`),
            },
            () => 'Back',
          ),
        ]),
        h('div', { class: 'detail-summary' }, [
          h(
            ETag,
            { color: item.status_color, effect: 'dark' },
            () => item.status_name,
          ),
          h('span', `Type: ${item.type}`),
          h('span', `Priority: ${item.priority}`),
        ]),
        h('div', { class: 'transition-bar' }, [
          h(EInput, {
            modelValue: transitionComment.value,
            'onUpdate:modelValue': (v: string) => (transitionComment.value = v),
            placeholder: 'Transition comment',
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
            h(ETabPane, { label: 'Detail', name: 'detail' }, () =>
              h(EForm, { labelWidth: '96px' }, () => [
                h(EFormItem, { label: 'Title' }, () =>
                  h(EInput, {
                    modelValue: draft.title,
                    'onUpdate:modelValue': (v: string) => (draft.title = v),
                  }),
                ),
                h(EFormItem, { label: 'Description' }, () =>
                  h(RichTextEditor, {
                    modelValue: draft.description,
                    'onUpdate:modelValue': (v: string) =>
                      (draft.description = v),
                  }),
                ),
                h(EFormItem, { label: 'Acceptance' }, () =>
                  h(RichTextEditor, {
                    modelValue: draft.acceptance,
                    'onUpdate:modelValue': (v: string) =>
                      (draft.acceptance = v),
                  }),
                ),
                h(EFormItem, () =>
                  h(
                    EButton,
                    {
                      type: 'primary',
                      onClick: () => saveMutation.mutate(item),
                    },
                    () => 'Save',
                  ),
                ),
              ]),
            ),
            h(ETabPane, { label: 'Comments', name: 'comments' }, () => [
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
                'onUpdate:modelValue': (v: string) => (comment.value = v),
              }),
              h(
                EButton,
                {
                  type: 'primary',
                  onClick: () => commentMutation.mutate(item),
                },
                () => 'Post Comment',
              ),
            ]),
            h(ETabPane, { label: 'Dev', name: 'dev' }, () => [
              h(ETable, { data: item.dev_records }, () => [
                h(ETableColumn, {
                  prop: 'record_type',
                  label: 'Type',
                  width: 120,
                }),
                h(ETableColumn, { prop: 'title', label: 'Title' }),
                h(ETableColumn, {
                  prop: 'status',
                  label: 'Status',
                  width: 120,
                }),
                h(ETableColumn, { prop: 'summary', label: 'Summary' }),
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
                  'onUpdate:modelValue': (v: string) => (devRecord.title = v),
                  placeholder: 'Title',
                }),
                h(
                  EButton,
                  { type: 'primary', onClick: () => devMutation.mutate(item) },
                  () => 'Add',
                ),
              ]),
            ]),
            h(ETabPane, { label: 'Tests', name: 'tests' }, () =>
              h(ETable, { data: item.test_runs }, () => [
                h(ETableColumn, { prop: 'title', label: 'Run' }),
                h(ETableColumn, {
                  prop: 'status',
                  label: 'Status',
                  width: 120,
                }),
                h(
                  ETableColumn,
                  { label: 'Executor', width: 140 },
                  {
                    default: ({ row }: any) =>
                      row.executor?.display_name ?? '-',
                  },
                ),
              ]),
            ),
            h(ETabPane, { label: 'History', name: 'history' }, () =>
              h(ETimeline, () =>
                item.history.map((entry) =>
                  h(
                    ETimelineItem,
                    { timestamp: entry.created_at },
                    () => `${entry.actor.display_name} ${entry.summary}`,
                  ),
                ),
              ),
            ),
          ],
        ),
      ])
    }
  },
})

const SprintPanel = defineComponent({
  setup() {
    const query = useQuery({
      queryKey: computed(() => ['projects', projectId.value, 'sprints']),
      queryFn: () => projectDetailApi.sprints(projectId.value),
    })
    const form = reactive({ name: '', goal: '', status: 'planned' })
    const mutation = useMutation({
      mutationFn: () =>
        projectDetailApi.createSprint(projectId.value, form as any),
      onSuccess: () => query.refetch(),
    })
    return () =>
      h('section', { class: 'project-detail-panel' }, [
        h('div', { class: 'panel-heading' }, [
          h('h2', 'Sprints'),
          h(
            EButton,
            { type: 'primary', onClick: () => mutation.mutate() },
            () => 'Create',
          ),
        ]),
        h(EInput, {
          modelValue: form.name,
          'onUpdate:modelValue': (v: string) => (form.name = v),
          placeholder: 'Name',
        }),
        h(ETable, { data: query.data.value ?? [] }, () => [
          h(ETableColumn, { prop: 'name', label: 'Sprint' }),
          h(ETableColumn, { prop: 'goal', label: 'Goal' }),
          h(ETableColumn, { prop: 'status', label: 'Status', width: 120 }),
          h(
            ETableColumn,
            { label: 'Progress', width: 160 },
            {
              default: ({ row }: any) =>
                `${row.completed_work_items}/${row.total_work_items}`,
            },
          ),
        ]),
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
    const query = useQuery({
      queryKey: computed(() => ['projects', projectId.value, 'versions']),
      queryFn: () => projectDetailApi.versions(projectId.value),
    })
    const form = reactive({
      name: '',
      status: 'planning',
      description: '',
      test_conclusion: '',
      risk_summary: '',
    })
    const createMutation = useMutation({
      mutationFn: () =>
        projectDetailApi.createVersion(projectId.value, form as any),
      onSuccess: () => query.refetch(),
    })
    const releaseMutation = useMutation({
      mutationFn: (version: ProjectVersion) =>
        projectDetailApi.releaseVersion(version.id, {
          environment: 'production',
          summary: version.risk_summary,
          row_version: version.row_version,
        } as any),
      onSuccess: () => query.refetch(),
    })
    return () =>
      h('section', { class: 'project-detail-panel' }, [
        h('div', { class: 'panel-heading' }, [
          h('h2', 'Versions'),
          h(
            EButton,
            { type: 'primary', onClick: () => createMutation.mutate() },
            () => 'Create',
          ),
        ]),
        h(EInput, {
          modelValue: form.name,
          'onUpdate:modelValue': (v: string) => (form.name = v),
          placeholder: 'Name',
        }),
        h(ETable, { data: query.data.value ?? [] }, () => [
          h(ETableColumn, { prop: 'name', label: 'Version' }),
          h(ETableColumn, { prop: 'status', label: 'Status', width: 120 }),
          h(ETableColumn, { prop: 'scope_count', label: 'Scope', width: 100 }),
          h(ETableColumn, {
            prop: 'test_conclusion',
            label: 'Test Conclusion',
          }),
          h(ETableColumn, { prop: 'risk_summary', label: 'Risk' }),
          h(
            ETableColumn,
            { label: 'Action', width: 120 },
            {
              default: ({ row }: any) =>
                h(
                  EButton,
                  {
                    size: 'small',
                    type: 'primary',
                    disabled: row.status === 'released',
                    onClick: () => releaseMutation.mutate(row),
                  },
                  () => 'Release',
                ),
            },
          ),
        ]),
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
  padding: var(--space-3);
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

.comment-item {
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
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

  .project-detail-panel--wide {
    grid-column: auto;
  }
}
</style>
