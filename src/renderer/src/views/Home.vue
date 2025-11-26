<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PriceTag, Collection, Minus, Delete } from '@element-plus/icons-vue'
import { useBookStore } from '../stores/book'
import { useUIStore } from '../stores/ui'
import { READING_STATUS_LABEL } from '../constants'
import SearchBar from '../components/SearchBar.vue'
import StatusStats from '../components/StatusStats.vue'
import BookCard from '../components/BookCard.vue'
import FilterBar from '../components/FilterBar.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import { useTagStore } from '../stores/tag'
import { useBookshelfStore } from '../stores/bookshelf'
import TagSelector from '../components/TagSelector.vue'
import BookshelfDialog from '../components/BookshelfDialog.vue'
import AddToBookshelfDialog from '../components/AddToBookshelfDialog.vue'

const bookStore = useBookStore()
const uiStore = useUIStore()
const tagStore = useTagStore()
const bookshelfStore = useBookshelfStore()
const router = useRouter()

const viewMode = computed(() => uiStore.viewMode)
const hasBooks = computed(() => bookStore.books.length > 0)
const filteredBooks = computed(() => bookStore.filteredBooks)
const highlight = computed(() => bookStore.searchKeyword)
const selectedStatus = computed({
  get: () => bookStore.selectedStatus,
  set: (value) => bookStore.setSelectedStatus(value)
})
const statusStats = computed(() => bookStore.statusStats)
const hasActiveFilters = computed(() => bookStore.hasActiveFilters)


// 选择相关状态
const selectedBooks = ref<number[]>([])
const selectionMode = ref(false)
const showBatchActions = computed(() => selectedBooks.value.length > 0)

// 全选状态
const isAllSelected = computed(() => {
  return filteredBooks.value.length > 0 && selectedBooks.value.length === filteredBooks.value.length
})

// 部分选中状态
const isIndeterminate = computed(() => {
  return selectedBooks.value.length > 0 && selectedBooks.value.length < filteredBooks.value.length
})

function setViewMode(mode: 'grid' | 'list'): void {
  uiStore.setViewMode(mode)
}

function goToAdd(): void {
  router.push('/add')
}

function handleStatusClick(status: string | null): void {
  selectedStatus.value = status
}

function clearFilters(): void {
  bookStore.clearAllFilters()
}

// 切换选择模式
function toggleSelectionMode(): void {
  selectionMode.value = !selectionMode.value
  selectedBooks.value = []
}

// 选择/取消选择书籍
function toggleBookSelection(bookId: number): void {
  const index = selectedBooks.value.indexOf(bookId)
  if (index === -1) {
    selectedBooks.value.push(bookId)
  } else {
    selectedBooks.value.splice(index, 1)
  }
}

// 全选/取消全选
function toggleSelectAll(): void {
  if (isAllSelected.value) {
    selectedBooks.value = []
  } else {
    selectedBooks.value = filteredBooks.value.map(book => book.id)
  }
}

// 批量更新阅读状态
async function handleBatchStatusUpdate(status: string): Promise<void> {
  if (selectedBooks.value.length === 0) return

  const selectedCount = selectedBooks.value.length

  try {
    await bookStore.batchUpdateStatus(selectedBooks.value, status)
    selectedBooks.value = []
    selectionMode.value = false
    ElMessage.success(`已将 ${selectedCount} 本书籍状态更新为：${READING_STATUS_LABEL[status as keyof typeof READING_STATUS_LABEL]}`)
  } catch (error: any) {
    ElMessage.error('批量更新状态失败')
    console.error('批量更新阅读状态失败:', error)
  }
}

// 批量删除
const showDeleteConfirm = ref(false)
async function handleBatchDelete(): Promise<void> {
  if (selectedBooks.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedBooks.value.length} 本书籍吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 确保传递的是纯数组，避免 IPC 序列化问题
    const bookIds = [...selectedBooks.value]
    const count = await bookStore.batchDeleteBooks(bookIds)
    selectedBooks.value = []
    selectionMode.value = false
    if (count === 0) {
      ElMessage.warning('没有找到要删除的书籍，可能已被删除')
    } else {
      ElMessage.success(`已成功删除 ${count} 本书籍`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除失败:', error)
    }
  }
}

