import { VueQueryPlugin } from '@tanstack/vue-query'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app/App.vue'
import { queryClient } from './app/providers/query-client'
import { router } from './router'
import 'element-plus/dist/index.css'
import './styles/global.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(VueQueryPlugin, { queryClient })
  .use(ElementPlus)
  .mount('#app')
