<template>
  <section class="configuration-section configuration-workflow">
    <PageHeader
      title="工作流配置"
      description="配置需求、任务和缺陷默认工作流；保存后只影响后续新建项目。"
    >
      <template #actions>
        <AppButton
          :disabled="!activeWorkflow || !canWrite"
          @click="emit('restore')"
        >
          恢复默认工作流
        </AppButton>
        <AppButton
          type="primary"
          :disabled="!activeWorkflow || !canWrite"
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
      <section class="configuration-panel workflow-editor">
        <div class="panel-title-row">
          <h2>状态列表</h2>
          <AppButton plain :disabled="!canWrite" @click="emit('addState')">
            新增状态
          </AppButton>
        </div>
        <ElTable :data="activeWorkflow.states">
          <ElTableColumn prop="name" label="状态名称" min-width="150">
            <template
              #default="{ row }: { row: WorkflowConfig['states'][number] }"
            >
              <AppInput v-model="row.name" :disabled="!canWrite" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="颜色" width="96">
            <template
              #default="{ row }: { row: WorkflowConfig['states'][number] }"
            >
              <ElColorPicker v-model="row.color" :disabled="!canWrite" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="起始" width="88">
            <template
              #default="{ row }: { row: WorkflowConfig['states'][number] }"
            >
              <ElRadio
                :model-value="row.initial"
                :value="true"
                :disabled="!canWrite"
                @change="emit('setInitial', row.state_key)"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="终态" width="88">
            <template
              #default="{ row }: { row: WorkflowConfig['states'][number] }"
            >
              <ElSwitch v-model="row.terminal" :disabled="!canWrite" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="88">
            <template
              #default="{ row }: { row: WorkflowConfig['states'][number] }"
            >
              <AppButton
                link
                type="danger"
                :disabled="!canWrite"
                @click="confirmDeleteState(row.state_key)"
              >
                删除
              </AppButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <div class="panel-title-row mt-[var(--space-3)]">
          <h2>流转列表</h2>
          <AppButton plain :disabled="!canWrite" @click="emit('addTransition')">
            新增流转
          </AppButton>
        </div>
        <ElTable :data="activeWorkflow.transitions">
          <ElTableColumn label="名称" min-width="150">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppInput v-model="row.name" :disabled="!canWrite" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="源状态" min-width="150">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppSelect
                v-model="row.from_state_key"
                :disabled="!canWrite"
                :options="stateOptions"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="目标状态" min-width="150">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppSelect
                v-model="row.to_state_key"
                :disabled="!canWrite"
                :options="stateOptions"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="允许角色" min-width="180">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppSelect
                v-model="row.allowed_role_keys"
                multiple
                collapse-tags
                :disabled="!canWrite"
                :options="roleOptions"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="需评论" width="88">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <ElSwitch v-model="row.require_comment" :disabled="!canWrite" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="通知" width="92">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppButton
                link
                :disabled="!canWrite"
                @click="openNotifyDialog(row)"
              >
                {{ row.notify_enabled ? '已启用' : '配置' }}
              </AppButton>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Webhook" width="104">
            <template
              #default="{ row }: { row: WorkflowConfig['transitions'][number] }"
            >
              <AppButton
                link
                :disabled="!canWrite"
                @click="openWebhookDialog(row)"
              >
                {{ row.webhook_enabled ? '已启用' : '配置' }}
              </AppButton>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="88">
            <template #default="{ $index }: { $index: number }">
              <AppButton
                link
                type="danger"
                :disabled="!canWrite"
                @click="emit('deleteTransition', $index)"
              >
                删除
              </AppButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </section>

      <aside class="configuration-panel workflow-preview">
        <h2>流程预览（只读）</h2>
        <VueFlow
          class="workflow-flow"
          :nodes="flowNodes"
          :edges="flowEdges"
          :nodes-draggable="false"
          :nodes-connectable="false"
          :elements-selectable="false"
          :pan-on-drag="false"
          :zoom-on-scroll="false"
          fit-view-on-init
        />
      </aside>
    </div>

    <ElDialog v-model="notifyDialogVisible" width="520px" title="通知配置">
      <ElForm
        v-if="editingTransition"
        label-position="left"
        label-width="112px"
      >
        <ElFormItem label="启用通知">
          <ElSwitch
            v-model="editingTransition.notify_enabled"
            :disabled="!canWrite"
          />
        </ElFormItem>
        <ElFormItem label="接收规则">
          <AppInput
            v-model="editingTransition.notify_rule"
            :disabled="!canWrite"
          />
        </ElFormItem>
        <ElFormItem label="文案模板">
          <AppInput
            v-model="editingTransition.notify_template"
            type="textarea"
            :rows="4"
            :disabled="!canWrite"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <AppButton type="primary" @click="notifyDialogVisible = false">
          确定
        </AppButton>
      </template>
    </ElDialog>

    <ElDialog v-model="webhookDialogVisible" width="520px" title="Webhook 配置">
      <ElForm
        v-if="editingTransition"
        label-position="left"
        label-width="112px"
      >
        <ElFormItem label="启用 Webhook">
          <ElSwitch
            v-model="editingTransition.webhook_enabled"
            :disabled="!canWrite"
          />
        </ElFormItem>
        <ElFormItem label="Webhook URL">
          <AppInput
            v-model="editingTransition.webhook_url"
            :disabled="!canWrite"
          />
        </ElFormItem>
        <ElFormItem label="Secret 状态">
          <ElSwitch
            v-model="editingTransition.webhook_secret_set"
            active-text="已配置"
            inactive-text="未配置"
            :disabled="!canWrite"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <AppButton type="primary" @click="webhookDialogVisible = false">
          确定
        </AppButton>
      </template>
    </ElDialog>
  </section>
