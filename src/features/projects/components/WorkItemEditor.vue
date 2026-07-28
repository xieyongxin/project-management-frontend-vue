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
        <template v-if="kind === 'defect'">
          <ElFormItem label="复现步骤" class="work-item-editor__rich-field">
            <ElInput
              :model-value="form.bug_detail.reproduce_steps"
              type="textarea"
              :rows="8"
              @update:model-value="
                updateField('bug_detail.reproduce_steps', $event)
              "
            />
          </ElFormItem>
          <div class="work-item-editor__date-grid">
            <ElFormItem label="预期结果">
              <ElInput
                :model-value="form.bug_detail.expected_result"
                type="textarea"
                :rows="4"
                @update:model-value="
                  updateField('bug_detail.expected_result', $event)
                "
              />
            </ElFormItem>
            <ElFormItem label="实际结果">
              <ElInput
                :model-value="form.bug_detail.actual_result"
                type="textarea"
                :rows="4"
                @update:model-value="
                  updateField('bug_detail.actual_result', $event)
                "
              />
            </ElFormItem>
          </div>
        </template>
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
        <ElFormItem v-if="kind === 'defect'" label="严重程度">
          <AppSelect
            :model-value="form.severity"
            :options="severityOptions"
            @update:model-value="updateField('severity', $event)"
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

        <template v-else-if="kind === 'task'">
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

        <template v-else>
          <ElFormItem label="关联需求/任务">
            <AppSelect
              :model-value="form.parent_id"
              clearable
              :options="requirementOptions"
              @update:model-value="updateField('parent_id', $event)"
            />
          </ElFormItem>
          <ElFormItem label="缺陷类型">
            <AppSelect
              :model-value="form.bug_detail.bug_type"
              clearable
              :options="bugTypeOptions"
              @update:model-value="updateField('bug_detail.bug_type', $event)"
            />
          </ElFormItem>
          <ElFormItem label="发现环境">
            <ElInput
              :model-value="form.bug_detail.environment"
              @update:model-value="
                updateField('bug_detail.environment', $event)
              "
            />
          </ElFormItem>
          <ElFormItem v-if="mode === 'detail'" label="修复说明">
            <ElInput
              :model-value="form.bug_detail.fix_summary"
              type="textarea"
              :rows="4"
              @update:model-value="
                updateField('bug_detail.fix_summary', $event)
              "
            />
          </ElFormItem>
          <ElFormItem v-if="mode === 'detail'" label="重开次数">
            <ElInput :model-value="form.bug_detail.reopened_count" disabled />
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
  severity?: string
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
  bug_detail: {
    bug_type: string
    environment: string
    reproduce_steps: string
    expected_result: string
    actual_result: string
    found_in_version_id?: string | null
    fixed_in_version_id?: string | null
    source_test_run_id?: string | null
    source_test_plan_id?: string | null
    regression_test_run_id?: string | null
    fix_summary: string
    reopened_count: number
  }
}

export type WorkItemEditorField =
  | 'title'
  | 'description'
  | 'acceptance'
  | 'priority'
  | 'severity'
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
  | 'bug_detail.bug_type'
  | 'bug_detail.environment'
  | 'bug_detail.reproduce_steps'
  | 'bug_detail.expected_result'
  | 'bug_detail.actual_result'
  | 'bug_detail.fix_summary'

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'detail'
    kind: 'requirement' | 'task' | 'defect'
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

const severityOptions = [
  { label: '阻塞', value: 'blocker' },
  { label: '严重', value: 'critical' },
  { label: '主要', value: 'major' },
  { label: '次要', value: 'minor' },
  { label: '提示', value: 'trivial' },
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

const bugTypeOptions = [
  { label: '功能', value: 'functional' },
  { label: '界面', value: 'ui' },
  { label: '性能', value: 'performance' },
  { label: '兼容性', value: 'compatibility' },
  { label: '安全', value: 'security' },
  { label: '数据', value: 'data' },
  { label: '其他', value: 'other' },
]

const memberOptions = computed(() =>
  props.members.map((member) => ({
    label: member.user.display_name,
    value: member.user.id,
  })),
)

const requirementOptions = computed(() =>
  props.requirements.map((requirement) => {
    const typeLabel = requirement.type === 'task' ? '任务' : '需求'
    return {
      label: `${typeLabel} ${requirement.number} ${requirement.title}`,
      value: requirement.id,
    }
  }),
)

const titlePlaceholder = computed(() => {
  if (props.kind === 'task') {
    return '请输入任务标题'
  }
  if (props.kind === 'defect') {
    return '请输入缺陷标题'
  }
  return '请输入需求标题'
})
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
