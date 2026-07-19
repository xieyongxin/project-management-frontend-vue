<template>
  <nav
    :aria-label="collapsed ? '主导航，已收起' : '主导航'"
    class="min-h-0 flex-1 overflow-y-auto"
  >
    <ElMenu
      :class="['app-sidebar-menu', { 'is-collapsed': collapsed }]"
      mode="vertical"
      :default-active="selectedKey"
      :default-openeds="openKeys"
      :collapse="collapsed"
      :collapse-transition="false"
      @select="handleSelect"
    >
      <template v-for="node in navigation" :key="node.key">
        <ElSubMenu
          v-if="node.children?.length"
          :index="node.key"
          :aria-label="node.label"
        >
          <template #title>
            <ElIcon v-if="node.icon"><component :is="node.icon" /></ElIcon>
            <span>{{ node.label }}</span>
          </template>
          <ElMenuItem
            v-for="child in node.children"
            :key="child.key"
            :index="child.key"
            :aria-label="child.label"
          >
            <ElIcon v-if="child.icon"><component :is="child.icon" /></ElIcon>
            <span>{{ child.label }}</span>
          </ElMenuItem>
        </ElSubMenu>

        <ElMenuItem v-else :index="node.key" :aria-label="node.label">
          <ElIcon v-if="node.icon"><component :is="node.icon" /></ElIcon>
          <template #title>
            <span>{{ node.label }}</span>
          </template>
        </ElMenuItem>
      </template>
    </ElMenu>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AppNavigationNode } from '../model/app-layout.types'
import {
  findBestNavigationMatch,
  findNavigationPathByKey,
} from '../model/navigation'

const props = defineProps<{
  navigation: readonly AppNavigationNode[]
  collapsed: boolean
}>()

const route = useRoute()
const router = useRouter()
const requestedOpenKeys = ref<string[]>([])
const selectedMatch = computed(() =>
  findBestNavigationMatch(props.navigation, route.path),
)
const selectedKey = computed(() => selectedMatch.value?.key ?? '')
const openKeys = computed(() => [
  ...new Set([
    ...requestedOpenKeys.value,
    ...(selectedMatch.value?.ancestorKeys ?? []),
  ]),
])

const handleSelect = (key: string) => {
  const path = findNavigationPathByKey(props.navigation, key)

  if (path && path !== route.path) {
    void router.push(path)
  }
}
</script>

<style scoped>
.app-sidebar-menu {
  border-right: 0;
  background: transparent;
  padding-block: var(--space-1);
  width: 100%;
}

.app-sidebar-menu :deep(.el-menu-item),
.app-sidebar-menu :deep(.el-sub-menu__title) {
  height: var(--control-height-lg);
  margin-inline: var(--space-1);
  border-radius: var(--radius-md);
  line-height: var(--control-height-lg);
}

.app-sidebar-menu.is-collapsed :deep(.el-menu-item),
.app-sidebar-menu.is-collapsed :deep(.el-sub-menu__title) {
  justify-content: center;
  padding-inline: 0;
}

.app-sidebar-menu.is-collapsed :deep(.el-icon) {
  margin-right: 0;
}
</style>
