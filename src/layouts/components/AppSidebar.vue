<template>
  <aside
    class="border-divider bg-surface flex h-full flex-none flex-col overflow-hidden border-r shadow-sm"
    :style="{
      width: collapsed
        ? 'var(--layout-sidebar-collapsed-width)'
        : 'var(--layout-sidebar-width)',
    }"
  >
    <SidebarLogo :collapsed="collapsed" />
    <SidebarMenu :navigation="navigation" />

    <div class="border-divider flex-none border-t p-[var(--space-1)]">
      <ElTooltip v-if="collapsed" content="展开菜单" placement="right">
        <ElButton
          text
          class="w-full"
          :aria-label="collapsed ? '展开菜单' : '收起菜单'"
          @click="emit('toggleCollapse')"
        >
          <ElIcon><Expand /></ElIcon>
        </ElButton>
      </ElTooltip>
      <ElButton
        v-else
        text
        class="w-full"
        aria-label="收起菜单"
        @click="emit('toggleCollapse')"
      >
        <ElIcon><Fold /></ElIcon>
        <span>收起菜单</span>
      </ElButton>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'
import type { AppNavigationNode } from '../model/app-layout.types'
import SidebarLogo from './SidebarLogo.vue'
import SidebarMenu from './SidebarMenu.vue'

defineProps<{
  navigation: readonly AppNavigationNode[]
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggleCollapse: []
}>()
</script>
