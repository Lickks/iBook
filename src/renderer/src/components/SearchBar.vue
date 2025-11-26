<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useBookStore } from '../stores/book'

const props = withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  {
    placeholder: '搜索书名、作者或描述...'
  }
)

const bookStore = useBookStore()
const keyword = ref(bookStore.searchKeyword)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function triggerSearch(value: string): void {
  bookStore.searchBooks(value)
}

watch(
  () => keyword.value,
  (value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      triggerSearch(value.trim())
    }, 300)
  }
)

watch(
  () => bookStore.searchKeyword,
  (newValue) => {
    if (newValue !== keyword.value) {
      keyword.value = newValue
    }
  }
)

function clear(): void {
  keyword.value = ''
}

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <div class="search-bar">
    <el-icon class="icon"><Search /></el-icon>
    <input
      v-model="keyword"
      type="text"
      class="search-input"
      :placeholder="props.placeholder"
      autocomplete="off"
    />
    <button v-if="keyword" class="clear-btn" type="button" @click="clear">
      清空
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 5px 25px var(--color-card-shadow);
  transition: border 0.2s ease;
}

.search-bar:focus-within {
  border-color: var(--color-accent);
}

.icon {
  font-size: 18px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 15px;
}

.search-input:focus {
  outline: none;
}

.clear-btn {
  border: none;
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  border-radius: 999px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
}

.clear-btn:hover {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
</style>