</template>

<script setup lang="ts">
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { VueFlow, type Edge, type Node } from '@vue-flow/core'
import { ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import { AppButton, AppInput, AppSelect, PageHeader } from '@/shared/components'
import type { RoleConfig, WorkflowConfig } from '../model/configuration.types'

const props = defineProps<{
  activeWorkflowKey: string
  activeWorkflow: WorkflowConfig | undefined
  roles: RoleConfig[]
  saving: boolean
  canWrite: boolean
}>()

const emit = defineEmits<{
  'update:activeWorkflowKey': [value: string]
  setInitial: [stateKey: string]
  addState: []
  deleteState: [stateKey: string]
  addTransition: []
  deleteTransition: [index: number]
  restore: []
  save: []
}>()

type WorkflowTransition = WorkflowConfig['transitions'][number]

const notifyDialogVisible = ref(false)
const webhookDialogVisible = ref(false)
const editingTransition = ref<WorkflowTransition>()

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

const flowNodes = computed<Node[]>(() =>
  (props.activeWorkflow?.states ?? []).map((state, index) => ({
    id: state.state_key,
    label: state.name,
    position: {
      x: index % 2 === 0 ? 40 : 220,
      y: index * 86,
    },
    style: {
      border: `2px solid ${state.color}`,
      background: `${state.color}18`,
      color: state.color,
      borderRadius: '8px',
      fontWeight: 600,
      width: '150px',
    },
  })),
)

const flowEdges = computed<Edge[]>(() =>
  (props.activeWorkflow?.transitions ?? []).map((transition) => ({
    id: transition.transition_key,
    source: transition.from_state_key,
    target: transition.to_state_key,
    label: transition.name,
    type: 'smoothstep',
    markerEnd: 'arrowclosed',
    animated: false,
  })),
)

const confirmDeleteState = async (stateKey: string) => {
  if (!props.activeWorkflow || !props.canWrite) {
    return
  }

  const relatedCount = props.activeWorkflow.transitions.filter(
    (transition) =>
      transition.from_state_key === stateKey ||
      transition.to_state_key === stateKey,
  ).length

  if (relatedCount > 0) {
    await ElMessageBox.confirm(
      `删除该状态会同时删除 ${relatedCount} 条相关流转，是否继续？`,
      '确认删除状态',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      },
    )
  }

  emit('deleteState', stateKey)
}

const openNotifyDialog = (transition: WorkflowTransition) => {
  if (!props.canWrite) {
    return
  }
  editingTransition.value = transition
  notifyDialogVisible.value = true
}

const openWebhookDialog = (transition: WorkflowTransition) => {
  if (!props.canWrite) {
    return
  }
  editingTransition.value = transition
  webhookDialogVisible.value = true
}

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
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: var(--space-2);
  align-items: start;
}

.workflow-editor {
  min-width: 0;
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.workflow-preview {
  min-height: 560px;
}

.workflow-flow {
  height: 500px;
  margin-top: var(--space-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
}

@media (max-width: 1180px) {
  .workflow-grid {
    grid-template-columns: 1fr;
  }
}
</style>
