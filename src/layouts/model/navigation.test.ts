import { describe, expect, it } from 'vitest'
import type { AppNavigationNode } from './app-layout.types'
import { findBestNavigationMatch, findNavigationPathByKey } from './navigation'

const navigation: AppNavigationNode[] = [
  { key: 'dashboard', label: '仪表盘', path: '/' },
  { key: 'projects', label: '项目管理', path: '/projects' },
]

describe('navigation', () => {
  it('finds the best path match', () => {
    expect(findBestNavigationMatch(navigation, '/projects/1')?.key).toBe(
      'projects',
    )
  })

  it('finds path by key', () => {
    expect(findNavigationPathByKey(navigation, 'dashboard')).toBe('/')
  })
})
