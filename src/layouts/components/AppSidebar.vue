<template>
  <aside
    class="app-sidebar"
    :style="{
      width: collapsed
        ? 'var(--app-sidebar-collapsed-width)'
        : 'var(--app-sidebar-width)',
    }"
  >
    <SidebarLogo :collapsed="collapsed" />
    <SidebarMenu :navigation="navigation" :collapsed="collapsed" />

    <div class="border-divider flex-none border-t p-[var(--space-1)]">
      <ElTooltip v-if="collapsed" content="展开菜单" placement="right">
        <AppButton
          text
          class="w-full"
          :aria-label="collapsed ? '展开菜单' : '收起菜单'"
          @click="emit('toggleCollapse')"
        >
          <ElIcon><Expand /></ElIcon>
        </AppButton>
      </ElTooltip>
      <AppButton
        v-else
        text
        class="w-full"
        aria-label="收起菜单"
        @click="emit('toggleCollapse')"
      >
        <ElIcon><Fold /></ElIcon>
        <span>收起菜单</span>
      </AppButton>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'
import { AppButton } from '@/shared/components'
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

<style scoped>
.app-sidebar {
  display: flex;
  height: 100%;
  flex: none;
  flex-direction: column;
  overflow: hidden;
  background: var(--app-sidebar-background);
  border-right: var(--border-width) solid var(--color-divider);
  box-shadow: var(--shadow-sm);
}
</style>
