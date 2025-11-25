<script setup lang="ts">
import { useDisplayModeStore } from '../stores/displayMode'

const displayModeStore = useDisplayModeStore()

function toggleMode() {
  displayModeStore.toggleDisplayMode()
}
</script>

<template>
  <div class="display-mode-toggle">
    <button
      class="toggle-btn"
      :class="{ active: displayModeStore.isSimpleMode }"
      @click="toggleMode"
    >
      <span class="icon">📋</span>
      <span>简约</span>
    </button>
    <button
      class="toggle-btn"
      :class="{ active: displayModeStore.isClassicMode }"
      @click="toggleMode"
    >
      <span class="icon">📚</span>
      <span>经典</span>
    </button>
  </div>
</template>

<style scoped>
.display-mode-toggle {
  display: flex;
  gap: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: var(--color-bg-soft);
}

.toggle-btn.active {
  background: var(--color-accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.icon {
  font-size: 14px;
}

@media (max-width: 640px) {
  .toggle-btn span:last-child {
    display: none;
  }

  .toggle-btn {
    padding: 8px 12px;
  }
}
</style>