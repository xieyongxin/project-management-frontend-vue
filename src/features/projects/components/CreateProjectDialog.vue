<template>
  <ElDialog
    :model-value="modelValue"
    width="960px"
    class="create-project-dialog"
    title="新建项目"
    @close="close"
  >
    <ElSteps class="mb-[var(--space-3)]" :active="step - 1" align-center>
      <ElStep title="项目类型与流程" />
      <ElStep title="基本信息" />
    </ElSteps>

    <section v-if="step === 1" class="create-project-step">
      <aside class="flow-preview">
        <h3>流程预览</h3>
        <ElSkeleton v-if="templateLoading" :rows="6" animated />
        <ol v-else class="flow-preview__nodes">
          <li v-for="(item, index) in activeFlow" :key="item.key">
            <span class="flow-preview__node" :style="flowNodeStyle(item)">
              <span class="flow-preview__dot" :style="flowDotStyle(item)" />
              {{ item.name }}
            </span>
            <span
              v-if="index < activeFlow.length - 1"
              class="flow-preview__arrow"
            >
              ↓
            </span>
          </li>
        </ol>
      </aside>

      <main class="project-type-picker">
        <h3>选择项目类型</h3>
        <p>选择适合团队的项目管理方式，后续可在项目设置中查看配置快照。</p>
        <div class="project-type-picker__grid">
          <button
            v-for="option in projectTypeOptions"
            :key="option.type_key"
            class="project-type-card"
            :class="{ 'is-active': form.method === option.method }"
            type="button"
            @click="form.method = option.method"
          >
            <ElRadio :model-value="form.method" :value="option.method" />
            <ElIcon><DataBoard /></ElIcon>
            <strong>{{ option.name }}</strong>
            <span>{{ option.description }}</span>
            <em>默认最新版本</em>
          </button>
        </div>

        <ElAlert
          type="warning"
          :closable="false"
          show-icon
          title="项目创建后流程暂不允许项目负责人自行修改，后续只能由管理员通过模板迁移升级。"
        />
      </main>
    </section>

    <section v-else class="create-project-form">
      <ElForm
        class="create-project-main-form"
        label-position="left"
        label-width="104px"
      >
        <ElFormItem label="项目名称" required :error="errors.name">
          <AppInput v-model="form.name" placeholder="请输入项目名称" />
        </ElFormItem>
        <ElFormItem label="项目标识" required :error="errors.identifier">
          <AppInput v-model="form.identifier" placeholder="如 PRJ-I-001" />
        </ElFormItem>
        <ElFormItem label="项目负责人" required :error="errors.ownerId">
          <AppSelect
            v-model="form.ownerId"
            :options="ownerOptions"
            :loading="templateLoading"
          />
        </ElFormItem>
        <ElFormItem label="默认处理人">
          <AppSelect
            v-model="form.defaultAssigneeId"
            clearable
            :options="ownerOptions"
            :loading="templateLoading"
          />
        </ElFormItem>
        <ElFormItem label="可见性" required>
          <ElRadioGroup v-model="form.visibility" class="visibility-choice">
            <ElRadio value="private" class="visibility-choice__card">
              <strong>私有</strong>
              <span>
                仅项目成员、项目负责人和管理员可访问，适合未公开立项或敏感项目。
              </span>
            </ElRadio>
            <ElRadio value="public" class="visibility-choice__card">
              <strong>公开</strong>
              <span>
                公司内登录用户均可查看项目基础信息，适合跨团队协作和透明进展。
              </span>
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="项目周期" :error="errors.dateRange">
          <div class="date-range-row">
            <ElDatePicker
              v-model="form.startAt"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="开始日期"
            />
            <ElDatePicker
              v-model="form.endAt"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="结束日期"
            />
          </div>
        </ElFormItem>
        <ElFormItem label="项目描述">
          <AppInput
            v-model="form.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请输入项目描述（选填）"
          />
        </ElFormItem>
      </ElForm>
    </section>

    <template #footer>
      <div class="dialog-footer">
        <AppButton v-if="step === 2" @click="step = 1">上一步</AppButton>
        <span class="flex-1" />
        <AppButton @click="close">取消</AppButton>
        <AppButton v-if="step === 1" type="primary" @click="step = 2">
          下一步
        </AppButton>
        <AppButton v-else type="primary" :loading="submitting" @click="submit">
          创建项目
        </AppButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { DataBoard } from '@element-plus/icons-vue'
import { ElDatePicker } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { AppButton, AppInput, AppSelect } from '@/shared/components'
import type {
  ProjectCreatePayload,
  ProjectCreateTemplate,
  ProjectFlowNode,
  ProjectTemplateType,
} from '../model/project.types'

const props = defineProps<{
  modelValue: boolean
  template: ProjectCreateTemplate
  templateLoading?: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: ProjectCreatePayload]
}>()

const step = ref(1)
interface CreateProjectForm {
  method: ProjectCreatePayload['method']
  name: string
  identifier: string
  ownerId: string
  defaultAssigneeId: string
  visibility: ProjectCreatePayload['visibility']
  startAt: string
  endAt: string
  description: string
}

const form = reactive<CreateProjectForm>({
  method: 'scrum',
  name: '',
  identifier: '',
  ownerId: '',
  defaultAssigneeId: '',
  visibility: 'private',
  startAt: '',
  endAt: '',
  description: '',
})
const errors = reactive({
  name: '',
  identifier: '',
  ownerId: '',
  dateRange: '',
})

