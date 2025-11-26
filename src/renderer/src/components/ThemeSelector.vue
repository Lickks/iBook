<template>
  <div class="theme-selector">
    <div class="theme-options">
      <button
        v-for="option in themeOptions"
        :key="option.value"
        class="theme-option"
        :class="{ active: uiStore.theme === option.value }"
        type="button"
        :title="option.label"
        @click="handleThemeChange(option.value)"
      >
        <span class="theme-icon">{{ option.icon }}</span>
        <span class="theme-label">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '../stores/ui'

const uiStore = useUIStore()

const themeOptions = [
  { value: 'light', label: '明亮', icon: '☀️' },
  { value: 'dark', label: '暗黑', icon: '🌙' }
]

function handleThemeChange(theme: 'light' | 'dark'): void {
  uiStore.setTheme(theme)
}
</script>

<style scoped>
.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.theme-option:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.theme-option.active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}

.theme-icon {
  font-size: 18px;
  line-height: 1;
}

.theme-label {
  flex: 1;
  text-align: left;
}
</style>

