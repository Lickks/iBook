<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookshelfStore } from '../stores/bookshelf'
import type { Bookshelf, BookshelfInput } from '../types/bookshelf'
import BookshelfDialog from '../components/BookshelfDialog.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import * as bookshelfAPI from '../api/bookshelf'

const bookshelfStore = useBookshelfStore()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingBookshelf = ref<Bookshelf | null>(null)

const bookshelves = computed(() => bookshelfStore.bookshelves)
const defaultBookshelf = computed(() => bookshelfStore.defaultBookshelf)
const customBookshelves = computed(() => bookshelfStore.customBookshelves)

onMounted(async () => {
  await bookshelfStore.fetchBookshelves()
})

function openCreateDialog(): void {
  editingBookshelf.value = null
  showCreateDialog.value = true
}

function openEditDialog(bookshelf: Bookshelf): void {
  editingBookshelf.value = bookshelf
  showEditDialog.value = true
}

function closeDialogs(): void {
  showCreateDialog.value = false
  showEditDialog.value = false
  editingBookshelf.value = null
}

async function handleDelete(bookshelf: Bookshelf): Promise<void> {
  if (bookshelf.isDefault) {
    ElMessage.warning('不能删除默认书架')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除书架「${bookshelf.name}」吗？此操作不可恢复，书架中的书籍不会被删除。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await bookshelfStore.deleteBookshelf(bookshelf.id)
    ElMessage.success('书架删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除书架失败')
      console.error('删除书架失败:', error)
    }
  }
}

async function handleSuccess(): Promise<void> {
  await bookshelfStore.fetchBookshelves()
  closeDialogs()
}

async function loadBookshelfStats(bookshelf: Bookshelf): Promise<number> {
  try {
    const stats = await bookshelfAPI.getBookshelfStats(bookshelf.id)
    return stats.totalBooks
  } catch (error) {
    return 0
  }
}
</script>

<template>
  <section class="page-container bookshelf-management">
    <header class="page-header">
      <div>
        <p class="eyebrow">内容管理</p>
        <h1>我的书架</h1>
        <p class="subtitle">共 {{ bookshelves.length }} 个书架</p>
      </div>
      <button class="primary-btn" type="button" @click="openCreateDialog">
        + 创建书架
      </button>
    </header>

    <div v-if="bookshelfStore.loading" class="loading-container">
      <div class="bookshelf-grid">
        <SkeletonLoader v-for="i in 6" :key="i" type="book-card" />
      </div>
    </div>

    <div v-else-if="bookshelves.length === 0" class="state-card">
      <p>还没有书架，点击「创建书架」开始创建你的第一个书架。</p>
    </div>

    <div v-else class="bookshelf-grid">
      <!-- 默认书架 -->
      <div v-if="defaultBookshelf" class="bookshelf-card default">
        <div class="bookshelf-header">
          <h3 class="bookshelf-name">{{ defaultBookshelf.name }}</h3>
          <span class="bookshelf-badge">全局</span>
        </div>
        <p v-if="defaultBookshelf.description" class="bookshelf-description">
          {{ defaultBookshelf.description }}
        </p>
        <div class="bookshelf-footer">
          <span class="bookshelf-count">所有书籍</span>
        </div>
      </div>

      <!-- 自定义书架 -->
      <div
        v-for="bookshelf in customBookshelves"
        :key="bookshelf.id"
        class="bookshelf-card"
      >
        <div class="bookshelf-header">
          <h3 class="bookshelf-name">{{ bookshelf.name }}</h3>
        </div>
        <p v-if="bookshelf.description" class="bookshelf-description">
          {{ bookshelf.description }}
        </p>
        <div class="bookshelf-footer">
          <span class="bookshelf-count">书籍数量：加载中...</span>
        </div>
        <div class="bookshelf-actions">
          <button
            class="action-btn edit-btn"
            type="button"
            @click="openEditDialog(bookshelf)"
          >
            编辑
          </button>
          <button
            class="action-btn delete-btn"
            type="button"
            @click="handleDelete(bookshelf)"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <BookshelfDialog
      v-model="showCreateDialog"
      :bookshelf="null"
      @success="handleSuccess"
    />
    <BookshelfDialog
      v-model="showEditDialog"
      :bookshelf="editingBookshelf"
      @success="handleSuccess"
    />
  </section>
</template>

<style scoped>
.bookshelf-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.primary-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}

.primary-btn:hover {
  background: var(--color-accent-strong);
}

.loading-container {
  width: 100%;
}

.bookshelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.bookshelf-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bookshelf-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.bookshelf-card.default {
  background: linear-gradient(135deg, var(--color-accent-soft) 0%, var(--color-surface) 100%);
  border-color: var(--color-accent);
}

.bookshelf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bookshelf-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookshelf-badge {
  background: var(--color-accent);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.bookshelf-description {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bookshelf-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.bookshelf-count {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.bookshelf-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.action-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.edit-btn:hover {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.delete-btn {
  background: var(--color-surface);
  color: #f56c6c;
  border-color: #f56c6c;
}

.delete-btn:hover {
  background: #fee;
  border-color: #f56c6c;
}

.state-card {
  padding: 40px;
  border-radius: 16px;
  border: 1px dashed var(--color-border);
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-soft);
}

@media (max-width: 640px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .bookshelf-grid {
    grid-template-columns: 1fr;
  }
}
</style>

