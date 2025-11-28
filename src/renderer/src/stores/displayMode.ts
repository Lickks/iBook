import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type DisplayMode = 'simple' | 'classic'

/**
 * 显示模式管理 Store
 */
export const useDisplayModeStore = defineStore('displayMode', () => {
  // State
  const displayMode = ref<DisplayMode>('simple')

  // 从 localStorage 加载设置
  function loadSettings(): void {
    const savedMode = localStorage.getItem('displayMode') as DisplayMode | null
    if (savedMode && ['simple', 'classic'].includes(savedMode)) {
      displayMode.value = savedMode
    }
  }

  // Getters
  const isSimpleMode = computed(() => displayMode.value === 'simple')
  const isClassicMode = computed(() => displayMode.value === 'classic')

  // Actions
  function setDisplayMode(mode: DisplayMode): void {
    displayMode.value = mode
    localStorage.setItem('displayMode', mode)
  }

  function toggleDisplayMode(): void {
    const newMode = displayMode.value === 'simple' ? 'classic' : 'simple'
    displayMode.value = newMode
    localStorage.setItem('displayMode', newMode)
  }

  // 初始化时加载设置
  if (typeof window !== 'undefined') {
    loadSettings()
  }

  return {
    // State
    displayMode,
    // Getters
    isSimpleMode,
    isClassicMode,
    // Actions
    setDisplayMode,
    toggleDisplayMode,
    loadSettings
  }
})