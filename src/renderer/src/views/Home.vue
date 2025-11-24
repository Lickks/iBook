<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { useUIStore } from '../stores/ui'
import SearchBar from '../components/SearchBar.vue'
import BookCard from '../components/BookCard.vue'

const bookStore = useBookStore()
const uiStore = useUIStore()
const router = useRouter()

const viewMode = computed(() => uiStore.viewMode)
const hasBooks = computed(() => bookStore.books.length > 0)
const filteredBooks = computed(() => bookStore.filteredBooks)
const highlight = computed(() => bookStore.searchKeyword)
const selectionMode = ref(false)
const selectedIds = ref<number[]>([])
const deletingBatch = ref(false)
const selectedCount = computed(() => selectedIds.value.length)
const selectedIdSet = computed(() => new Set(selectedIds.value))
const allVisibleSelected = computed(() => {
  const selectedSet = selectedIdSet.value
  return (
    filteredBooks.value.length > 0 &&
    filteredBooks.value.every((book) => selectedSet.has(book.id))
  )
})

function setViewMode(mode: 'grid' | 'list'): void {
  uiStore.setViewMode(mode)
}

function goToAdd(): void {
  router.push('/add')
}

function toggleSelectionMode(): void {
  if (selectionMode.value) {
    cancelSelection()
  } else {
    selectionMode.value = true
  }
}

function handleToggleSelect(id: number): void {
  if (!selectionMode.value) {
    selectionMode.value = true
  }
  if (selectedIdSet.value.has(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function toggleSelectAll(): void {
  if (allVisibleSelected.value) {
    selectedIds.value = []
  } else {
    selectionMode.value = true
    selectedIds.value = filteredBooks.value.map((book) => book.id)
  }
}

function cancelSelection(): void {
  selectionMode.value = false
  selectedIds.value = []
}

async function handleBatchDelete(): Promise<void> {
  if (!selectedIds.value.length) {
    return
  }
  const confirmed = window.confirm(`确定删除选中的 ${selectedIds.value.length} 本书籍吗？`)
  if (!confirmed) {
    return
  }
  deletingBatch.value = true
  try {
    await bookStore.deleteBooksBatch(selectedIds.value)
    cancelSelection()
  } catch (error) {
    console.error('批量删除失败', error)
  } finally {
    deletingBatch.value = false
  }
}

watch(
  () => bookStore.books,
  (list) => {
    const existing = new Set(list.map((book) => book.id))
    const filteredSelection = selectedIds.value.filter((id) => existing.has(id))
    if (filteredSelection.length !== selectedIds.value.length) {
      selectedIds.value = filteredSelection
    }
    if (selectionMode.value && selectedIds.value.length === 0 && !deletingBatch.value) {
      selectionMode.value = false
    }
  }
)
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
        <button class="primary-btn" type="button" @click="goToAdd">
          + 添加书籍
        </button>
        <button class="ghost-btn" type="button" @click="toggleSelectionMode">
          {{ selectionMode ? '退出批量' : '批量删除' }}
        </button>
      </div>
    </header>

    <div v-if="selectionMode" class="selection-bar">
      <span>已选 {{ selectedCount }} 本</span>
      <div class="selection-actions">
        <button class="ghost-btn" type="button" @click="toggleSelectAll">
          {{ allVisibleSelected ? '取消全选' : '全选当前列表' }}
        </button>
        <button
          class="danger-btn"
          type="button"
          :disabled="deletingBatch || !selectedCount"
          @click="handleBatchDelete"
        >
          {{ deletingBatch ? '删除中...' : '删除所选' }}
        </button>
        <button class="ghost-btn" type="button" @click="cancelSelection">取消</button>
      </div>
    </div>

    <SearchBar />

    <div v-if="bookStore.loading" class="state-card">
      <div class="loader" />
      <p>正在加载书籍...</p>
    </div>

    <div v-else-if="!hasBooks" class="state-card">
      <p>当前没有书籍，点击「添加书籍」开始记录你的阅读旅程。</p>
    </div>

    <template v-else>
      <div v-if="!filteredBooks.length" class="state-card">
        未找到匹配的书籍，尝试调整搜索关键词。
      </div>
      <div v-else :class="['book-collection', viewMode]">
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          :view="viewMode"
          :highlight="highlight"
          :selectable="selectionMode"
          :selected="selectedIdSet.has(book.id)"
          @toggle-select="handleToggleSelect"
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

.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border: 1px dashed var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
}

.selection-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ghost-btn {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 8px 18px;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.danger-btn {
  border: none;
  border-radius: 999px;
  padding: 9px 18px;
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
  font-weight: 600;
  cursor: pointer;
}

.danger-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
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
}
</style>

