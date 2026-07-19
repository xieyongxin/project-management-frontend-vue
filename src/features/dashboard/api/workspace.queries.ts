import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import {
  getMyTodos,
  getRecentActivity,
  getWorkspaceSummary,
} from '@/shared/api/generated/auth-api'
import { workspaceKeys } from './workspace.keys'

export const useWorkspaceSummary = () =>
  useQuery({
    queryKey: workspaceKeys.summary(),
    queryFn: getWorkspaceSummary,
  })

export const useMyTodos = (type: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => workspaceKeys.todos(toValue(type))),
    queryFn: () =>
      getMyTodos({
        type: toValue(type) as
          'all' | 'requirement' | 'task' | 'test' | 'defect',
      }),
  })

export const useRecentActivity = () =>
  useQuery({
    queryKey: workspaceKeys.activity(),
    queryFn: getRecentActivity,
  })
