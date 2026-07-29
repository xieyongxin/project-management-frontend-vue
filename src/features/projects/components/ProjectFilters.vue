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
  </FilterBar>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { AppInput, AppSelect, FilterBar } from '@/shared/components'
import type { ProjectListQuery } from '../model/project-list-query'
import type { ProjectTemplateType } from '../model/project.types'
import { methodLabel } from '../model/project-labels'

const props = defineProps<{
  query: ProjectListQuery
  projectTypes?: ProjectTemplateType[]
  ownerOptions?: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  keywordChange: [value: string]
  methodChange: [value: unknown]
  statusChange: [value: unknown]
  ownerChange: [value: unknown]
  riskStatusChange: [value: unknown]
}>()

const methodOptions = computed(
  () =>
    props.projectTypes?.map((item) => ({
      label: methodLabel[item.method] ?? item.name,
      value: item.method,
    })) ?? [],
)
const filterOwnerOptions = computed(() => props.ownerOptions ?? [])
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
