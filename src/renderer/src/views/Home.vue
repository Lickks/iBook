<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { useUIStore } from '../stores/ui'
import SearchBar from '../components/SearchBar.vue'
import StatusFilter from '../components/StatusFilter.vue'
import StatusStats from '../components/StatusStats.vue'
import BookCard from '../components/BookCard.vue'

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
        </div>
    </header>

    <!-- 状态统计 -->
    <StatusStats
      :books="bookStore.books"
      :selected-status="selectedStatus"
      @status-click="handleStatusClick"
    />

    <!-- 搜索栏和状态筛选器 -->
    <div class="search-filter-section">
      <SearchBar />
      <StatusFilter
        v-model="selectedStatus"
        placeholder="筛选状态"
        style="margin-left: 12px;"
      />
      <button
        v-if="hasActiveFilters"
        class="clear-filters-btn"
        type="button"
        @click="clearFilters"
      >
        清空筛选
      </button>
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
          <button class="link-btn" type="button" @click="clearFilters">
            清空筛选条件
          </button>
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

