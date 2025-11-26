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
              <span class="label-text">显示模式</span>
              <span class="label-desc">选择简约或经典显示模式</span>
            </div>
            <div class="setting-control">
              <button
                class="view-mode-btn"
                :class="{ active: displayModeStore.isSimpleMode }"
                type="button"
                @click="displayModeStore.setDisplayMode('simple')"
              >
                <span>📋 简约</span>
              </button>
              <button
                class="view-mode-btn"
                :class="{ active: displayModeStore.isClassicMode }"
                type="button"
                @click="displayModeStore.setDisplayMode('classic')"
              >
                <span>📚 经典</span>
              </button>
            </div>
          </div>
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

      <section class="settings-section">
        <h2 class="section-title">数据管理</h2>
        <div class="section-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">备份数据</span>
              <span class="label-desc">备份所有书籍、文档、封面和设置到本地文件</span>
            </div>
            <div class="setting-control">
              <button
                class="backup-btn"
                type="button"
                :disabled="backupLoading"
                @click="handleBackup"
              >
                <span v-if="!backupLoading">创建备份</span>
                <span v-else>备份中...</span>
              </button>
            </div>
            <div v-if="backupProgress !== null" class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${backupProgress.progress}%` }"></div>
              </div>
              <div class="progress-text">{{ backupProgress.message }}</div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">恢复数据</span>
              <span class="label-desc">从备份文件恢复所有数据（将覆盖当前数据）</span>
            </div>
            <div class="setting-control">
              <button
                class="restore-btn"
                type="button"
                :disabled="restoreLoading"
                @click="handleRestore"
              >
                <span v-if="!restoreLoading">恢复备份</span>
                <span v-else>恢复中...</span>
              </button>
            </div>
            <div v-if="restoreProgress !== null" class="progress-container">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${restoreProgress.progress}%` }"
                ></div>
              </div>
              <div class="progress-text">{{ restoreProgress.message }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUIStore } from '../stores/ui'
import { useDisplayModeStore } from '../stores/displayMode'
import { useBookStore } from '../stores/book'
import { useTagStore } from '../stores/tag'
import { useBookshelfStore } from '../stores/bookshelf'
import ThemeSelector from '../components/ThemeSelector.vue'
import {
  createBackup,
  restoreBackup,
  onBackupProgress,
  onRestoreProgress,
  onRestoreComplete,
  type BackupProgress,
  type RestoreProgress
} from '../api/backup'

const uiStore = useUIStore()
const displayModeStore = useDisplayModeStore()
const bookStore = useBookStore()
const tagStore = useTagStore()
const bookshelfStore = useBookshelfStore()
const route = useRoute()
const router = useRouter()

const backupLoading = ref(false)
const restoreLoading = ref(false)
const backupProgress = ref<BackupProgress | null>(null)
const restoreProgress = ref<RestoreProgress | null>(null)
// 恢复完成后只执行一次刷新逻辑，避免重复请求
let hasHandledRestoreCompletion = false

async function handleRestoreCompletion(): Promise<void> {
  if (hasHandledRestoreCompletion) {
    return
  }
  hasHandledRestoreCompletion = true

  // 重新加载 UI 配置
  uiStore.loadSettings()
  displayModeStore.loadSettings()
  
  // 刷新恢复后的数据
  try {
    // 1. 重新拉取书架列表
    await bookshelfStore.fetchBookshelves()
    
    // 2. 将当前书架设为默认书架
    const defaultBookshelfId = bookshelfStore.defaultBookshelf?.id || null
    bookshelfStore.setCurrentBookshelf(defaultBookshelfId)
    // 先置空当前书架，确保全量刷新书籍数据，避免旧书架ID失效导致空列表
    bookStore.setCurrentBookshelf(null)
    
    // 3. 刷新标签
    await tagStore.fetchTags()
    
    // 4. 清空筛选并刷新书籍（全量）
    bookStore.clearAllFilters()
    await bookStore.fetchBooks()

    // 5. 切回默认书架再刷新一次，保证列表与默认书架关联一致
    bookStore.setCurrentBookshelf(defaultBookshelfId)
    await bookStore.fetchBooks()
    
    // 6. 等待响应式更新
    await nextTick()
    
    // 7. 若不在首页则跳转后再刷新
    if (route.name !== 'Home') {
      await router.push('/')
      await nextTick()
      await bookStore.fetchBooks()
    }
    
    ElMessage.success('数据恢复完成，已跳转到书籍列表页')
  } catch (error: any) {
    console.error('刷新数据失败:', error)
    ElMessage.warning('数据恢复完成，但刷新数据失败，请手动刷新页面')
  }
}


let backupProgressUnsubscribe: (() => void) | null = null
let restoreProgressUnsubscribe: (() => void) | null = null
let restoreCompleteUnsubscribe: (() => void) | null = null

onMounted(() => {
  // 监听备份进度
  backupProgressUnsubscribe = onBackupProgress((progress) => {
    backupProgress.value = progress
  })

  // 监听恢复进度
  restoreProgressUnsubscribe = onRestoreProgress((progress) => {
    restoreProgress.value = progress
  })

  // 监听恢复完成，统一执行刷新逻辑
  restoreCompleteUnsubscribe = onRestoreComplete(() => {
    void handleRestoreCompletion()
  })
})

onUnmounted(() => {
  if (backupProgressUnsubscribe) backupProgressUnsubscribe()
  if (restoreProgressUnsubscribe) restoreProgressUnsubscribe()
  if (restoreCompleteUnsubscribe) restoreCompleteUnsubscribe()
})

async function handleBackup() {
  try {
    backupLoading.value = true
    backupProgress.value = null

    const result = await createBackup()

    if (result.success) {
      ElMessage.success(`备份创建成功: ${result.data?.path || ''}`)
      backupProgress.value = {
        stage: 'complete',
        progress: 100,
        message: '备份完成'
      }
    } else {
      ElMessage.error(result.error || '备份失败')
      backupProgress.value = null
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '备份失败')
    backupProgress.value = null
  } finally {
    backupLoading.value = false
  }
}

async function handleRestore() {
  try {
    const confirmed = await ElMessageBox.confirm(
      '恢复备份将覆盖当前所有数据，是否继续？',
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (!confirmed) {
      return
    }

    restoreLoading.value = true
    restoreProgress.value = null
    hasHandledRestoreCompletion = false

    const result = await restoreBackup()

    if (result.success) {
      ElMessage.success('数据恢复成功')
      restoreProgress.value = {
        stage: 'complete',
        progress: 100,
        message: '恢复完成'
      }
    
      await handleRestoreCompletion()
    } else {
      ElMessage.error(result.error || '恢复失败')
      restoreProgress.value = null
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '恢复失败')
    }
    restoreProgress.value = null
  } finally {
    restoreLoading.value = false
  }
}
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

.backup-btn,
.restore-btn {
  padding: 12px 24px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.backup-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.restore-btn {
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.restore-btn:hover:not(:disabled) {
  background: var(--color-warning-soft);
  border-color: var(--color-warning);
}

.backup-btn:disabled,
.restore-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.progress-container {
  margin-top: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--color-text-tertiary);
  text-align: center;
}
</style>

