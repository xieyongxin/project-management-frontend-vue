import { VueQueryPlugin } from '@tanstack/vue-query'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app/App.vue'
import { queryClient } from './app/providers/query-client'
import { router } from './router'
import { env } from './shared/config/env'
import 'element-plus/dist/index.css'
import './styles/global.css'

const enableMocking = async () => {
  if (!import.meta.env.DEV || !env.enableMocks) {
    return
  }

  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

void enableMocking().then(() => {
  createApp(App)
    .use(createPinia())
    .use(router)
    .use(VueQueryPlugin, { queryClient })
    .use(ElementPlus)
    .mount('#app')
})
