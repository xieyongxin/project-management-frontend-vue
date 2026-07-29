import type { LocationQuery } from 'vue-router'
import type { GetProjectsParams } from '@/shared/api/generated/models'

export type ProjectViewMode = 'table' | 'card'

export interface ProjectListQuery {
  keyword: string
  method: 'scrum' | 'waterfall' | undefined
  status: 'active' | 'paused' | 'archived' | undefined
  ownerId: string | undefined
  riskStatus: 'healthy' | 'attention' | 'risk' | undefined
  page: number
  pageSize: number
  view: ProjectViewMode
}

const first = (value: LocationQuery[string] | undefined) =>
  Array.isArray(value) ? value[0] : value

const isMethod = (
  value: string | null | undefined,
): value is ProjectListQuery['method'] =>
  value === 'scrum' || value === 'waterfall'

const isStatus = (
  value: string | null | undefined,
): value is ProjectListQuery['status'] =>
  value === 'active' || value === 'paused' || value === 'archived'

const isRiskStatus = (
  value: string | null | undefined,
): value is ProjectListQuery['riskStatus'] =>
  value === 'healthy' || value === 'attention' || value === 'risk'

const toPositiveInt = (value: string | null | undefined, fallback: number) => {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const parseProjectListQuery = (
  query: LocationQuery,
): ProjectListQuery => {
  const method = first(query.method)
  const status = first(query.status)
  const riskStatus = first(query.risk_status)
  let ownerId = first(query.owner_id)?.trim()
  if (ownerId === '') {
    ownerId = undefined
  }
  const view = first(query.view)

  return {
    keyword: first(query.keyword)?.trim() ?? '',
    method: isMethod(method) ? method : undefined,
    status: isStatus(status) ? status : undefined,
    ownerId,
    riskStatus: isRiskStatus(riskStatus) ? riskStatus : undefined,
    page: toPositiveInt(first(query.page), 1),
    pageSize: toPositiveInt(first(query.page_size), 10),
    view: view === 'card' ? 'card' : 'table',
  }
}

export const serializeProjectListQuery = (query: ProjectListQuery) => ({
  ...(query.keyword ? { keyword: query.keyword } : {}),
  ...(query.method ? { method: query.method } : {}),
  ...(query.status ? { status: query.status } : {}),
  ...(query.ownerId ? { owner_id: query.ownerId } : {}),
  ...(query.riskStatus ? { risk_status: query.riskStatus } : {}),
  ...(query.page > 1 ? { page: String(query.page) } : {}),
  ...(query.pageSize !== 10 ? { page_size: String(query.pageSize) } : {}),
  ...(query.view !== 'table' ? { view: query.view } : {}),
})

export const toProjectRequestParams = (
  query: ProjectListQuery,
): GetProjectsParams => {
  const params: GetProjectsParams = {
    page: query.page,
    page_size: query.pageSize,
  }

  if (query.keyword) {
    params.keyword = query.keyword
  }

  if (query.method) {
    params.method = query.method
  }

  if (query.status) {
    params.status = query.status
  }

  if (query.ownerId) {
    params.owner_id = query.ownerId
  }

  if (query.riskStatus) {
    params.risk_status = query.riskStatus
  }

  return params
}
