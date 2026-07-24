<template>
  <div class="work-item-editor" :class="`work-item-editor--${mode}`">
    <main class="work-item-editor__main">
      <template v-if="mode === 'create'">
        <ElFormItem label="标题" required>
          <ElInput
            :model-value="form.title"
            :placeholder="titlePlaceholder"
            @update:model-value="updateField('title', $event)"
          />
        </ElFormItem>
        <ElFormItem label="描述" required class="work-item-editor__rich-field">
          <RichTextEditor
            :model-value="form.description"
            @update:model-value="updateField('description', $event)"
          />
        </ElFormItem>
        <ElFormItem
          v-if="kind === 'requirement'"
          label="验收标准"
          class="work-item-editor__rich-field"
        >
          <RichTextEditor
            :model-value="form.acceptance"
            @update:model-value="updateField('acceptance', $event)"
          />
        </ElFormItem>
      </template>

      <template v-else>
        <div class="work-item-editor__title-row">
          <p class="eyebrow">{{ item?.number }}</p>
          <ElInput
            :model-value="form.title"
            class="work-item-editor__title-input"
            @update:model-value="updateField('title', $event)"
          />
        </div>
        <dl class="work-item-editor__meta">
          <div>
            <dt>负责人</dt>
            <dd>{{ item?.assignee?.display_name ?? '未分配' }}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>
              <ElTag v-if="item" :color="item.status_color" effect="dark">
                {{ item.status_name }}
              </ElTag>
              <span v-else>-</span>
            </dd>
          </div>
          <div>
            <dt>开始时间</dt>
            <dd>{{ item?.start_at || '-' }}</dd>
          </div>
          <div>
            <dt>结束时间</dt>
            <dd>{{ item?.end_at || '-' }}</dd>
          </div>
        </dl>
        <section class="work-item-editor__description">
          <h3>描述</h3>
          <RichTextEditor
            :model-value="form.description"
            @update:model-value="updateField('description', $event)"
          />
        </section>
        <div class="work-item-editor__tabs">
          <slot name="tabs" />
        </div>
      </template>
    </main>

    <aside class="work-item-editor__aside" aria-label="工作项属性">
      <h3>属性</h3>
      <ElForm label-position="top" class="work-item-editor__properties">
        <ElFormItem label="优先级">
          <AppSelect
            :model-value="form.priority"
            :options="priorityOptions"
            @update:model-value="updateField('priority', $event)"
          />
        </ElFormItem>
        <ElFormItem label="负责人" required>
          <AppSelect
            :model-value="form.assignee_id"
            clearable
            :options="memberOptions"
            @update:model-value="updateField('assignee_id', $event)"
          />
        </ElFormItem>
        <div class="work-item-editor__date-grid">
          <ElFormItem label="计划开始">
            <ElDatePicker
              :model-value="form.start_at"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              @update:model-value="updateField('start_at', $event)"
            />
          </ElFormItem>
          <ElFormItem label="计划结束">
            <ElDatePicker
              :model-value="form.end_at"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              @update:model-value="updateField('end_at', $event)"
            />
          </ElFormItem>
        </div>

        <template v-if="kind === 'requirement'">
          <ElFormItem label="需求来源">
            <ElInput
              :model-value="form.requirement_detail.source"
              @update:model-value="
                updateField('requirement_detail.source', $event)
              "
            />
          </ElFormItem>
          <ElFormItem label="业务价值">
            <ElInput
              :model-value="form.requirement_detail.business_value"
              type="textarea"
              :rows="4"
              @update:model-value="
                updateField('requirement_detail.business_value', $event)
              "
            />
          </ElFormItem>
        </template>

        <template v-else>
          <ElFormItem label="父需求">
            <AppSelect
              :model-value="form.parent_id"
              clearable
              :options="requirementOptions"
              @update:model-value="updateField('parent_id', $event)"
            />
          </ElFormItem>
          <ElFormItem label="分类">
            <AppSelect
              :model-value="form.task_detail.category"
              :options="taskCategoryOptions"
              @update:model-value="updateField('task_detail.category', $event)"
            />
          </ElFormItem>
          <div class="work-item-editor__date-grid">
            <ElFormItem label="预估工时">
              <ElInput
                :model-value="form.estimated_hours"
                @update:model-value="
                  updateField('estimated_hours', Number($event))
                "
              />
            </ElFormItem>
            <ElFormItem label="剩余工时">
              <ElInput
                :model-value="form.remaining_hours"
                @update:model-value="
                  updateField('remaining_hours', Number($event))
                "
              />
            </ElFormItem>
          </div>
          <ElFormItem label="代码评审">
            <AppSelect
              :model-value="form.task_detail.review_required"
              :options="reviewOptions"
              @update:model-value="
                updateField('task_detail.review_required', $event)
              "
            />
          </ElFormItem>
          <ElFormItem v-if="mode === 'detail'" label="评审地址">
            <ElInput
              :model-value="form.task_detail.code_review_url"
              @update:model-value="
                updateField('task_detail.code_review_url', $event)
              "
            />
          </ElFormItem>
          <ElFormItem label="技术说明">
            <ElInput
              :model-value="form.task_detail.technical_notes"
              type="textarea"
              :rows="4"
              @update:model-value="
                updateField('task_detail.technical_notes', $event)
              "
            />
          </ElFormItem>
        </template>

        <ElFormItem
          v-if="mode === 'detail' && kind === 'requirement'"
          label="验收标准"
        >
          <RichTextEditor
            :model-value="form.acceptance"
            @update:model-value="updateField('acceptance', $event)"
          />
        </ElFormItem>
      </ElForm>

      <div class="work-item-editor__actions">
        <slot name="actions" />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElDatePicker, ElForm, ElFormItem, ElInput, ElTag } from 'element-plus'
