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
      :model-value="query.riskStatus"
      clearable
      placeholder="风险状态"
      :options="riskStatusOptions"
      @update:model-value="emit('riskStatusChange', $event)"
    />
    <AppButton plain>
      <ElIcon><Filter /></ElIcon>
      高级筛选
    </AppButton>
  </FilterBar>
</template>

<script setup lang="ts">
import { Filter, Search } from '@element-plus/icons-vue'
import { AppButton, AppInput, AppSelect, FilterBar } from '@/shared/components'
import type { ProjectListQuery } from '../model/project-list-query'

defineProps<{
  query: ProjectListQuery
}>()

const emit = defineEmits<{
  keywordChange: [value: string]
  methodChange: [value: unknown]
  statusChange: [value: unknown]
  riskStatusChange: [value: unknown]
}>()

const methodOptions = [
  { label: 'Scrum', value: 'scrum' },
  { label: 'Waterfall', value: 'waterfall' },
]
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
</style>
