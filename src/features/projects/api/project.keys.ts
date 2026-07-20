import type { ProjectListQuery } from '../model/project-list-query'

export const projectKeys = {
  all: ['projects'] as const,
  list: (query: ProjectListQuery) =>
    [...projectKeys.all, 'list', query] as const,
  stats: (query: ProjectListQuery) =>
    [...projectKeys.all, 'stats', query] as const,
  createTemplate: () => [...projectKeys.all, 'create-template'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
  navigation: (id: string) =>
    [...projectKeys.detail(id), 'navigation'] as const,
  overview: (id: string) => [...projectKeys.detail(id), 'overview'] as const,
}