const projectTypeOptions = computed(() => props.template.project_types)
const ownerOptions = computed(() =>
  props.template.owners.map((owner) => ({
    label: owner.display_name,
    value: owner.id,
  })),
)
const activeProjectType = computed<ProjectTemplateType | undefined>(() =>
  projectTypeOptions.value.find((item) => item.method === form.method),
)
const activeFlow = computed(() =>
  [...(activeProjectType.value?.flow_nodes ?? [])].sort(
    (left, right) => left.sort_order - right.sort_order,
  ),
)

watch(
  () =>
    [
      props.modelValue,
      props.template.project_types,
      props.template.owners,
    ] as const,
  ([visible]) => {
    if (!visible) {
      return
    }

    const firstType = props.template.project_types[0]
    const firstOwner = props.template.owners[0]

    if (
      firstType &&
      !props.template.project_types.some((item) => item.method === form.method)
    ) {
      form.method = firstType.method
    }

    if (
      firstOwner &&
      !props.template.owners.some((item) => item.id === form.ownerId)
    ) {
      form.ownerId = firstOwner.id
    }

    step.value = 1
    errors.name = ''
    errors.identifier = ''
    errors.ownerId = ''
    errors.dateRange = ''
  },
)

const close = () => emit('update:modelValue', false)

const flowNodeStyle = (node: ProjectFlowNode) => ({
  borderColor: node.color,
  backgroundColor: `${node.color}18`,
  color: node.color,
})

const flowDotStyle = (node: ProjectFlowNode) => ({
  backgroundColor: node.color,
})

const validate = () => {
  errors.name = form.name.trim() ? '' : '项目名称不能为空。'
  const identifier = form.identifier.trim()
  errors.identifier =
    identifier.length >= 2 && identifier.length <= 16
      ? ''
      : '项目标识长度需为 2-16 个字符。'
  errors.ownerId = form.ownerId ? '' : '请选择项目负责人。'
  errors.dateRange =
    form.startAt && form.endAt && form.startAt > form.endAt
      ? '开始日期不能晚于结束日期。'
      : ''

  return (
    !errors.name && !errors.identifier && !errors.ownerId && !errors.dateRange
  )
}

const submit = () => {
  if (!validate()) {
    return
  }

  emit('submit', {
    method: form.method,
    name: form.name.trim(),
    identifier: form.identifier.trim(),
    owner_id: form.ownerId,
    default_assignee_id: form.defaultAssigneeId || null,
    visibility: form.visibility,
    start_at: form.startAt,
    end_at: form.endAt,
    description: form.description.trim(),
  })
}
</script>

<style scoped>
.create-project-step,
.create-project-form {
  display: grid;
  gap: var(--space-3);
  min-height: 480px;
}

.create-project-step {
  grid-template-columns: 260px minmax(0, 1fr);
}

.create-project-form {
  grid-template-columns: minmax(0, 1fr);
}

.flow-preview {
  padding: var(--space-3);
  background: var(--color-bg-subtle);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
}

.flow-preview h3,
.project-type-picker h3 {
  margin: 0 0 var(--space-1);
  font-size: var(--font-size-title-sm);
}

.flow-preview__nodes {
  display: grid;
  gap: 4px;
  margin: var(--space-2) 0 0;
  padding: 0;
  list-style: none;
}

.flow-preview__nodes li {
  display: grid;
  justify-items: center;
  align-items: center;
  gap: 4px;
}

.flow-preview__node {
  display: inline-flex;
  width: 100%;
  min-width: 0;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 8px;
  overflow: hidden;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
}

.flow-preview__dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.flow-preview__arrow {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1;
  text-align: center;
}

.project-type-picker > p {
  margin: 0 0 var(--space-2);
  color: var(--color-text-secondary);
}

.project-type-picker__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.project-type-card {
  position: relative;
  display: grid;
  min-height: 220px;
  place-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  text-align: center;
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
}

.project-type-card.is-active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus);
}

.project-type-card :deep(.el-radio) {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}

.project-type-card .el-icon {
  width: 56px;
  height: 56px;
  color: var(--color-primary);
  font-size: 32px;
  background: var(--color-primary-subtle);
  border-radius: var(--radius-lg);
}

.project-type-card strong {
  font-size: var(--font-size-title-sm);
}

.project-type-card span {
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.project-type-card em {
  width: 100%;
  padding: var(--space-1);
  color: var(--color-primary);
  font-style: normal;
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
}

.dialog-footer {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.date-range-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-1);
}

.visibility-choice {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.visibility-choice :deep(.el-radio) {
  height: auto;
  margin-right: 0;
  padding: var(--space-2);
  align-items: flex-start;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
}

.visibility-choice :deep(.el-radio.is-checked) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus);
}

.visibility-choice :deep(.el-radio__label) {
  display: grid;
  gap: 6px;
  line-height: var(--line-height-normal);
  white-space: normal;
}

.visibility-choice__card strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
}

.visibility-choice__card span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

@media (max-width: 900px) {
  .create-project-step,
  .create-project-form {
    grid-template-columns: 1fr;
  }

  .visibility-choice {
    grid-template-columns: 1fr;
  }
}
</style>
