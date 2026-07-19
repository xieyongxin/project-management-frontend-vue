<template>
  <ElDropdown trigger="click" placement="bottom-end" @command="handleCommand">
    <AppButton
      text
      class="h-[var(--control-height-lg)] max-w-64 px-[var(--space-1)]"
      :aria-label="`用户菜单：${user.displayName}`"
    >
      <span class="flex min-w-0 items-center gap-[var(--space-1)]">
        <ElAvatar :size="40" :src="user.avatarUrl">
          {{ avatarFallback }}
        </ElAvatar>
        <span class="min-w-0 text-left">
          <ElTooltip :content="user.displayName" placement="bottom">
            <span class="block max-w-40 truncate font-semibold">
              {{ user.displayName }}
            </span>
          </ElTooltip>
          <ElTooltip :content="user.roleLabel" placement="bottom">
            <span
              class="text-muted block max-w-40 truncate text-[var(--font-size-caption)]"
            >
              {{ user.roleLabel }}
            </span>
          </ElTooltip>
        </span>
      </span>
    </AppButton>

    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem command="logout" :disabled="logoutLoading">
          <ElIcon>
            <Loading v-if="logoutLoading" />
            <SwitchButton v-else />
          </ElIcon>
          {{ logoutLoading ? '正在退出…' : '退出登录' }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<script setup lang="ts">
import { Loading, SwitchButton } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { AppButton } from '@/shared/components'
import type { AppUserSummary } from '../model/app-layout.types'

const props = defineProps<{
  user: AppUserSummary
  logoutLoading: boolean
}>()
const emit = defineEmits<{
  logout: []
}>()
const avatarFallback = computed(
  () => props.user.displayName.trim().slice(0, 1) || '?',
)

const handleCommand = (command: string | number | object) => {
  if (command === 'logout' && !props.logoutLoading) {
    emit('logout')
  }
}
</script>