import { AppSelect } from '@/shared/components'
import type {
  ProjectMember,
  WorkItem,
  WorkItemSummary,
} from '../model/project-detail.types'
import RichTextEditor from './RichTextEditor.vue'

export interface WorkItemEditorForm {
  title: string
  description: string
  acceptance: string
  priority?: string
  assignee_id?: string
  parent_id?: string
  start_at: string
  end_at: string
  estimated_hours?: number
  remaining_hours?: number
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
}

export type WorkItemEditorField =
  | 'title'
  | 'description'
  | 'acceptance'
  | 'priority'
  | 'assignee_id'
  | 'parent_id'
  | 'start_at'
  | 'end_at'
  | 'estimated_hours'
  | 'remaining_hours'
  | 'requirement_detail.source'
  | 'requirement_detail.business_value'
  | 'task_detail.category'
  | 'task_detail.technical_notes'
  | 'task_detail.review_required'
  | 'task_detail.code_review_url'

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'detail'
    kind: 'requirement' | 'task'
    form: WorkItemEditorForm
    members?: ProjectMember[]
    requirements?: WorkItemSummary[]
    item?: WorkItem
  }>(),
  {
    members: () => [],
    requirements: () => [],
  },
)

const emit = defineEmits<{
  updateField: [field: WorkItemEditorField, value: unknown]
}>()

const updateField = (field: WorkItemEditorField, value: unknown) => {
  emit('updateField', field, value)
}

const priorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

const taskCategoryOptions = [
  { label: '开发', value: 'development' },
  { label: '设计', value: 'design' },
  { label: '调研', value: 'research' },
  { label: '重构', value: 'refactor' },
  { label: '联调', value: 'integration' },
  { label: '文档', value: 'documentation' },
  { label: '其他', value: 'other' },
]

const reviewOptions = [
  { label: '需要', value: true },
  { label: '不需要', value: false },
]

const memberOptions = computed(() =>
  props.members.map((member) => ({
    label: member.user.display_name,
    value: member.user.id,
  })),
)

const requirementOptions = computed(() =>
  props.requirements.map((requirement) => ({
    label: `${requirement.number} ${requirement.title}`,
    value: requirement.id,
  })),
)

const titlePlaceholder = computed(() =>
  props.kind === 'task' ? '请输入任务标题' : '请输入需求标题',
)
</script>

<style scoped>
.work-item-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--space-3);
}

.work-item-editor__main,
.work-item-editor__aside {
  min-width: 0;
}

.work-item-editor__aside {
  padding: var(--space-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.work-item-editor__aside > h3,
.work-item-editor__description > h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-title-sm);
}

.work-item-editor__properties {
  display: grid;
  gap: var(--space-1);
}

.work-item-editor__properties :deep(.el-form-item) {
  margin-bottom: 0;
}

.work-item-editor__properties :deep(.el-select),
.work-item-editor__properties :deep(.el-date-editor) {
  width: 100%;
}

.work-item-editor__date-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-1);
}

.work-item-editor__rich-field :deep(.rich-text-editor),
.work-item-editor__description :deep(.rich-text-editor) {
  min-height: 260px;
}

.work-item-editor__title-row {
  display: grid;
  gap: 8px;
  margin-bottom: var(--space-2);
}

.work-item-editor__title-input :deep(.el-input__wrapper) {
  min-height: 44px;
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
}

.work-item-editor__meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-1);
  margin: 0 0 var(--space-3);
}

.work-item-editor__meta div {
  min-width: 0;
  padding: var(--space-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
}

.work-item-editor__meta dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.work-item-editor__meta dd {
  margin: 6px 0 0;
  overflow: hidden;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-item-editor__description {
  margin-bottom: var(--space-3);
}

.work-item-editor__tabs {
  min-width: 0;
}

.work-item-editor__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

@media (max-width: 1100px) {
  .work-item-editor {
    grid-template-columns: 1fr;
  }

  .work-item-editor__meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
