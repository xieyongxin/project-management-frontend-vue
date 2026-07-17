<template>
  <div class="flex min-h-screen items-center justify-center p-[var(--space-3)]">
    <ElResult
      icon="error"
      title="页面加载失败"
      sub-title="请稍后重试，或联系系统管理员。"
    >
      <template #extra>
        <ElButton type="primary" @click="emit('retry')">重试</ElButton>
      </template>
    </ElResult>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  retry: []
}>()
</script>
