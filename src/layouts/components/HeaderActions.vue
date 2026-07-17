<template>
  <div
    class="flex w-full min-w-0 items-center justify-end gap-[var(--space-3)]"
  >
    <ElInput
      class="ml-auto w-full max-w-md"
      clearable
      :aria-label="search?.ariaLabel ?? '全局搜索'"
      :placeholder="search?.placeholder ?? '搜索项目、任务或成员'"
    >
      <template #prefix>
        <ElIcon><Search /></ElIcon>
      </template>
    </ElInput>

    <div class="flex flex-none items-center gap-[var(--space-1)]">
      <ElPopover
        trigger="click"
        placement="bottom-end"
        title="通知"
        :width="240"
      >
        <template #reference>
          <ElBadge :value="notificationCount" :hidden="notificationCount === 0">
            <ElButton text :aria-label="notificationLabel">
              <ElIcon><Bell /></ElIcon>
            </ElButton>
          </ElBadge>
        </template>
        <ElEmpty
          :image-size="72"
          :description="notifications?.emptyDescription ?? '暂无通知'"
        />
      </ElPopover>

      <UserDropdown
        :user="user"
        :logout-loading="logoutLoading"
        @logout="emit('logout')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bell, Search } from '@element-plus/icons-vue'
import { computed } from 'vue'
import type { AppLayoutProps } from '../model/app-layout.types'
import UserDropdown from './UserDropdown.vue'

const props =
  defineProps<
    Pick<AppLayoutProps, 'user' | 'search' | 'notifications' | 'logoutLoading'>
  >()

const emit = defineEmits<{
  logout: []
}>()
const notificationCount = computed(() =>
  Math.max(0, props.notifications?.count ?? 0),
)
const notificationLabel = computed(() =>
  notificationCount.value ? `通知，${notificationCount.value} 条未读` : '通知',
)
</script>
