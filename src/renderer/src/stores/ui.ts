import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'auto'
type ViewMode = 'grid' | 'list'

/**
 * UI 状态管理 Store
 */
export const useUIStore = defineStore('ui', () => {
  // State
  const theme = ref<Theme>('auto')
  const viewMode = ref<ViewMode>('grid')
  const sidebarCollapsed = ref(false)

  // 从 localStorage 加载设置
  function loadSettings(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const savedViewMode = localStorage.getItem('viewMode') as ViewMode | null
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')

    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      theme.value = savedTheme
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
    const effectiveTheme = getEffectiveTheme()

    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }

  // 获取有效主题（如果是 auto，则根据系统主题判断）
  function getEffectiveTheme(): 'light' | 'dark' {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme.value
  }

  // Actions
  /**
   * 切换主题
   */
  function toggleTheme(): void {
    const themes: Theme[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
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

  // 监听系统主题变化（当 theme 为 auto 时）
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'auto') {
        applyTheme()
      }
    })
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
    // Getters (computed)
    getEffectiveTheme,
    // Actions
    toggleTheme,
    setTheme,
    setViewMode,
    toggleSidebar,
    setSidebarCollapsed
  }
})

