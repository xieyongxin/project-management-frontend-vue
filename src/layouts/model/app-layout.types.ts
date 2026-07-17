import type { Component } from 'vue'

export interface AppNavigationNode {
  key: string
  type?: 'item' | 'group'
  label: string
  path?: string | undefined
  icon?: Component | undefined
  children?: readonly AppNavigationNode[]
  requiredPermissions?: readonly string[]
}

export interface AppUserSummary {
  displayName: string
  roleLabel: string
  avatarUrl?: string | undefined
}

export interface AppLayoutProps {
  navigation: readonly AppNavigationNode[]
  user: AppUserSummary
  search?:
    | {
        placeholder?: string | undefined
        ariaLabel?: string | undefined
      }
    | undefined
  notifications?:
    | {
        count?: number | undefined
        emptyDescription?: string | undefined
      }
    | undefined
  logoutLoading: boolean
}
