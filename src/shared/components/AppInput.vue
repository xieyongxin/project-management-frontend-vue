<template>
  <ElInput
    v-model="model"
    class="app-input"
    :class="{ 'app-input--auth': variant === 'auth' }"
    :type="type"
    :size="size"
    :show-password="type === 'password'"
    v-bind="$attrs"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </ElInput>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    type?: 'text' | 'password' | 'textarea'
    size?: 'large' | 'default' | 'small'
    variant?: 'default' | 'auth'
  }>(),
  {
    type: 'text',
    size: 'default',
    variant: 'default',
  },
)

const model = defineModel<string | number>({ default: '' })
</script>

<style scoped>
.app-input {
  --app-input-current-height: var(--app-input-height);
}

.app-input--auth {
  --app-input-current-height: var(--auth-control-height);
}

.app-input :deep(.el-input__wrapper),
.app-input :deep(.el-textarea__inner) {
  min-height: var(--app-input-current-height);
  border-radius: var(--app-radius-md);
  background: var(--color-bg-surface);
  box-shadow: 0 0 0 1px var(--app-border-color) inset;
}

.app-input :deep(.el-input__wrapper.is-focus),
.app-input :deep(.el-textarea__inner:focus) {
  box-shadow:
    0 0 0 1px var(--app-primary) inset,
    0 0 0 3px var(--color-focus);
}

.app-input :deep(.el-input__inner::placeholder),
.app-input :deep(.el-textarea__inner::placeholder) {
  color: var(--app-text-placeholder);
}

.app-input--auth :deep(.el-input__wrapper),
.app-input--auth :deep(.el-textarea__inner) {
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 0 0 1px #d8e4f5 inset;
}

.app-input--auth :deep(.el-input__wrapper.is-focus),
.app-input--auth :deep(.el-textarea__inner:focus) {
  box-shadow:
    0 0 0 1px #1677ff inset,
    0 0 0 4px rgba(22, 119, 255, 0.08);
}
</style>
