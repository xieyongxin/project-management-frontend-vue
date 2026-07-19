import { createRouter, createWebHistory } from 'vue-router'
import { LoginLayout } from '@/layouts'
import { ForbiddenPage, NotFoundPage } from './pages/StatusPages'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: LoginLayout,
      children: [
        {
          path: '',
          name: 'Login',
          component: () => import('@/features/auth/pages/LoginPage.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('./pages/ProtectedShellPage.vue'),
      children: [
        {
          path: '',
          redirect: '/workspace',
        },
        {
          path: 'workspace',
          name: 'Dashboard',
          component: () =>
            import('@/features/dashboard/pages/DashboardPage.vue'),
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('@/features/projects/pages/ProjectsPage.vue'),
        },
        {
          path: 'projects/:projectId',
          redirect: (to) => `/projects/${String(to.params.projectId)}/overview`,
        },
        {
          path: 'projects/:projectId/:section(overview|requirements|tasks|defects|sprints|phases|versions|tests|members|activity|configuration)',
          name: 'ProjectDetail',
          component: () =>
            import('@/features/projects/pages/ProjectDetailPage.vue'),
        },
        {
          path: 'configuration',
          redirect: '/configuration/project-types',
        },
        {
          path: 'configuration/:section(project-types|workflows|roles)/:typeKey(scrum|waterfall)?',
          name: 'ConfigurationCenter',
          component: () =>
            import('@/features/configuration/pages/ConfigurationCenterPage.vue'),
        },
        {
          path: 'settings',
          redirect: '/configuration/project-types',
        },
        {
          path: '403',
          name: 'Forbidden',
          component: ForbiddenPage,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundPage,
    },
  ],
})
