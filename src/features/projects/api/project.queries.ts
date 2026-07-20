import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import {
  createProject,
  getProject,
  getProjectCreateTemplate,
  getProjectNavigation,
  getProjectOverview,
  getProjectStats,
  getProjects,
} from '@/shared/api/generated/auth-api'
import type { ProjectCreateRequest } from '@/shared/api/generated/models'
import { toProjectRequestParams } from '../model/project-list-query'
import type { ProjectListQuery } from '../model/project-list-query'
import { projectKeys } from './project.keys'

export const useProjects = (query: MaybeRefOrGetter<ProjectListQuery>) =>
  useQuery({
    queryKey: computed(() => projectKeys.list(toValue(query))),
    queryFn: () => getProjects(toProjectRequestParams(toValue(query))),
  })

export const useProjectStats = (query: MaybeRefOrGetter<ProjectListQuery>) =>
  useQuery({
    queryKey: computed(() => projectKeys.stats(toValue(query))),
    queryFn: () => getProjectStats(toProjectRequestParams(toValue(query))),
  })

export const useProjectCreateTemplate = () =>
  useQuery({
    queryKey: projectKeys.createTemplate(),
    queryFn: getProjectCreateTemplate,
  })

export const useProject = (projectId: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.detail(toValue(projectId))),
    queryFn: () => getProject(toValue(projectId)),
  })

export const useProjectNavigation = (projectId: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.navigation(toValue(projectId))),
    queryFn: () => getProjectNavigation(toValue(projectId)),
  })

export const useProjectOverview = (projectId: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => projectKeys.overview(toValue(projectId))),
    queryFn: () => getProjectOverview(toValue(projectId)),
  })

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProjectCreateRequest) => createProject(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
