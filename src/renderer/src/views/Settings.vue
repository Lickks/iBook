<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>设置</h1>
      <p class="subtitle">个性化您的阅读体验</p>
    </div>

    <div class="settings-content">
      <section class="settings-section">
        <h2 class="section-title">外观设置</h2>
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">主题</span>
              <span class="label-desc">选择您喜欢的主题模式</span>
            </div>
            <ThemeSelector />
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">布局设置</h2>
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">视图模式</span>
              <span class="label-desc">选择书籍列表的显示方式</span>
            </div>
            <div class="setting-control">
              <button
                class="view-mode-btn"
                :class="{ active: uiStore.viewMode === 'grid' }"
                type="button"
                @click="uiStore.setViewMode('grid')"
              >
                <span>网格视图</span>
              </button>
              <button
                class="view-mode-btn"
                :class="{ active: uiStore.viewMode === 'list' }"
                type="button"
                @click="uiStore.setViewMode('list')"
              >
                <span>列表视图</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '../stores/ui'
import ThemeSelector from '../components/ThemeSelector.vue'

const uiStore = useUIStore()
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 20px 0;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.label-desc {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.setting-control {
  display: flex;
  gap: 12px;
}

.view-mode-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-mode-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.view-mode-btn.active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}
</style>

