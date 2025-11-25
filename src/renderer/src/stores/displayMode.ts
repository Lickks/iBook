import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type DisplayMode = 'simple' | 'classic'

/**
 * 显示模式管理 Store
 */
export const useDisplayModeStore = defineStore('displayMode', () => {
  // State
  const displayMode = ref<DisplayMode>('simple')

  // Getters
  const isSimpleMode = computed(() => displayMode.value === 'simple')
  const isClassicMode = computed(() => displayMode.value === 'classic')

  // Actions
  function setDisplayMode(mode: DisplayMode): void {
    displayMode.value = mode
  }

  function toggleDisplayMode(): void {
    displayMode.value = displayMode.value === 'simple' ? 'classic' : 'simple'
  }

  return {
    // State
    displayMode,
    // Getters
    isSimpleMode,
    isClassicMode,
    // Actions
    setDisplayMode,
    toggleDisplayMode
  }
})