// 批量添加标签
const showBatchTagDialog = ref(false)
const batchSelectedTagIds = ref<number[]>([])
async function handleBatchAddTags(): Promise<void> {
  if (selectedBooks.value.length === 0 || batchSelectedTagIds.value.length === 0) return

  const selectedCount = selectedBooks.value.length
  const selectedIds = [...selectedBooks.value]

  try {
    await bookStore.batchAddTags(selectedIds, batchSelectedTagIds.value)
    selectedBooks.value = []
    batchSelectedTagIds.value = []
    showBatchTagDialog.value = false
    selectionMode.value = false
    ElMessage.success(`已为 ${selectedCount} 本书籍添加标签`)
  } catch (error: any) {
    ElMessage.error('批量添加标签失败')
    console.error('批量添加标签失败:', error)
  }
}

function openBatchTagDialog(): void {
  if (selectedBooks.value.length === 0) return
  batchSelectedTagIds.value = []
  showBatchTagDialog.value = true
}

// 书架相关
const showBookshelfDialog = ref(false)
const editingBookshelf = ref(null)
const showAddToBookshelfDialog = ref(false)

const isCustomBookshelf = computed(() => {
  const current = bookshelfStore.currentBookshelf
  return current && !current.isDefault
})

function openBookshelfDialog(bookshelf = null): void {
  editingBookshelf.value = bookshelf
  showBookshelfDialog.value = true
}

function handleBookshelfSuccess(): void {
  // 刷新书籍列表
  bookStore.fetchBooks()
}

function openAddToBookshelfDialog(): void {
  if (selectedBooks.value.length === 0) return
  showAddToBookshelfDialog.value = true
}

function handleAddToBookshelfSuccess(): void {
  selectedBooks.value = []
  selectionMode.value = false
  // 刷新书籍列表
  bookStore.fetchBooks()
}

