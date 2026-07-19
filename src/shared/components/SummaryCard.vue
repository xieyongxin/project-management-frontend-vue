<template>
  <button
    class="summary-card"
    :class="[`summary-card--${tone}`, { 'is-active': active }]"
    type="button"
  >
    <span class="summary-card__icon">
      <slot name="icon" />
    </span>
    <span class="summary-card__content">
      <span class="summary-card__label">{{ label }}</span>
      <span class="summary-card__value">{{ value }}</span>
      <span v-if="description" class="summary-card__description">
        {{ description }}
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    description?: string
    tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
    active?: boolean
  }>(),
  {
    tone: 'primary',
    active: false,
  },
)
</script>

<style scoped>
.summary-card {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  min-height: 104px;
  padding: var(--space-3);
  text-align: left;
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition:
    border-color var(--duration-normal) var(--ease-standard),
    box-shadow var(--duration-normal) var(--ease-standard),
    transform var(--duration-normal) var(--ease-standard);
}

.summary-card:hover,
.summary-card.is-active {
  border-color: var(--summary-tone);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.summary-card__icon {
  display: grid;
  flex: none;
  width: 48px;
  height: 48px;
  place-items: center;
  color: var(--summary-tone);
  background: color-mix(in srgb, var(--summary-tone) 12%, white);
  border-radius: var(--radius-md);
}

.summary-card__content {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.summary-card__label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
}

.summary-card__value {
  color: var(--color-text-primary);
  font-size: 30px;
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.summary-card__description {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-card--primary {
  --summary-tone: var(--color-primary);
}

.summary-card--success {
  --summary-tone: var(--color-success);
}

.summary-card--warning {
  --summary-tone: var(--color-warning);
}

.summary-card--danger {
  --summary-tone: var(--color-danger);
}

.summary-card--info {
  --summary-tone: var(--color-info);
}

.summary-card--purple {
  --summary-tone: var(--color-secondary);
}
</style>
