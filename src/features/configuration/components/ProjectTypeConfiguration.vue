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
</template>

<script setup lang="ts">
import { AppButton, DataTableShell, PageHeader } from '@/shared/components'
import type { ProjectTypeConfig } from '../model/configuration.types'

defineProps<{
  projectTypes: ProjectTypeConfig[]
  activeTypeKey: string | undefined
  activeProjectType: ProjectTypeConfig | undefined
  loading: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  open: [row: ProjectTypeConfig]
  back: []
  save: []
}>()
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
</style>
