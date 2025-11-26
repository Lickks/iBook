import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'
type ViewMode = 'grid' | 'list'

/**
 * UI 状态管理 Store
 */
export const useUIStore = defineStore('ui', () => {
  // State
  const theme = ref<Theme>('light')
  const viewMode = ref<ViewMode>('grid')
  const sidebarCollapsed = ref(false)

  // 从 localStorage 加载设置
  function loadSettings(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const savedViewMode = localStorage.getItem('viewMode') as ViewMode | null
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')

    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      theme.value = savedTheme
    } else if (savedTheme === 'auto') {
      // 迁移旧的 'auto' 主题：根据系统主题选择 light 或 dark
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = systemPrefersDark ? 'dark' : 'light'
      localStorage.setItem('theme', theme.value)
    }
    if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
      viewMode.value = savedViewMode
    }
    if (savedSidebarCollapsed !== null) {
      sidebarCollapsed.value = savedSidebarCollapsed === 'true'
    }

    // 应用主题
    applyTheme()
  }

  // 应用主题
  function applyTheme(): void {
    const root = document.documentElement

    if (theme.value === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }

  // Actions
  /**
   * 切换主题
   */
  function toggleTheme(): void {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  /**
   * 设置主题
   */
  function setTheme(newTheme: Theme): void {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  /**
   * 设置视图模式
   */
  function setViewMode(mode: ViewMode): void {
    viewMode.value = mode
    localStorage.setItem('viewMode', mode)
  }

  /**
   * 切换侧边栏
   */
  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
  }

  /**
   * 设置侧边栏状态
   */
  function setSidebarCollapsed(collapsed: boolean): void {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebarCollapsed', String(collapsed))
  }


  // 初始化时加载设置
  if (typeof window !== 'undefined') {
    loadSettings()
  }

  return {
    // State
    theme,
    viewMode,
    sidebarCollapsed,
    // Actions
    toggleTheme,
    setTheme,
    setViewMode,
    toggleSidebar,
    setSidebarCollapsed
  }
})

