<template>
  <div class="header-actions">
    <AppInput
      class="header-actions__search"
      clearable
      :aria-label="search?.ariaLabel ?? '全局搜索'"
      :placeholder="search?.placeholder ?? '搜索项目、任务或成员'"
    >
      <template #prefix>
        <ElIcon><Search /></ElIcon>
      </template>
    </AppInput>

    <div class="header-actions__tools">
      <ElPopover
        trigger="click"
        placement="bottom-end"
        title="通知"
        :width="240"
      >
        <template #reference>
          <ElBadge :value="notificationCount" :hidden="notificationCount === 0">
            <AppButton text :aria-label="notificationLabel">
              <ElIcon><Bell /></ElIcon>
            </AppButton>
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
import { AppButton, AppInput } from '@/shared/components'
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

<style scoped>
.header-actions {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
}

.header-actions__search {
  width: min(100%, 420px);
  margin-left: auto;
}

.header-actions__tools {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--space-1);
}
</style>
