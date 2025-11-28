<template>
  <div class="page-container settings-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">系统设置</p>
        <h1>设置</h1>
        <p class="subtitle">个性化您的阅读体验</p>
      </div>
    </header>

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
                <el-icon style="margin-right: 6px;"><Document /></el-icon>
                <span>简约</span>
              </button>
              <button
                class="view-mode-btn"
                :class="{ active: displayModeStore.isClassicMode }"
                type="button"
                @click="displayModeStore.setDisplayMode('classic')"
              >
                <el-icon style="margin-right: 6px;"><Collection /></el-icon>
                <span>经典</span>
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
                <el-icon><Grid /></el-icon>
                <span>网格视图</span>
              </button>
              <button
                class="view-mode-btn"
                :class="{ active: uiStore.viewMode === 'list' }"
                type="button"
                @click="uiStore.setViewMode('list')"
              >
                <el-icon><List /></el-icon>
                <span>列表视图</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">数据管理</h2>
        <div class="data-management-grid">
          <div class="data-card backup-card">
            <div class="data-card-header">
              <div class="data-card-icon backup-icon">
                <el-icon><Download /></el-icon>
              </div>
              <div class="data-card-info">
                <h3 class="data-card-title">备份数据</h3>
                <p class="data-card-desc">备份所有书籍、文档、封面和设置到本地文件</p>
              </div>
            </div>
            <div class="data-card-body">
              <button
                class="data-action-btn backup-action-btn"
                type="button"
                :disabled="backupLoading"
                @click="handleBackup"
              >
                <el-icon><Download /></el-icon>
                <span v-if="!backupLoading">创建备份</span>
                <span v-else>备份中...</span>
              </button>
              <div v-if="backupProgress !== null" class="data-progress">
                <div class="data-progress-bar">
                  <div class="data-progress-fill" :style="{ width: `${backupProgress.progress}%` }"></div>
                </div>
                <div class="data-progress-text">{{ backupProgress.message }}</div>
              </div>
            </div>
          </div>

          <div class="data-card restore-card">
            <div class="data-card-header">
              <div class="data-card-icon restore-icon">
                <el-icon><Upload /></el-icon>
              </div>
              <div class="data-card-info">
                <h3 class="data-card-title">恢复数据</h3>
                <p class="data-card-desc">从备份文件恢复所有数据（将覆盖当前数据）</p>
              </div>
            </div>
            <div class="data-card-body">
              <button
                class="data-action-btn restore-action-btn"
                type="button"
                :disabled="restoreLoading"
                @click="handleRestore"
              >
                <el-icon><Upload /></el-icon>
                <span v-if="!restoreLoading">恢复备份</span>
                <span v-else>恢复中...</span>
              </button>
              <div v-if="restoreProgress !== null" class="data-progress">
                <div class="data-progress-bar">
                  <div class="data-progress-fill restore-progress-fill" :style="{ width: `${restoreProgress.progress}%` }"></div>
                </div>
                <div class="data-progress-text">{{ restoreProgress.message }}</div>
              </div>
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
import { Document, Collection, Download, Upload, Grid, List } from '@element-plus/icons-vue'
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
    
    // 7. 无论当前在哪个页面，都强制跳转到首页
    // 使用 push 并添加时间戳参数，确保路由变化
    const timestamp = Date.now()
    await router.push({ path: '/', query: { refresh: timestamp.toString() } })
    await nextTick()
    
    // 8. 跳转后再次刷新书籍列表，确保数据是最新的
    await bookStore.fetchBooks()
    
    // 9. 再等待一次响应式更新，确保 UI 已更新
    await nextTick()
    
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
      // 直接调用刷新和跳转逻辑，确保可靠性
      // onRestoreComplete 监听器也会触发，但 hasHandledRestoreCompletion 标志会防止重复执行
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
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.settings-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 28px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-border);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 2px;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-soft);
  border-radius: 16px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.setting-item:hover {
  background: var(--color-bg-muted);
  border-color: var(--color-border);
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.label-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.setting-control {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.view-mode-btn {
  flex: 1;
  min-width: 140px;
  padding: 14px 20px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.view-mode-btn .el-icon {
  font-size: 16px;
}

.view-mode-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.view-mode-btn.active {
  border-color: var(--color-accent);
  background: linear-gradient(135deg, var(--color-accent-soft) 0%, rgba(99, 102, 241, 0.15) 100%);
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
}

/* 数据管理网格布局 */
.data-management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.data-card {
  background: var(--color-bg-soft);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.backup-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%);
}

.restore-card {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.05) 0%, rgba(230, 162, 60, 0.02) 100%);
}

.data-card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.data-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 24px;
}

.backup-icon {
  background: linear-gradient(135deg, var(--color-accent) 0%, rgba(99, 102, 241, 0.8) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.restore-icon {
  background: linear-gradient(135deg, #e6a23c 0%, rgba(230, 162, 60, 0.8) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(230, 162, 60, 0.3);
}

.data-card-info {
  flex: 1;
  min-width: 0;
}

.data-card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.01em;
}

.data-card-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.data-card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-action-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-action-btn .el-icon {
  font-size: 18px;
}

.backup-action-btn {
  background: linear-gradient(135deg, var(--color-accent) 0%, rgba(99, 102, 241, 0.9) 100%);
  color: white;
}

.backup-action-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, var(--color-accent) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.restore-action-btn {
  background: linear-gradient(135deg, #e6a23c 0%, rgba(230, 162, 60, 0.9) 100%);
  color: white;
}

.restore-action-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.95) 0%, #e6a23c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 162, 60, 0.4);
}

.data-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.data-progress {
  margin-top: 4px;
  padding: 16px;
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.data-progress-bar {
  width: 100%;
  height: 10px;
  background: var(--color-bg-muted);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.data-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent) 0%, rgba(99, 102, 241, 0.8) 100%);
  transition: width 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.restore-progress-fill {
  background: linear-gradient(90deg, #e6a23c 0%, rgba(230, 162, 60, 0.8) 100%);
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
}

.data-progress-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  font-weight: 500;
}

@media (max-width: 640px) {
  .settings-section {
    padding: 20px;
  }

  .section-content {
    gap: 24px;
  }

  .setting-item {
    padding: 16px;
  }

  .view-mode-btn {
    min-width: auto;
    flex: 1;
  }

  .data-management-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .data-card {
    padding: 20px;
  }

  .data-card-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .data-card-title {
    font-size: 16px;
  }
}
</style>

