import { createRouter, createWebHistory } from 'vue-router'
import { LoginLayout } from '@/layouts'
import { BlankRoutePage } from './pages/BlankRoutePage'
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
          name: 'Dashboard',
          component: () =>
            import('@/features/dashboard/pages/DashboardPage.vue'),
        },
        {
          path: 'projects',
          name: 'Projects',
          component: BlankRoutePage,
          props: { title: '项目管理' },
        },
        {
          path: 'tasks',
          name: 'Tasks',
          component: BlankRoutePage,
          props: { title: '任务中心' },
        },
        {
          path: 'files',
          name: 'Files',
          component: BlankRoutePage,
          props: { title: '文件协作' },
        },
        {
          path: 'approvals',
          name: 'Approvals',
          component: BlankRoutePage,
          props: { title: '审批流程' },
        },
        {
          path: 'settings',
          name: 'Settings',
          component: BlankRoutePage,
          props: { title: '系统设置' },
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
