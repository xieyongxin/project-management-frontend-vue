import {
  Checked,
  Document,
  Folder,
  HomeFilled,
  Setting,
  UserFilled,
} from '@element-plus/icons-vue'
import type { Component } from 'vue'
import type { AppNavigationNode } from '@/layouts'

export const appNavigation = [
  {
    key: 'dashboard',
    label: '仪表盘',
    path: '/',
    icon: HomeFilled,
  },
  {
    key: 'projects',
    label: '项目管理',
    path: '/projects',
    icon: Folder,
  },
  {
    key: 'tasks',
    label: '任务中心',
    path: '/tasks',
    icon: Checked,
  },
  {
    key: 'files',
    label: '文件协作',
    path: '/files',
    icon: Document,
  },
  {
    key: 'approvals',
    label: '审批流程',
    path: '/approvals',
    icon: UserFilled,
  },
  {
    key: 'settings',
    label: '系统设置',
    path: '/settings',
    icon: Setting,
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
