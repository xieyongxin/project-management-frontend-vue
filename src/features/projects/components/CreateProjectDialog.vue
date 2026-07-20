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
        <ol>
          <li v-for="item in activeFlow" :key="item">{{ item }}</li>
        </ol>
      </aside>

      <main class="project-type-picker">
        <h3>选择项目类型</h3>
        <p>选择适合团队的项目管理方式，后续可在项目设置中查看配置快照。</p>
        <div class="project-type-picker__grid">
          <button
            v-for="option in projectTypeOptions"
            :key="option.value"
            class="project-type-card"
            :class="{ 'is-active': form.method === option.value }"
            type="button"
            @click="form.method = option.value"
          >
            <ElRadio :model-value="form.method" :value="option.value" />
            <ElIcon><component :is="option.icon" /></ElIcon>
            <strong>{{ option.title }}</strong>
            <span>{{ option.description }}</span>
            <em>默认最新版本</em>
          </button>
        </div>

        <div class="enabled-tabs">
          <span
            v-for="tab in enabledTabs"
            :key="tab"
            class="enabled-tabs__item"
          >
            {{ tab }}
          </span>
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
      <ElForm label-position="top">
        <ElFormItem label="项目名称" required :error="errors.name">
          <AppInput v-model="form.name" placeholder="请输入项目名称" />
        </ElFormItem>
        <ElFormItem label="项目标识" required :error="errors.identifier">
          <AppInput v-model="form.identifier" placeholder="如 PRJ-I-001" />
        </ElFormItem>
        <ElFormItem label="项目负责人" required>
          <AppSelect v-model="form.ownerId" :options="ownerOptions" />
        </ElFormItem>
        <ElFormItem label="可见性" required>
          <ElRadioGroup v-model="form.visibility">
            <ElRadioButton value="private">私有</ElRadioButton>
            <ElRadioButton value="public">公开</ElRadioButton>
          </ElRadioGroup>
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

      <aside class="create-project-tips">
        <div v-for="tip in tips" :key="tip">{{ tip }}</div>
        <ElAlert
          type="info"
          :closable="false"
          show-icon
          title="创建完成后，项目将按所选模板启用对应流程和 Tab。"
        />
      </aside>
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
import { DataBoard, Finished } from '@element-plus/icons-vue'
import { computed, reactive, ref, watch } from 'vue'
import { AppButton, AppInput, AppSelect } from '@/shared/components'
import type { ProjectCreatePayload } from '../model/project.types'

const props = defineProps<{
  modelValue: boolean
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
  visibility: ProjectCreatePayload['visibility']
  description: string
}

const form = reactive<CreateProjectForm>({
  method: 'scrum',
  name: '',
  identifier: '',
  ownerId: 'user-demo-001',
  visibility: 'private',
  description: '',
})
const errors = reactive({
  name: '',
  identifier: '',
})

const projectTypeOptions = [
  {
    value: 'scrum',
    title: 'Scrum',
    description: '适用于敏捷迭代团队，强调短周期迭代与持续交付',
    icon: DataBoard,
  },
  {
    value: 'waterfall',
    title: 'Waterfall',
    description: '适用于需求明确、阶段性推进的项目管理',
    icon: Finished,
  },
] as const

const scrumFlow = [
  '需求池',
  '迭代规划',
  '任务拆解',
  '看板流转',
  '测试验证',
  '验收/回顾',
  '发布',
]
const waterfallFlow = ['需求', '设计', '开发', '测试', '验收', '发布']
const ownerOptions = [
  { label: '张思远', value: 'user-demo-001' },
  { label: '李明', value: 'user-002' },
  { label: '王晓蕾', value: 'user-003' },
  { label: '赵天宇', value: 'user-004' },
]
const tips = [
  '项目标识创建后通常不可修改',
  '负责人必须为有效用户',
  '可见性会影响公司内访问范围',
]

const activeFlow = computed(() =>
  form.method === 'scrum' ? scrumFlow : waterfallFlow,
)
const enabledTabs = computed(() =>
  form.method === 'scrum'
    ? ['概览', '需求', '任务', '缺陷', '迭代', '版本', '测试', '成员', '动态']
    : ['概览', '需求', '任务', '缺陷', '阶段', '版本', '测试', '成员', '动态'],
)

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      step.value = 1
      errors.name = ''
      errors.identifier = ''
    }
  },
)

const close = () => emit('update:modelValue', false)

const validate = () => {
  errors.name = form.name.trim() ? '' : '项目名称不能为空。'
  errors.identifier = /^[A-Z0-9-]{2,16}$/.test(form.identifier.trim())
    ? ''
    : '建议 2-16 位大写字母、数字或短横线。'

  return !errors.name && !errors.identifier
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
    visibility: form.visibility,
    description: form.description.trim(),
  })
}
</script>

<style scoped>
.create-project-step,
.create-project-form {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: var(--space-3);
  min-height: 480px;
}

.flow-preview,
.create-project-tips {
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

.flow-preview ol {
  display: grid;
  gap: var(--space-1);
  margin: var(--space-2) 0 0;
  padding-left: 20px;
  color: var(--color-text-secondary);
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

.enabled-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin: var(--space-2) 0;
}

.enabled-tabs__item {
  padding: 6px 10px;
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
}

.create-project-tips {
  display: grid;
  align-content: start;
  gap: var(--space-2);
}

.create-project-tips div {
  padding: var(--space-2);
  color: var(--color-text-secondary);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
}

.dialog-footer {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
</style>
