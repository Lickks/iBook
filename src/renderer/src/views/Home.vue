<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBookStore } from '../stores/book'
import { useUIStore } from '../stores/ui'
import { READING_STATUS_LABEL } from '../constants'
import SearchBar from '../components/SearchBar.vue'
import StatusStats from '../components/StatusStats.vue'
import BookCard from '../components/BookCard.vue'
import DisplayModeToggle from '../components/DisplayModeToggle.vue'

const bookStore = useBookStore()
const uiStore = useUIStore()
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


</script>

<template>
  <section class="home-view">
    <header class="section-header">
      <div>
        <p class="eyebrow">我的书架</p>
        <h2>共 {{ bookStore.books.length }} 本书籍</h2>
        <p class="subtitle">总字数 {{ bookStore.totalWordCount.toLocaleString() }} 字</p>
      </div>
      <div class="section-actions">
        <div class="action-group">
          <DisplayModeToggle />
          <button
            type="button"
            class="secondary-btn"
            @click="toggleSelectionMode"
            :class="{ active: selectionMode }"
          >
            {{ selectionMode ? '取消选择' : '批量管理' }}
          </button>
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
      </div>
    </div>

    <!-- 搜索栏和清空筛选按钮 -->
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

    <div v-if="bookStore.loading" class="state-card">
      <div class="loader" />
      <p>正在加载书籍...</p>
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
      <div v-else :class="['book-collection', viewMode]">
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          :view="viewMode"
          :highlight="highlight"
          :selectable="selectionMode"
          :selected="selectedBooks.includes(book.id)"
          @toggle-select="toggleBookSelection"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.eyebrow {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

h2 {
  margin: 4px 0;
  font-size: 28px;
  color: var(--color-text-primary);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
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
  gap: 16px;
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
  content: '▼';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--color-text-secondary);
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

