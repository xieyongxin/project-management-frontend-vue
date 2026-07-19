<template>
  <div class="auth-hero">
    <h1 class="auth-hero-title">
      <span>{{ titleLines[0] }}</span>
      <span>{{ titleLines[1] }}</span>
    </h1>
    <p v-if="subtitle" class="auth-hero-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    titleLines?: readonly [string, string]
    subtitle?: string
  }>(),
  {
    titleLines: () => ['连接每一次协作，', '推动每一次交付'],
    subtitle: '',
  },
)
</script>

<style scoped>
.auth-hero {
  display: grid;
  gap: var(--app-space-sm);
}

.auth-hero-subtitle {
  max-width: 560px;
  margin: 0;
  color: var(--app-text-secondary);
  font-size: var(--font-size-body-lg);
  line-height: var(--line-height-relaxed);
}
</style>
