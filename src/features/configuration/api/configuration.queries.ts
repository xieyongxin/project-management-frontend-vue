import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  getCurrentUser,
  getProjectTypeConfigs,
  getRoleDefinitions,
  getWorkflowDefinitions,
  restoreDefaultWorkflowDefinition,
  updateProjectTypeConfig,
  updateRoleDefinition,
  updateWorkflowDefinition,
} from '@/shared/api/generated/auth-api'
import type {
  ProjectTypeConfigDto,
  RoleDto,
  WorkflowDto,
} from '@/shared/api/generated/models'
import { configurationKeys } from './configuration.keys'

export const useProjectTypeConfigs = () =>
  useQuery({
    queryKey: configurationKeys.projectTypes(),
    queryFn: getProjectTypeConfigs,
  })

export const useWorkflowDefinitions = () =>
  useQuery({
    queryKey: configurationKeys.workflows(),
    queryFn: getWorkflowDefinitions,
  })

export const useRoleDefinitions = () =>
  useQuery({
    queryKey: configurationKeys.roles(),
    queryFn: getRoleDefinitions,
  })

export const useConfigurationCurrentUser = () =>
  useQuery({
    queryKey: [...configurationKeys.all, 'current-user'] as const,
    queryFn: getCurrentUser,
  })

export const useSaveProjectTypeConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: ProjectTypeConfigDto) =>
      updateProjectTypeConfig(config.id, {
        row_version: config.row_version,
        tabs: config.tabs,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: configurationKeys.projectTypes(),
      })
    },
  })
}

export const useSaveWorkflowDefinition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workflow: WorkflowDto) =>
      updateWorkflowDefinition(workflow.id, {
        row_version: workflow.row_version,
        states: workflow.states,
        transitions: workflow.transitions,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: configurationKeys.workflows(),
      })
    },
  })
}

export const useRestoreWorkflowDefinition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workflow: WorkflowDto) =>
      restoreDefaultWorkflowDefinition(workflow.id, {
        row_version: workflow.row_version,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: configurationKeys.workflows(),
      })
    },
  })
}

export const useSaveRoleDefinition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (role: RoleDto) =>
      updateRoleDefinition(role.id, {
        row_version: role.row_version,
        name: role.name,
        description: role.description,
        scope: role.scope,
        enabled: role.enabled,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: configurationKeys.roles(),
      })
    },
  })
}
