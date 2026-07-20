<template>
  <section class="configuration-section">
    <PageHeader
      title="项目类型配置"
      description="配置不同项目类型在项目详情中启用的 Tab 和展示顺序。"
    />

    <DataTableShell v-if="!activeTypeKey">
      <ElTable v-loading="loading" :data="projectTypes">
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
            {{ Math.max(0, row.tabs.filter((tab) => tab.enabled).length - 6) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updated_by" label="最后修改人" width="130" />
        <ElTableColumn prop="updated_at" label="最后修改时间" width="170" />
        <ElTableColumn label="操作" width="120">
          <template #default="{ row }: { row: ProjectTypeConfig }">
            <AppButton type="primary" link @click="emit('open', row)">
              配置
            </AppButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </DataTableShell>

    <section v-else-if="activeProjectType" class="configuration-panel">
      <div class="configuration-panel__header">
        <AppButton plain @click="emit('back')">返回</AppButton>
        <div>
          <h2>{{ activeProjectType.name }}配置</h2>
          <p>启用的前 6 个 Tab 展示在顶部，超过 6 个自动进入“更多”菜单。</p>
        </div>
        <AppButton type="primary" :loading="saving" @click="emit('save')">
          保存
        </AppButton>
      </div>
      <ElAlert
        class="mb-[var(--space-2)]"
        type="info"
        show-icon
        :closable="false"
        title="保存后只影响后续新建项目，不影响已有项目。"
      />
      <div class="tab-sort-table">
        <div class="tab-sort-table__header">
          <span>拖拽</span>
          <span>Tab 名称</span>
          <span>展示位置</span>
          <span>是否启用</span>
        </div>
        <div ref="tabListRef" class="tab-sort-table__body">
          <div
            v-for="(tab, index) in activeProjectType.tabs"
            :key="tab.tab_key"
            class="tab-sort-row"
            :data-tab-key="tab.tab_key"
          >
            <span class="drag-handle">⋮⋮</span>
            <strong>{{ tab.name }}</strong>
            <span class="tab-sort-row__position">
              {{ resolveTabPosition(index, tab.enabled) }}
            </span>
            <ElSwitch v-model="tab.enabled" />
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import Sortable from 'sortablejs'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { AppButton, DataTableShell, PageHeader } from '@/shared/components'
import type { ProjectTypeConfig } from '../model/configuration.types'

const props = defineProps<{
  projectTypes: ProjectTypeConfig[]
  activeTypeKey: string | undefined
  activeProjectType: ProjectTypeConfig | undefined
  loading: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  open: [row: ProjectTypeConfig]
  back: []
  reorderTabs: [oldIndex: number, newIndex: number]
  save: []
}>()

const tabListRef = ref<HTMLElement>()
const sortable = ref<Sortable>()

const setupSortable = async () => {
  await nextTick()
  sortable.value?.destroy()
  sortable.value = undefined

  if (!tabListRef.value || !props.activeProjectType) {
    return
  }

  sortable.value = Sortable.create(tabListRef.value, {
    animation: 150,
    handle: '.drag-handle',
    onEnd: (event) => {
      if (
        !props.activeProjectType ||
        event.oldIndex === undefined ||
        event.newIndex === undefined ||
        event.oldIndex === event.newIndex
      ) {
        return
      }

      emit('reorderTabs', event.oldIndex, event.newIndex)
    },
  })
}

const resolveTabPosition = (index: number, enabled: boolean) => {
  if (!enabled) {
    return '未启用'
  }

  const currentTab = props.activeProjectType?.tabs[index]
  const enabledIndex =
    props.activeProjectType?.tabs
      .filter((tab) => tab.enabled)
      .findIndex((tab) => tab.tab_key === currentTab?.tab_key) ?? -1

  return enabledIndex >= 6 ? '更多菜单' : '顶部 Tab'
}

watch(() => props.activeTypeKey, setupSortable, { immediate: true })

onBeforeUnmount(() => {
  sortable.value?.destroy()
})
</script>

<style scoped>
.configuration-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.configuration-panel {
  padding: var(--space-3);
  background: var(--app-panel-background);
  border: var(--border-width) solid var(--app-panel-border);
  border-radius: var(--app-panel-radius);
  box-shadow: var(--app-panel-shadow);
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

.tab-sort-table {
  overflow: hidden;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
}

.tab-sort-table__header,
.tab-sort-row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 120px 120px;
  align-items: center;
  gap: var(--space-1);
  padding: 12px 16px;
}

.tab-sort-table__header {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
  background: var(--color-bg-subtle);
}

.tab-sort-row {
  background: var(--color-bg-surface);
  border-top: var(--border-width) solid var(--color-border);
}

.tab-sort-row__position {
  color: var(--color-text-secondary);
}

.sortable-ghost {
  opacity: 0.5;
}
</style>
