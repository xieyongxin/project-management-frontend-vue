<template>
  <header class="app-header">
    <HeaderActions
      :user="user"
      :search="search"
      :notifications="notifications"
      :logout-loading="logoutLoading"
      @logout="emit('logout')"
    />
  </header>
</template>

<script setup lang="ts">
import type { AppLayoutProps } from '../model/app-layout.types'
import HeaderActions from './HeaderActions.vue'

defineProps<
  Pick<AppLayoutProps, 'user' | 'search' | 'notifications' | 'logoutLoading'>
>()

const emit = defineEmits<{
  logout: []
}>()
</script>

<style scoped>
.app-header {
  z-index: var(--z-header);
  display: flex;
  height: var(--app-header-height);
  flex: none;
  align-items: center;
  padding-inline: var(--app-header-padding-inline);
  background: var(--app-header-background);
  border-bottom: var(--border-width) solid var(--color-divider);
  box-shadow: var(--shadow-sm);
}
</style>
