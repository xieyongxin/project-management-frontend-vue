export const configurationKeys = {
  all: ['configuration'] as const,
  projectTypes: () => [...configurationKeys.all, 'project-types'] as const,
  workflows: () => [...configurationKeys.all, 'workflows'] as const,
  roles: () => [...configurationKeys.all, 'roles'] as const,
}
