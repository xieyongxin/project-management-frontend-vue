<template>
  <div class="empty-state">
    <div class="empty-state__mark">
      <slot name="icon" />
    </div>
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="description" class="empty-state__description">
      {{ description }}
    </p>
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped>
.empty-state {
  display: grid;
  min-height: 220px;
  place-items: center;
  align-content: center;
  gap: var(--space-1);
  padding: var(--space-4);
  color: var(--color-text-muted);
  text-align: center;
}

.empty-state__mark {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  color: var(--color-primary);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-lg);
}

.empty-state__title {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.empty-state__description {
  max-width: 360px;
  margin: 0;
  font-size: var(--font-size-body-sm);
}
</style>