// 从书架移除书籍（仅从当前自定义书架移除，不删除书籍）
async function handleRemoveFromBookshelf(): Promise<void> {
  if (selectedBooks.value.length === 0) return
  
  const currentBookshelf = bookshelfStore.currentBookshelf
  if (!currentBookshelf || currentBookshelf.isDefault) {
    ElMessage.warning('不能从全局书架移除书籍')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要从书架「${currentBookshelf.name}」中移除选中的 ${selectedBooks.value.length} 本书籍吗？书籍不会被删除，只是从当前书架中移除。`,
      '确认移除',
      {
        confirmButtonText: '确定移除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const bookIds = [...selectedBooks.value]
    const count = await bookshelfStore.removeBooksFromBookshelf(currentBookshelf.id, bookIds)
    
    selectedBooks.value = []
    selectionMode.value = false
    
    if (count > 0) {
      ElMessage.success(`已从书架移除 ${count} 本书籍`)
      // 刷新书籍列表
      await bookStore.fetchBooks()
    } else {
      ElMessage.warning('没有书籍被移除')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '从书架移除书籍失败')
      console.error('从书架移除书籍失败:', error)
    }
  }
}


</script>

<template>
  <section class="page-container home-view">
    <header class="page-header">
      <div>
        <p class="eyebrow">我的书架</p>
        <h1>共 {{ bookStore.books.length }} 本书籍</h1>
        <p class="subtitle">总字数 {{ bookStore.totalWordCount.toLocaleString() }} 字</p>
      </div>
      <div class="section-actions">
        <div class="action-group">
          <div class="view-switcher">
            <button
              type="button"
              :class="{ active: viewMode === 'grid' }"
              @click="setViewMode('grid')"
            >
              网格
            </button>
            <button
              type="button"
              :class="{ active: viewMode === 'list' }"
              @click="setViewMode('list')"
            >
              列表
            </button>
          </div>
          <button
            type="button"
            class="secondary-btn"
            @click="toggleSelectionMode"
            :class="{ active: selectionMode }"
          >
            {{ selectionMode ? '取消选择' : '批量管理' }}
          </button>
        </div>
        <button class="primary-btn" type="button" @click="goToAdd">
          + 添加书籍
        </button>
      </div>
    </header>

    <!-- 状态统计 -->
    <StatusStats
      :books="bookStore.books"
      :selected-status="selectedStatus"
      @status-click="handleStatusClick"
    />

    <!-- 批量操作工具栏 -->
    <div v-if="selectionMode && filteredBooks.length > 0" class="batch-actions-toolbar">
      <div class="batch-select-all">
        <label class="custom-checkbox">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="toggleSelectAll"
          />
          <span class="checkmark"></span>
          <span class="label-text">全选 ({{ selectedBooks.length }}/{{ filteredBooks.length }})</span>
        </label>
      </div>
      <div v-if="selectedBooks.length > 0" class="batch-status-actions">
        <span class="batch-info">已选择 {{ selectedBooks.length }} 本书籍</span>
        <div class="custom-select-wrapper">
          <select
            class="custom-select"
            @change="handleBatchStatusUpdate(($event.target as HTMLSelectElement).value)"
          >
            <option value="" disabled selected>批量修改状态</option>
            <option
              v-for="(label, key) in READING_STATUS_LABEL"
              :key="key"
              :value="key"
            >
              {{ label }}
            </option>
          </select>
        </div>
        <button class="batch-action-btn batch-tag-btn" type="button" @click="openBatchTagDialog">
          <el-icon class="icon"><PriceTag /></el-icon>
          <span>批量添加标签</span>
        </button>
        <button class="batch-action-btn batch-bookshelf-btn" type="button" @click="openAddToBookshelfDialog">
          <el-icon class="icon"><Collection /></el-icon>
          <span>添加到书架</span>
        </button>
        <button
          v-if="isCustomBookshelf"
          class="batch-action-btn batch-remove-btn"
          type="button"
          @click="handleRemoveFromBookshelf"
        >
          <el-icon class="icon"><Minus /></el-icon>
          <span>从书架移除</span>
        </button>
        <button class="batch-action-btn batch-delete-btn" type="button" @click="handleBatchDelete">
          <el-icon class="icon"><Delete /></el-icon>
          <span>批量删除</span>
        </button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <FilterBar />

    <!-- 搜索栏 -->
    <div class="search-filter-section">
      <SearchBar />
      <!-- <button
        v-if="hasActiveFilters"
        class="clear-filters-btn"
        type="button"
        @click="clearFilters"
      >
        清空筛选
      </button> -->
    </div>

    <div v-if="bookStore.loading" class="loading-container">
      <div v-if="viewMode === 'grid'" class="book-collection grid">
        <SkeletonLoader v-for="i in 8" :key="i" type="book-card" />
      </div>
      <div v-else class="book-collection list">
        <SkeletonLoader v-for="i in 5" :key="i" type="list-item" />
      </div>
    </div>

    <div v-else-if="!hasBooks" class="state-card">
      <p>当前没有书籍，点击「添加书籍」开始记录你的阅读旅程。</p>
    </div>

    <template v-else>
      <div v-if="!filteredBooks.length" class="state-card">
        <div v-if="hasActiveFilters">
          <p>没有符合筛选条件的书籍。</p>
          <!-- <button class="link-btn" type="button" @click="clearFilters">
            清空筛选条件
          </button> -->
        </div>
        <p v-else>未找到匹配的书籍，尝试调整搜索关键词。</p>
      </div>
      <!-- 普通渲染：显示所有书籍 -->
      <TransitionGroup v-else :class="['book-collection', viewMode]" name="book-list" tag="div">
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          v-memo="[book.id, book.readingStatus, book.title, viewMode, highlight, selectionMode, selectedBooks.includes(book.id)]"
          :book="book"
          :view="viewMode"
          :highlight="highlight"
          :selectable="selectionMode"
          :selected="selectedBooks.includes(book.id)"
          @toggle-select="toggleBookSelection"
        />
      </TransitionGroup>
    </template>

    <!-- 批量添加标签对话框 -->
    <div v-if="showBatchTagDialog" class="dialog-overlay" @click="showBatchTagDialog = false">
      <div class="dialog" @click.stop>
        <h3 class="dialog-title">批量添加标签</h3>
        <div class="dialog-content">
          <p class="dialog-hint">已选择 {{ selectedBooks.length }} 本书籍</p>
          <div class="tag-selector-wrapper">
            <TagSelector v-model="batchSelectedTagIds" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" type="button" @click="showBatchTagDialog = false">
            取消
          </button>
          <button
            class="btn btn-confirm"
            type="button"
            :disabled="batchSelectedTagIds.length === 0"
            @click="handleBatchAddTags"
          >
            确定
          </button>
        </div>
      </div>
    </div>

    <!-- 书架管理对话框 -->
    <BookshelfDialog
      v-model="showBookshelfDialog"
      :bookshelf="editingBookshelf"
      @success="handleBookshelfSuccess"
    />

    <!-- 添加到书架对话框 -->
    <AddToBookshelfDialog
      v-model="showAddToBookshelfDialog"
      :book-ids="selectedBooks"
      @success="handleAddToBookshelfSuccess"
    />
  </section>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.secondary-btn {
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: var(--color-bg-mute);
  color: var(--color-text-primary);
}

.secondary-btn.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.view-switcher {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 2px;
  background: var(--color-bg-soft);
}

.view-switcher button {
  border: none;
  background: transparent;
  padding: 6px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.view-switcher button.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}


.primary-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  cursor: pointer;
  font-weight: 600;
}

.search-filter-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.clear-filters-btn {
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.link-btn {
  background: none;
  color: var(--color-accent);
  border: none;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 8px;
}

.link-btn:hover {
  text-decoration: none;
}

.state-card {
  padding: 40px;
  border-radius: 16px;
  border: 1px dashed var(--color-border);
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-soft);
}

.loader {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.book-collection {
  display: grid;
  gap: 20px;
}

.book-collection.grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.book-collection.list {
  grid-template-columns: 1fr;
}

/* 列表项过渡动画 */
.book-list-enter-active,
.book-list-leave-active {
  transition: all 0.3s ease;
}

.book-list-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.book-list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

.book-list-move {
  transition: transform 0.3s ease;
}

.loading-container {
  width: 100%;
}


.batch-actions-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg-soft) 100%);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.batch-actions-toolbar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
}

.batch-select-all {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.batch-status-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.batch-info {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
  padding: 8px 12px;
  background: var(--color-bg-mute);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.batch-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.batch-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.batch-tag-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.batch-bookshelf-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.batch-remove-btn:hover {
  border-color: #f56c6c;
  color: #f56c6c;
  background: #fee;
}

.batch-delete-btn:hover {
  border-color: #f56c6c;
  color: #f56c6c;
  background: #fee;
}

.batch-action-btn .icon {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dialog-content {
  margin-bottom: 20px;
}

.dialog-hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.tag-selector-wrapper {
  min-height: 100px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
}

.btn-cancel:hover {
  background: var(--color-bg-soft);
}

.btn-confirm {
  background: var(--color-accent);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.batch-select-btn {
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.batch-select-btn:hover {
  background: var(--color-accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.batch-select-btn:active {
  transform: translateY(0);
}

/* 自定义复选框样式 */
.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.custom-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.2s ease;
  background: var(--color-surface);
}

.custom-checkbox input[type="checkbox"]:checked + .checkmark {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.custom-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input[type="checkbox"]:indeterminate + .checkmark {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.custom-checkbox input[type="checkbox"]:indeterminate + .checkmark::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 6px;
  width: 8px;
  height: 2px;
  background: white;
}

.label-text {
  flex: 1;
}

/* 自定义下拉框样式 */
.custom-select-wrapper {
  position: relative;
  display: inline-block;
}

.custom-select {
  appearance: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 36px 8px 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  font-weight: 500;
}

.custom-select:hover {
  border-color: var(--color-accent);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-soft);
}

.custom-select-wrapper::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid var(--color-text-secondary);
  pointer-events: none;
  transition: all 0.2s ease;
}

.custom-select-wrapper:hover::after {
  color: var(--color-accent);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    justify-content: space-between;
  }

  .action-group {
    width: 100%;
    justify-content: space-between;
  }

  .batch-actions-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 12px 16px;
  }

  .batch-select-all {
    order: 1;
  }

  .batch-status-actions {
    order: 2;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .batch-info {
    text-align: center;
  }

  .custom-select {
    width: 100%;
    min-width: auto;
  }

  .custom-select-wrapper {
    width: 100%;
  }
}
</style>

