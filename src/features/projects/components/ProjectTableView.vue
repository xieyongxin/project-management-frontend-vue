<template>
  <DataTableShell>
    <ElTable
      v-loading="loading"
      :data="projects"
      row-key="id"
      @row-click="emit('open', $event)"
    >
      <ElTableColumn label="项目名称" min-width="220">
        <template #default="{ row }: { row: ProjectSummary }">
          <div class="project-name-cell">
            <span class="project-name-cell__icon">{{
              row.name.slice(0, 1)
            }}</span>
            <div>
              <strong>{{ row.name }}</strong>
              <p>
                {{ row.identifier }}
                <span>· {{ visibilityLabel[row.visibility] }}</span>
              </p>
            </div>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="项目类型" width="120">
        <template #default="{ row }: { row: ProjectSummary }">
          <StatusTag
            :label="methodLabel[row.method]"
            :tone="row.method === 'scrum' ? 'primary' : 'info'"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="状态" width="110">
        <template #default="{ row }: { row: ProjectSummary }">
          <StatusTag
            :label="statusLabel[row.status]"
            :tone="statusTone[row.status]"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="负责人" width="130">
        <template #default="{ row }: { row: ProjectSummary }">
          {{ row.owner.display_name }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="current_stage"
        label="当前迭代/阶段"
        min-width="160"
      />
      <ElTableColumn label="进度概览" min-width="150">
        <template #default="{ row }: { row: ProjectSummary }">
          <ElProgress
            :percentage="row.task_completion_rate"
            :stroke-width="6"
            :show-text="false"
          />
          <span class="project-progress-text">
            {{ row.task_completion_rate }}% ·
            {{ row.requirement_completion_rate }}% 需求
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="质量概览" width="120">
        <template #default="{ row }: { row: ProjectSummary }">
          <strong>{{ row.test_pass_rate }}</strong>
          <p class="project-progress-text">
            缺陷：{{ row.blocker_or_critical_defect_count }}
          </p>
        </template>
      </ElTableColumn>
      <ElTableColumn label="健康度" width="110">
        <template #default="{ row }: { row: ProjectSummary }">
          <StatusTag
            :label="healthLabel[row.health_status]"
            :tone="healthTone[row.health_status]"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="updated_at" label="更新时间" width="150" />
      <ElTableColumn label="操作" width="100" fixed="right">
        <template #default="{ row }: { row: ProjectSummary }">
          <AppButton link type="primary" @click.stop="emit('open', row)">
            查看
          </AppButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <div class="project-pagination">
      <span>共 {{ total }} 条</span>
      <ElPagination
        background
        layout="prev, pager, next, sizes"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        @update:current-page="emit('pageChange', $event)"
        @update:page-size="emit('pageSizeChange', $event)"
      />
    </div>
  </DataTableShell>
</template>

<script setup lang="ts">
import { AppButton, DataTableShell, StatusTag } from '@/shared/components'
import {
  healthLabel,
  healthTone,
  methodLabel,
  statusLabel,
  statusTone,
  visibilityLabel,
} from '../model/project-labels'
import type { ProjectSummary } from '../model/project.types'

defineProps<{
  projects: ProjectSummary[]
  loading: boolean
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  open: [project: ProjectSummary]
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()
</script>

<style scoped>
.project-name-cell {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.project-name-cell__icon {
  display: grid;
  flex: none;
  width: 40px;
  height: 40px;
  place-items: center;
  color: white;
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary);
  border-radius: var(--radius-md);
}

.project-name-cell strong {
  font-weight: var(--font-weight-semibold);
}

.project-name-cell p,
.project-progress-text {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.project-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2);
  color: var(--color-text-secondary);
}
</style>
