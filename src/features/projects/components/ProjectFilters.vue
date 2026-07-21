<template>
  <FilterBar>
    <AppInput
      :model-value="query.keyword"
      class="project-filter__keyword"
      clearable
      placeholder="搜索项目名称、项目标识"
      @update:model-value="(value) => emit('keywordChange', String(value))"
    >
      <template #prefix>
        <ElIcon><Search /></ElIcon>
      </template>
    </AppInput>
    <AppSelect
      :model-value="query.method"
      clearable
      placeholder="项目类型"
      :options="methodOptions"
      @update:model-value="emit('methodChange', $event)"
    />
    <AppSelect
      :model-value="query.status"
      clearable
      placeholder="项目状态"
      :options="statusOptions"
      @update:model-value="emit('statusChange', $event)"
    />
    <AppSelect
      :model-value="query.ownerId"
      clearable
      placeholder="负责人"
      :options="filterOwnerOptions"
      @update:model-value="emit('ownerChange', $event)"
    />
    <AppSelect
      :model-value="query.riskStatus"
      clearable
      placeholder="风险状态"
      :options="riskStatusOptions"
      @update:model-value="emit('riskStatusChange', $event)"
    />
    <ElSwitch
      v-if="canViewAllProjects"
      :model-value="query.scope === 'all'"
      active-text="全部项目"
      inactive-text="可见项目"
      @update:model-value="emit('scopeChange', $event ? 'all' : 'visible')"
    />
    <AppButton plain>
      <ElIcon><Filter /></ElIcon>
      高级筛选
    </AppButton>
  </FilterBar>
</template>

<script setup lang="ts">
import { Filter, Search } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { AppButton, AppInput, AppSelect, FilterBar } from '@/shared/components'
import type { ProjectListQuery } from '../model/project-list-query'
import type { ProjectTemplateType } from '../model/project.types'

const props = defineProps<{
  query: ProjectListQuery
  projectTypes?: ProjectTemplateType[]
  ownerOptions?: { label: string; value: string }[]
  isSystemAdmin?: boolean
}>()

const emit = defineEmits<{
  keywordChange: [value: string]
  methodChange: [value: unknown]
  statusChange: [value: unknown]
  ownerChange: [value: unknown]
  scopeChange: [value: unknown]
  riskStatusChange: [value: unknown]
}>()

const methodOptions = computed(
  () =>
    props.projectTypes?.map((item) => ({
      label: item.name,
      value: item.method,
    })) ?? [],
)
const filterOwnerOptions = computed(() => props.ownerOptions ?? [])
const canViewAllProjects = computed(() => props.isSystemAdmin ?? false)
const statusOptions = [
  { label: '进行中', value: 'active' },
  { label: '暂停', value: 'paused' },
  { label: '已归档', value: 'archived' },
]
const riskStatusOptions = [
  { label: '健康', value: 'healthy' },
  { label: '关注', value: 'attention' },
  { label: '风险', value: 'risk' },
]
</script>

<style scoped>
.project-filter__keyword {
  width: 300px;
}

:deep(.app-select) {
  width: 180px;
}
</style>
