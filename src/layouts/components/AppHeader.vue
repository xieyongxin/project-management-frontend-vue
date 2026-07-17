<template>
  <header
    class="bg-surface z-[var(--z-header)] flex flex-none items-center shadow-sm"
    :style="{
      height: 'var(--layout-header-height)',
      paddingInline: 'var(--layout-content-padding)',
      borderBottom: 'var(--border-width) solid var(--color-border)',
    }"
  >
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
