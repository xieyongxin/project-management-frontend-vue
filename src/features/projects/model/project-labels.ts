import type { ProjectSummaryDto } from '@/shared/api/generated/models'

export const methodLabel: Record<ProjectSummaryDto['method'], string> = {
  scrum: '敏捷项目',
  waterfall: '瀑布项目',
}

export const statusLabel: Record<ProjectSummaryDto['status'], string> = {
  active: '进行中',
  paused: '暂停',
  archived: '已归档',
}

export const statusTone = {
  active: 'primary',
  paused: 'warning',
  archived: 'neutral',
} as const

export const healthLabel: Record<ProjectSummaryDto['health_status'], string> = {
  healthy: '健康',
  attention: '关注',
  risk: '风险',
}

export const healthTone = {
  healthy: 'success',
  attention: 'warning',
  risk: 'danger',
} as const

export const visibilityLabel: Record<ProjectSummaryDto['visibility'], string> =
  {
    private: '私有',
    public: '公开',
  }
