import { Folder, HomeFilled, Operation } from '@element-plus/icons-vue'
import type { Component } from 'vue'
import type { AppNavigationNode } from '@/layouts'

export const appNavigation = [
  {
    key: 'dashboard',
    label: '工作台',
    path: '/workspace',
    icon: HomeFilled,
  },
  {
    key: 'projects',
    label: '项目管理',
    path: '/projects',
    icon: Folder,
  },
  {
    key: 'configuration',
    label: '配置中心',
    path: '/configuration/project-types',
    icon: Operation,
  },
] satisfies readonly (Omit<AppNavigationNode, 'icon'> & {
  icon: Component
})[]

const hasEveryPermission = (
  grantedPermissions: ReadonlySet<string>,
  requiredPermissions: readonly string[],
) =>
  requiredPermissions.every((permission) => grantedPermissions.has(permission))

export const filterNavigationByPermissions = (
  navigation: readonly AppNavigationNode[],
  grantedPermissions: ReadonlySet<string>,
): readonly AppNavigationNode[] =>
  navigation.flatMap((node): AppNavigationNode[] => {
    if (
      node.requiredPermissions &&
      !hasEveryPermission(grantedPermissions, node.requiredPermissions)
    ) {
      return []
    }

    if (!node.children) {
      return [node]
    }

    const children = filterNavigationByPermissions(
      node.children,
      grantedPermissions,
    )

    if (children.length === 0 && !node.path) {
      return []
    }

    return [{ ...node, children }]
  })
