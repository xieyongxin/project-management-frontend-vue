<template>
  <dl class="requirement-summary-bar">
    <div
      v-for="item in items"
      :key="item.label"
      class="requirement-summary-bar__item"
    >
      <dt>{{ item.label }}</dt>
      <dd>
        <span
          v-if="item.tone"
          class="requirement-summary-bar__dot"
          :class="`is-${item.tone}`"
        />
        {{ item.value || '-' }}
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
export interface RequirementSummaryItem {
  label: string
  value: string
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
}

defineProps<{
  items: RequirementSummaryItem[]
}>()
</script>

<style scoped>
.requirement-summary-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  min-height: 72px;
  margin: 0;
  padding: 12px 16px;
  background: var(--color-bg-surface);
  border: 1px solid rgba(40, 70, 100, 0.12);
  border-radius: 8px;
}

.requirement-summary-bar__item {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 0 14px;
  border-left: 1px solid rgba(40, 70, 100, 0.1);
}

.requirement-summary-bar__item:first-child {
  padding-left: 0;
  border-left: 0;
}

.requirement-summary-bar__item:last-child {
  padding-right: 0;
}

.requirement-summary-bar dt {
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1;
}

.requirement-summary-bar dd {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  margin: 0;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.requirement-summary-bar__dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

.requirement-summary-bar__dot.is-primary {
  background: var(--color-primary);
}

.requirement-summary-bar__dot.is-success {
  background: var(--color-success);
}

.requirement-summary-bar__dot.is-warning {
  background: var(--color-warning);
}

.requirement-summary-bar__dot.is-danger {
  background: var(--color-danger);
}

.requirement-summary-bar__dot.is-neutral {
  background: var(--color-text-muted);
}

@media (max-width: 1100px) {
  .requirement-summary-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 14px;
  }

  .requirement-summary-bar__item:nth-child(odd) {
    padding-left: 0;
    border-left: 0;
  }
}

@media (max-width: 720px) {
  .requirement-summary-bar {
    grid-template-columns: 1fr;
  }

  .requirement-summary-bar__item {
    padding: 0;
    border-left: 0;
  }
}
</style>
