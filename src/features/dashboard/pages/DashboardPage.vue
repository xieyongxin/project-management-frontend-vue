<template>
  <section class="workspace-page" aria-label="工作台">
    <PageHeader
      title="工作台"
      breadcrumb="工作台"
      description="聚焦我的待办、待验收、测试执行、缺陷回归与最近动态。"
    />

    <div class="workspace-summary-grid">
      <SummaryCard
        v-for="card in summaryCards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :description="card.description"
        :tone="cardToneMap[card.tone]"
      >
        <template #icon>
          <ElIcon><component :is="cardIconMap[card.tone]" /></ElIcon>
        </template>
      </SummaryCard>
    </div>

    <div class="workspace-main-grid">
      <section class="workspace-panel" aria-labelledby="my-todo-title">
        <div class="workspace-panel__header">
          <div>
            <h2 id="my-todo-title">我的待办</h2>
            <p>按逾期、今日到期、高优先级和最近更新排序。</p>
          </div>
          <ElSegmented v-model="activeTodoType" :options="todoTypeOptions" />
        </div>

        <AsyncPageSkeleton v-if="todosQuery.isLoading.value" />
        <PageError
          v-else-if="todosQuery.isError.value"
          title="待办加载失败"
          description="请检查网络或稍后重试。"
          @retry="() => todosQuery.refetch()"
        />
        <EmptyState
          v-else-if="todos.length === 0"
          title="暂无待处理事项"
          description="当前筛选下没有待办。"
        >
          <template #icon>
            <ElIcon><Finished /></ElIcon>
          </template>
        </EmptyState>
        <ul v-else class="todo-list">
          <li v-for="todo in todos" :key="todo.id" class="todo-list__item">
            <span class="todo-list__type" :class="`is-${todo.type}`">
              {{ todoTypeLabel[todo.type] }}
            </span>
            <div class="todo-list__content">
              <p>{{ todo.title }}</p>
              <span>{{ todo.projectName }} · {{ todo.summary }}</span>
            </div>
            <StatusTag
              :label="todo.priority"
              :tone="todo.priority === '高' ? 'danger' : 'warning'"
            />
            <span class="todo-list__date">{{ todo.dueText }}</span>
            <StatusTag :label="todo.status" tone="primary" />
          </li>
        </ul>
      </section>

      <section class="workspace-panel" aria-labelledby="recent-activity-title">
        <div class="workspace-panel__header">
          <div>
            <h2 id="recent-activity-title">最近活动</h2>
            <p>通知与流程流转按时间线混合展示。</p>
          </div>
        </div>

        <AsyncPageSkeleton v-if="activityQuery.isLoading.value" />
        <PageError
          v-else-if="activityQuery.isError.value"
          title="活动加载失败"
          description="最近活动暂时不可用。"
          @retry="() => activityQuery.refetch()"
        />
        <EmptyState
          v-else-if="activityEvents.length === 0"
          title="暂无新动态"
          description="项目和工作项变化会显示在这里。"
        />
        <ElTimeline v-else class="activity-timeline">
          <ElTimelineItem
            v-for="event in activityEvents"
            :key="event.id"
            :timestamp="event.timeText"
            :type="activityToneMap[event.tone]"
          >
            <p class="activity-timeline__content">
              <strong>{{ event.actor }}</strong>
              {{ event.content }}
            </p>
          </ElTimelineItem>
        </ElTimeline>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Bell,
  CircleCheck,
  Finished,
  Histogram,
  List,
  Tools,
  Warning,
} from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import {
  AsyncPageSkeleton,
  EmptyState,
  PageError,
  PageHeader,
  StatusTag,
  SummaryCard,
} from '@/shared/components'
import {
  useMyTodos,
  useRecentActivity,
  useWorkspaceSummary,
} from '../api/workspace.queries'
import type { WorkspaceTodoItem } from '../model/workspace.types'

const activeTodoType = ref('all')
const summaryQuery = useWorkspaceSummary()
const todosQuery = useMyTodos(activeTodoType)
const activityQuery = useRecentActivity()

const todoTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '需求', value: 'requirement' },
  { label: '任务', value: 'task' },
  { label: '测试', value: 'test' },
  { label: '缺陷', value: 'defect' },
] as const

const cardToneMap = {
  primary: 'primary',
  requirement: 'purple',
  task: 'primary',
  test: 'info',
  defect: 'danger',
  danger: 'danger',
} as const

const cardIconMap = {
  primary: Histogram,
  requirement: List,
  task: Tools,
  test: CircleCheck,
  defect: Bell,
  danger: Warning,
} as const

const todoTypeLabel: Record<WorkspaceTodoItem['type'], string> = {
  requirement: '需求',
  task: '任务',
  test: '测试',
  defect: '缺陷',
}

const activityToneMap = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
} as const

const summaryCards = computed(() => summaryQuery.data.value?.cards ?? [])
const todos = computed(() => todosQuery.data.value ?? [])
const activityEvents = computed(() => activityQuery.data.value ?? [])

onMounted(() => {
  document.title = '工作台 · 项目协作工作台'
})
</script>

<style scoped>
.workspace-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.workspace-summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-2);
}

.workspace-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(360px, 0.85fr);
  gap: var(--space-2);
}

.workspace-panel {
  min-width: 0;
  padding: var(--space-3);
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.workspace-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.workspace-panel h2,
.workspace-panel p {
  margin: 0;
}

.workspace-panel h2 {
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
}

.workspace-panel__header p {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

.todo-list {
  display: grid;
  gap: var(--space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.todo-list__item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 74px 92px 86px;
  align-items: center;
  gap: var(--space-1);
  min-height: 68px;
  padding: var(--space-1) var(--space-2);
  border: var(--border-width) solid var(--color-divider);
  border-radius: var(--radius-md);
}

.todo-list__type {
  display: inline-grid;
  height: 28px;
  place-items: center;
  color: var(--color-primary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
}

.todo-list__type.is-requirement {
  color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary) 12%, white);
}

.todo-list__type.is-test {
  color: var(--color-info);
  background: color-mix(in srgb, var(--color-info) 12%, white);
}

.todo-list__type.is-defect {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 12%, white);
}

.todo-list__content {
  min-width: 0;
}

.todo-list__content p {
  overflow: hidden;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-list__content span,
.todo-list__date {
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.activity-timeline {
  padding-left: 4px;
}

.activity-timeline__content {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-normal);
}

.activity-timeline__content strong {
  color: var(--color-text-primary);
}
</style>
