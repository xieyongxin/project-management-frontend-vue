export const workspaceKeys = {
  all: ['workspace'] as const,
  summary: () => [...workspaceKeys.all, 'summary'] as const,
  todos: (type: string) => [...workspaceKeys.all, 'todos', type] as const,
  activity: () => [...workspaceKeys.all, 'activity'] as const,
}
