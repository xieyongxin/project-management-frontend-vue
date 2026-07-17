<template>
  <ElFormItem :label="hideLabel ? undefined : label" :error="error">
    <ElInput
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :size="size"
      :show-password="type === 'password'"
    >
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
    </ElInput>
  </ElFormItem>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    hideLabel?: boolean
    type?: 'text' | 'password'
    placeholder?: string | undefined
    autocomplete?: string | undefined
    size?: 'large' | 'default' | 'small'
    error?: string | undefined
  }>(),
  {
    hideLabel: false,
    type: 'text',
    size: 'default',
  },
)

const model = defineModel<string>({ required: true })
</script>
