<template>
  <section class="project-detail-page" aria-label="项目详情">
    <AsyncPageSkeleton v-if="navigationQuery.isLoading.value" />
    <PageError
      v-else-if="navigationQuery.isError.value"
      title="项目加载失败"
      description="项目不存在或当前用户无权访问。"
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
          <AppButton plain>项目内搜索</AppButton>
          <ElDropdown>
            <AppButton type="primary">
              创建工作项
              <ElIcon><ArrowDown /></ElIcon>
            </AppButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem>创建需求</ElDropdownItem>
                <ElDropdownItem>创建任务</ElDropdownItem>
                <ElDropdownItem>创建缺陷</ElDropdownItem>
                <ElDropdownItem>创建测试用例</ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
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
        <ElDropdown
          v-if="navigation.more_tabs.length || navigation.system_entries.length"
        >
          <button class="project-tabs__item project-tabs__more" type="button">
            更多
            <ElIcon><ArrowDown /></ElIcon>
          </button>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                v-for="tab in navigation.more_tabs"
                :key="tab.tab_key"
                @click="router.push(tab.route)"
              >
                {{ tab.name }}
              </ElDropdownItem>
              <ElDropdownItem
                v-for="entry in navigation.system_entries"
                :key="entry.tab_key"
                divided
                @click="router.push(entry.route)"
              >
                {{ entry.name }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </nav>

      <main class="project-detail-content">
        <section v-if="section === 'overview'" class="project-overview-grid">
          <SummaryCard
            label="项目健康度"
            :value="overview?.health ?? '--'"
            description="实时计算项目状态"
            tone="success"
          />
          <SummaryCard
            label="需求进度"
            :value="`${overview?.requirement_progress ?? 0}%`"
            description="已确认/已验收需求"
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
          <section class="project-detail-panel">
            <h2>质量风险</h2>
            <p>
              {{ overview?.defect_summary ?? navigation.project.risk_summary }}
            </p>
          </section>
          <section class="project-detail-panel">
            <h2>最新动态</h2>
            <ElTimeline>
              <ElTimelineItem
                v-for="event in overview?.recent_activity ?? []"
                :key="event.id"
                :timestamp="event.timeText"
              >
                {{ event.actor }}{{ event.content }}
              </ElTimelineItem>
            </ElTimeline>
          </section>
        </section>

        <section v-else-if="section === 'members'" class="project-detail-panel">
          <h2>成员</h2>
          <p>项目负责人已自动加入项目成员，并拥有项目负责人角色。</p>
          <ElTable :data="memberRows">
            <ElTableColumn prop="name" label="成员" />
            <ElTableColumn prop="role" label="项目角色" />
            <ElTableColumn prop="joinedAt" label="加入时间" />
          </ElTable>
        </section>

        <section
          v-else-if="section === 'activity'"
          class="project-detail-panel"
        >
          <h2>动态</h2>
          <ElTimeline>
            <ElTimelineItem
              v-for="event in overview?.recent_activity ?? []"
              :key="event.id"
              :timestamp="event.timeText"
            >
              {{ event.actor }}{{ event.content }}
            </ElTimelineItem>
          </ElTimeline>
        </section>

        <section
          v-else-if="section === 'configuration'"
          class="project-detail-panel"
        >
          <h2>项目配置快照</h2>
          <p>
            当前项目创建时复制的项目类型 Tab
            和需求/任务/缺陷默认工作流只读展示。
          </p>
          <ElTable :data="[...navigation.tabs, ...navigation.more_tabs]">
            <ElTableColumn prop="name" label="启用 Tab" />
            <ElTableColumn prop="module_key" label="模块" />
            <ElTableColumn prop="route" label="路由" />
          </ElTable>
        </section>

        <section v-else class="project-detail-panel">
          <h2>{{ currentTabName }}</h2>
          <p>
            该业务页入口已根据项目配置快照启用。首轮先建立路由和项目上下文，后续模块将按需求继续展开。
          </p>
          <EmptyState
            title="模块待实现"
            description="需求、任务、缺陷、迭代/阶段、版本和测试的完整业务闭环将在后续模块内实现。"
          />
        </section>
      </main>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  AppButton,
  AsyncPageSkeleton,
  EmptyState,
  PageError,
  StatusTag,
  SummaryCard,
} from '@/shared/components'
import {
  useProjectNavigation,
  useProjectOverview,
} from '../api/project.queries'
import { healthLabel, healthTone, methodLabel } from '../model/project-labels'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => String(route.params.projectId))
const section = computed(() => String(route.params.section ?? 'overview'))
const navigationQuery = useProjectNavigation(projectId)
const overviewQuery = useProjectOverview(projectId)
const navigation = computed(() => navigationQuery.data.value)
const overview = computed(() => overviewQuery.data.value)

const currentTabName = computed(() => {
  const tabs = [
    ...(navigation.value?.tabs ?? []),
    ...(navigation.value?.more_tabs ?? []),
    ...(navigation.value?.system_entries ?? []),
  ]

  return (
    tabs.find((tab) => tab.route.endsWith(`/${section.value}`))?.name ??
    '项目模块'
  )
})

const memberRows = computed(() => [
  {
    name: navigation.value?.project.owner.display_name ?? '项目负责人',
    role: '项目负责人',
    joinedAt: '项目创建时',
  },
  { name: '李明', role: '开发人员', joinedAt: '2026-07-16' },
  { name: '王晓蕾', role: '测试人员', joinedAt: '2026-07-16' },
])

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
.project-detail-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-1);
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
  gap: 4px;
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
  grid-column: span 2;
  padding: var(--space-3);
}

.project-detail-panel h2,
.project-detail-panel p {
  margin: 0;
}

.project-detail-panel h2 {
  margin-bottom: var(--space-1);
  font-size: var(--font-size-title-sm);
}

.project-detail-panel p {
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}
</style>
