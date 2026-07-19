<template>
  <span class="status-tag" :class="`status-tag--${tone}`">
    <span class="status-tag__dot" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  }>(),
  {
    tone: 'neutral',
  },
)
</script>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  padding: 0 10px;
  color: var(--status-tone);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  background: color-mix(in srgb, var(--status-tone) 10%, white);
  border: var(--border-width) solid
    color-mix(in srgb, var(--status-tone) 22%, white);
  border-radius: var(--radius-sm);
}

.status-tag__dot {
  width: 6px;
  height: 6px;
  background: var(--status-tone);
  border-radius: var(--radius-full);
}

.status-tag--primary {
  --status-tone: var(--color-primary);
}

.status-tag--success {
  --status-tone: var(--color-success);
}

.status-tag--warning {
  --status-tone: var(--color-warning);
}

.status-tag--danger {
  --status-tone: var(--color-danger);
}

.status-tag--info {
  --status-tone: var(--color-info);
}

.status-tag--neutral {
  --status-tone: var(--color-text-muted);
}
</style>
