<template>
  <header class="page-header">
    <div class="min-w-0">
      <p v-if="breadcrumb" class="page-header__breadcrumb">{{ breadcrumb }}</p>
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="description" class="page-header__description">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  breadcrumb?: string
  description?: string
}>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: 72px;
}

.page-header__breadcrumb,
.page-header__description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-normal);
}

.page-header__title {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.page-header__description {
  margin-top: var(--space-1);
}

.page-header__actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-1);
}
</style>
