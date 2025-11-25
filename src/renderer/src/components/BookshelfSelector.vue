<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useBookshelfStore } from '../stores/bookshelf'
import { useBookStore } from '../stores/book'

const bookshelfStore = useBookshelfStore()
const bookStore = useBookStore()

const bookshelves = computed(() => bookshelfStore.bookshelves)
const currentBookshelf = computed(() => bookshelfStore.currentBookshelf)

onMounted(async () => {
  try {
    await bookshelfStore.fetchBookshelves()
    // 如果没有当前书架，设置为默认书架
    if (!bookshelfStore.currentBookshelfId && bookshelfStore.defaultBookshelf) {
      bookshelfStore.setCurrentBookshelf(bookshelfStore.defaultBookshelf.id)
      await bookStore.fetchBooks()
    }
  } catch (error: any) {
    ElMessage.error('加载书架列表失败')
    console.error('加载书架列表失败:', error)
  }
})

function handleBookshelfChange(bookshelfId: number | null): void {
  bookshelfStore.setCurrentBookshelf(bookshelfId)
  bookStore.setCurrentBookshelf(bookshelfId)
  // 重新获取书籍列表
  bookStore.fetchBooks()
}
</script>

<template>
  <div class="bookshelf-selector">
    <div class="custom-select-wrapper">
      <select
        class="custom-select"
        :value="bookshelfStore.currentBookshelfId"
        @change="handleBookshelfChange(($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
      >
        <option
          v-for="bookshelf in bookshelves"
          :key="bookshelf.id"
          :value="bookshelf.id"
        >
          {{ bookshelf.name }}{{ bookshelf.isDefault ? ' (全局)' : '' }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.bookshelf-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

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
  min-width: 160px;
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
</style>

