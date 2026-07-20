import { describe, expect, it } from 'vitest'
import type { AppNavigationNode } from './app-layout.types'
import { findBestNavigationMatch, findNavigationPathByKey } from './navigation'

const navigation: AppNavigationNode[] = [
  { key: 'dashboard', label: '工作台', path: '/workspace' },
  { key: 'projects', label: '项目管理', path: '/projects' },
  {
    key: 'configuration',
    label: '配置中心',
    path: '/configuration/project-types',
    children: [
      {
        key: 'configuration-project-types',
        label: '项目类型配置',
        path: '/configuration/project-types',
      },
      {
        key: 'configuration-workflows',
        label: '工作流配置',
        path: '/configuration/workflows',
      },
    ],
  },
]

describe('navigation', () => {
  it('finds the best path match', () => {
    expect(findBestNavigationMatch(navigation, '/projects/1')?.key).toBe(
      'projects',
    )
  })

  it('finds path by key', () => {
    expect(findNavigationPathByKey(navigation, 'dashboard')).toBe('/workspace')
  })

  it('matches configuration child routes and opens parent menu', () => {
    expect(
      findBestNavigationMatch(navigation, '/configuration/project-types'),
    ).toEqual({
      key: 'configuration-project-types',
      path: '/configuration/project-types',
      ancestorKeys: ['configuration'],
    })
  })
})
