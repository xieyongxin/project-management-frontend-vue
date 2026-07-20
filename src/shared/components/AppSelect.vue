<template>
  <ElSelect
    v-model="model"
    class="app-select"
    :class="{ 'app-select--compact': variant === 'compact' }"
    :multiple="multiple"
    :clearable="clearable"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    v-bind="$attrs"
  >
    <slot>
      <ElOption
        v-for="option in options"
        :key="String(option.value)"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </ElSelect>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

export type AppSelectValue =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly number[]
  | readonly boolean[]
  | undefined

export interface AppSelectOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

withDefaults(
  defineProps<{
    options?: readonly AppSelectOption[]
    multiple?: boolean
    clearable?: boolean
    placeholder?: string
    disabled?: boolean
    loading?: boolean
    variant?: 'default' | 'compact'
  }>(),
  {
    options: () => [],
    multiple: false,
    clearable: false,
    placeholder: '',
    disabled: false,
    loading: false,
    variant: 'default',
  },
)

const model = defineModel<AppSelectValue>({ default: undefined })
</script>

<style scoped>
.app-select {
  width: 100%;
}

.app-select :deep(.el-select__wrapper) {
  min-height: var(--app-control-height);
  border-radius: var(--app-radius-md);
  background: var(--color-bg-surface);
  box-shadow: 0 0 0 1px var(--app-border-color) inset;
}

.app-select :deep(.el-select__wrapper.is-focused) {
  box-shadow:
    0 0 0 1px var(--app-primary) inset,
    0 0 0 3px var(--color-focus);
}

.app-select :deep(.el-select__placeholder) {
  color: var(--app-text-placeholder);
}

.app-select--compact :deep(.el-select__wrapper) {
  min-height: var(--control-height-sm);
}
</style>
