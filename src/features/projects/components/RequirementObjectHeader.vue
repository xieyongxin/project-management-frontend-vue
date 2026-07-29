<template>
  <header class="requirement-object-header">
    <div class="requirement-object-header__top">
      <div class="requirement-object-header__back">
        <slot name="back" />
      </div>
      <div class="requirement-object-header__actions">
        <slot name="actions" />
      </div>
    </div>

    <div class="requirement-object-header__title-row">
      <ElInput
        :model-value="modelValue"
        class="requirement-object-header__title-input"
        :placeholder="placeholder"
        @update:model-value="emit('update:modelValue', String($event))"
      />
      <span class="requirement-object-header__edit">编辑标题</span>
    </div>

    <div class="requirement-object-header__meta">
      <span v-if="number" class="requirement-object-header__badge">
        {{ number }}
      </span>
      <span class="requirement-object-header__badge">{{ kindLabel }}</span>
      <span v-if="context" class="requirement-object-header__meta-text">
        {{ context }}
      </span>
      <span v-if="status" class="requirement-object-header__status">
        <i :style="{ backgroundColor: statusColor || undefined }" />
        {{ status }}
      </span>
      <span v-if="priority" class="requirement-object-header__status">
        <i :class="`is-priority-${priorityTone}`" />
        {{ priority }}
      </span>
    </div>

    <div
      v-if="createdBy || createdAt || updatedAt"
      class="requirement-object-header__audit"
    >
      <span v-if="createdBy">创建人：{{ createdBy }}</span>
      <span v-if="createdAt">创建时间：{{ createdAt }}</span>
      <span v-if="updatedAt">更新于：{{ updatedAt }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ElInput } from 'element-plus'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    kindLabel?: string
    number?: string
    context?: string
    status?: string
    statusColor?: string
    priority?: string
    priorityTone?: 'high' | 'medium' | 'low'
    createdBy?: string
    createdAt?: string
    updatedAt?: string
  }>(),
  {
    placeholder: '请输入需求标题',
    kindLabel: '工作项',
    number: '',
    context: '',
    status: '',
    statusColor: '',
    priority: '',
    priorityTone: 'medium',
    createdBy: '',
    createdAt: '',
    updatedAt: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.requirement-object-header {
  position: sticky;
  top: 0;
  z-index: 6;
  display: grid;
  gap: 10px;
  padding: 16px 20px;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(40, 70, 100, 0.12);
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

.requirement-object-header__top,
.requirement-object-header__actions,
.requirement-object-header__meta,
.requirement-object-header__audit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.requirement-object-header__top {
  justify-content: space-between;
}

.requirement-object-header__back {
  min-width: 0;
}

.requirement-object-header__actions {
  justify-content: flex-end;
}

.requirement-object-header__title-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.requirement-object-header__title-input :deep(.el-input__wrapper) {
  min-height: 44px;
  padding: 0;
  background: transparent;
  border-radius: 6px;
  box-shadow: none;
}

.requirement-object-header__title-input :deep(.el-input__wrapper.is-focus) {
  padding: 0 10px;
  background: var(--color-bg-surface);
  box-shadow: 0 0 0 2px var(--color-focus);
}

.requirement-object-header__title-input :deep(.el-input__inner) {
  height: 44px;
  color: var(--color-text-primary);
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.requirement-object-header__edit,
.requirement-object-header__audit {
  color: var(--color-text-muted);
  font-size: 12px;
}

.requirement-object-header__badge,
.requirement-object-header__meta-text,
.requirement-object-header__status {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1;
  background: rgba(226, 232, 240, 0.55);
  border-radius: 6px;
}

.requirement-object-header__badge {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  background: rgba(37, 99, 235, 0.08);
}

.requirement-object-header__status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

.requirement-object-header__status i.is-priority-high {
  background: var(--color-danger);
}

.requirement-object-header__status i.is-priority-medium {
  background: var(--color-warning);
}

.requirement-object-header__status i.is-priority-low {
  background: var(--color-success);
}

@media (max-width: 960px) {
  .requirement-object-header {
    position: static;
  }

  .requirement-object-header__title-row {
    grid-template-columns: 1fr;
  }
}
</style>
