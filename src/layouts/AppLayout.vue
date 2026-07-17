<template>
  <div
    class="flex h-[100dvh] min-w-[var(--layout-app-min-width)] overflow-hidden"
  >
    <AppSidebar
      :navigation="navigation"
      :collapsed="appShell.sidebarCollapsed"
      @toggle-collapse="appShell.toggleSidebar"
    />

    <div class="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <AppHeader
        :user="user"
        :search="search"
        :notifications="notifications"
        :logout-loading="logoutLoading"
        @logout="emit('logout')"
      />

      <main class="bg-app min-h-0 min-w-0 flex-1 overflow-y-auto">
        <PageContainer>
          <RouterView />
        </PageContainer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import PageContainer from './components/PageContainer.vue'
import { useAppShellStore } from './model/app-shell.store'
import type { AppLayoutProps } from './model/app-layout.types'

defineProps<AppLayoutProps>()

const emit = defineEmits<{
  logout: []
}>()
const appShell = useAppShellStore()
</script>
