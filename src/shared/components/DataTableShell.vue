<template>
  <section class="data-table-shell">
    <slot />
  </section>
</template>

<style scoped>
.data-table-shell {
  overflow: hidden;
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
</style>
