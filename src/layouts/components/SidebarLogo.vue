<template>
  <RouterLink
    to="/"
    aria-label="返回仪表盘"
    :class="[
      'flex h-[var(--layout-header-height)] flex-none items-center',
      collapsed ? 'justify-center px-[var(--space-1)]' : 'px-[var(--space-3)]',
    ]"
  >
    <BrandMark :compact="collapsed" />
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BrandMark } from '@/shared/components'

defineProps<{
  collapsed: boolean
}>()
</script>
