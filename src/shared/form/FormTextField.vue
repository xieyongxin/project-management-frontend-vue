<template>
  <ElFormItem :label="hideLabel ? undefined : label" :error="error">
    <AppInput
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :size="size"
      :variant="variant"
    >
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
    </AppInput>
  </ElFormItem>
</template>

<script setup lang="ts">
import { AppInput } from '@/shared/components'

withDefaults(
  defineProps<{
    label: string
    hideLabel?: boolean
    type?: 'text' | 'password'
    placeholder?: string | undefined
    autocomplete?: string | undefined
    size?: 'large' | 'default' | 'small'
    variant?: 'default' | 'auth'
    error?: string | undefined
  }>(),
  {
    hideLabel: false,
    type: 'text',
    size: 'default',
    variant: 'default',
  },
)

const model = defineModel<string>({ required: true })
</script>
