import type { AppNavigationNode } from './app-layout.types'

export interface NavigationMatch {
  key: string
  path: string
  ancestorKeys: string[]
}

const normalizePath = (path: string) => {
  if (path === '/') {
    return path
  }

  return path.replace(/\/+$/, '')
}

const isPathMatch = (pathname: string, candidatePath: string) => {
  const normalizedPath = normalizePath(candidatePath)

  return (
    pathname === normalizedPath ||
    (normalizedPath !== '/' && pathname.startsWith(`${normalizedPath}/`))
  )
}

export const findBestNavigationMatch = (
  navigation: readonly AppNavigationNode[],
  pathname: string,
): NavigationMatch | undefined => {
  const matches: NavigationMatch[] = []

  const visit = (
    nodes: readonly AppNavigationNode[],
    ancestorKeys: readonly string[],
  ) => {
    nodes.forEach((node) => {
      if (node.path && isPathMatch(pathname, node.path)) {
        matches.push({
          key: node.key,
          path: normalizePath(node.path),
          ancestorKeys: [...ancestorKeys],
        })
      }

      if (!node.children?.length) {
        return
      }

      const childAncestorKeys =
        node.type === 'group' ? ancestorKeys : [...ancestorKeys, node.key]

      visit(node.children, childAncestorKeys)
    })
  }

  visit(navigation, [])

  return matches.sort(
    (first, second) =>
      second.path.length - first.path.length ||
      second.ancestorKeys.length - first.ancestorKeys.length,
  )[0]
}

export const findNavigationPathByKey = (
  navigation: readonly AppNavigationNode[],
  key: string,
): string | undefined => {
  for (const node of navigation) {
    if (node.key === key) {
      return node.path
    }

    if (node.children) {
      const childPath = findNavigationPathByKey(node.children, key)

      if (childPath) {
        return childPath
      }
    }
  }

  return undefined
}
