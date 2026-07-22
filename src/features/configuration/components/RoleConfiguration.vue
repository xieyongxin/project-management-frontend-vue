<template>
  <section class="configuration-section configuration-panel">
    <PageHeader
      title="角色配置"
      description="维护项目成员、工作流和通知可使用的角色。"
    />
    <ElTable v-loading="loading" :data="roles">
      <ElTableColumn prop="name" label="角色名称" />
      <ElTableColumn prop="role_key" label="角色标识" />
      <ElTableColumn label="适用范围" width="120">
        <template #default="{ row }: { row: RoleConfig }">
          {{ row.scope === 'global' ? '全局' : '项目内' }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="启用状态" width="120">
        <template #default="{ row }: { row: RoleConfig }">
          <ElSwitch
            v-model="row.enabled"
            :disabled="row.is_system || !canWrite"
            @change="() => emit('saveRole', row)"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="是否内置" width="120">
        <template #default="{ row }: { row: RoleConfig }">
          <StatusTag
            :label="row.is_system ? '是' : '否'"
            :tone="row.is_system ? 'primary' : 'neutral'"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="updated_at" label="最后修改时间" />
    </ElTable>
  </section>
</template>

<script setup lang="ts">
import { PageHeader, StatusTag } from '@/shared/components'
import type { RoleConfig } from '../model/configuration.types'

defineProps<{
  roles: RoleConfig[]
  loading: boolean
  canWrite: boolean
}>()

const emit = defineEmits<{
  saveRole: [role: RoleConfig]
}>()
</script>

<style scoped>
.configuration-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.configuration-panel {
  padding: var(--space-3);
  background: var(--app-panel-background);
  border: var(--border-width) solid var(--app-panel-border);
  border-radius: var(--app-panel-radius);
  box-shadow: var(--app-panel-shadow);
}
</style>
