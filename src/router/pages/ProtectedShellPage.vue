<template>
  <AuthGate>
    <template #default="{ user }">
      <AppLayout
        :navigation="
          filterNavigationByPermissions(appNavigation, user.permissions)
        "
        :user="{
          displayName: user.displayName,
          roleLabel: user.roles.join(' / ') || '成员',
        }"
        :search="{
          placeholder: '搜索功能、项目或内容',
          ariaLabel: '全局搜索',
        }"
        :notifications="{ count: 0, emptyDescription: '暂无通知' }"
        :logout-loading="logout.isPending.value"
        @logout="handleLogout"
      />
    </template>
  </AuthGate>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AuthGate, useLogout } from '@/features/auth'
import { AppLayout } from '@/layouts'
import { appNavigation, filterNavigationByPermissions } from '../navigation'

const router = useRouter()
const logout = useLogout()

const handleLogout = () => {
  logout.mutate(undefined, {
    onSuccess: () => void router.replace('/login'),
  })
}
</script>
