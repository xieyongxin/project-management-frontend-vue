<template>
  <section class="configuration-section configuration-workflow">
    <PageHeader
      title="工作流配置"
      description="配置需求、任务和缺陷默认工作流；保存后只影响后续新建项目。"
    >
      <template #actions>
        <AppButton :disabled="!activeWorkflow" @click="emit('restore')">
          恢复默认工作流
        </AppButton>
        <AppButton
          type="primary"
          :disabled="!activeWorkflow"
          :loading="saving"
          @click="emit('save')"
        >
          保存
        </AppButton>
      </template>
    </PageHeader>
    <ElTabs
      :model-value="activeWorkflowKey"
      @update:model-value="handleWorkflowKeyChange"
    >
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
              <AppInput v-model="row.name" />
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
                @change="emit('setInitial', row.state_key)"
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
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppSelect v-model="row.from_state_key" :options="stateOptions" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="目标状态">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppSelect v-model="row.to_state_key" :options="stateOptions" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="允许角色">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppSelect
                v-model="row.allowed_role_keys"
                multiple
                collapse-tags
                :options="roleOptions"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="需评论" width="90">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
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
            <span :style="{ borderColor: state.color }">{{ state.name }}</span>
          </li>
        </ol>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppButton, AppInput, AppSelect, PageHeader } from '@/shared/components'
import type { RoleConfig, WorkflowConfig } from '../model/configuration.types'

const props = defineProps<{
  activeWorkflowKey: string
  activeWorkflow: WorkflowConfig | undefined
  roles: RoleConfig[]
  saving: boolean
}>()

const emit = defineEmits<{
  'update:activeWorkflowKey': [value: string]
  setInitial: [stateKey: string]
  restore: []
  save: []
}>()

const stateOptions = computed(
  () =>
    props.activeWorkflow?.states.map((state) => ({
      label: state.name,
      value: state.state_key,
    })) ?? [],
)
const roleOptions = computed(() =>
  props.roles.map((role) => ({
    label: role.name,
    value: role.role_key,
  })),
)

const handleWorkflowKeyChange = (value: string | number) => {
  emit('update:activeWorkflowKey', String(value))
}
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

.configuration-panel h2,
.configuration-panel p {
  margin: 0;
}

.configuration-panel h2 {
  font-size: var(--font-size-title-sm);
}

.configuration-panel p {
  color: var(--color-text-secondary);
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
