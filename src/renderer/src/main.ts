import './assets/main.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useUIStore } from './stores/ui'

const app = createApp(App)
app.use(router)
app.use(pinia)

// 初始化主题
const uiStore = useUIStore()
const root = document.documentElement
const effectiveTheme = uiStore.getEffectiveTheme()
if (effectiveTheme === 'dark') {
  root.classList.add('dark')
} else {
  root.classList.remove('dark')
}

app.mount('#app')
