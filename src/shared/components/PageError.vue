<template>
  <div class="flex min-h-screen items-center justify-center p-[var(--space-3)]">
    <ElResult icon="error" :title="title" :sub-title="description">
      <template #extra>
        <AppButton type="primary" @click="emit('retry')">重试</AppButton>
      </template>
    </ElResult>
  </div>
</template>

<script setup lang="ts">
import AppButton from './AppButton.vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '页面加载失败',
    description: '请稍后重试，或联系系统管理员。',
  },
)

const emit = defineEmits<{
  retry: []
}>()
</script>
