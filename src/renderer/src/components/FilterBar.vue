<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useBookStore } from '../stores/book'
import { useTagStore } from '../stores/tag'
import { SORT_BY, SORT_BY_LABEL, SORT_ORDER, SORT_ORDER_LABEL } from '../constants'

const bookStore = useBookStore()
const tagStore = useTagStore()

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// 本地状态，用于防抖
const localCategory = ref<string | null>(bookStore.selectedCategory)
const localPlatform = ref<string | null>(bookStore.selectedPlatform)

// 防抖更新函数
function debouncedUpdate(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    bookStore.setSelectedCategory(localCategory.value)
    bookStore.setSelectedPlatform(localPlatform.value)
  }, 300)
}

const selectedCategory = computed({
  get: () => localCategory.value,
  set: (value) => {
    localCategory.value = value
    debouncedUpdate()
  }
})

const selectedPlatform = computed({
  get: () => localPlatform.value,
  set: (value) => {
    localPlatform.value = value
    debouncedUpdate()
  }
})

const selectedTags = computed({
  get: () => bookStore.selectedTags,
  set: (value) => bookStore.setSelectedTags(value)
})

const sortBy = computed({
  get: () => bookStore.sortBy,
  set: (value) => bookStore.setSort(value, bookStore.sortOrder)
})

const sortOrder = computed({
  get: () => bookStore.sortOrder,
  set: (value) => {
    bookStore.setSort(bookStore.sortBy, value)
  }
})

const selectedTagObjects = computed(() => {
  return tagStore.tags.filter(tag => selectedTags.value.includes(tag.id))
})

const availableTagObjects = computed(() => {
  return tagStore.tags.filter(tag => !selectedTags.value.includes(tag.id))
})

onMounted(async () => {
  if (tagStore.tags.length === 0) {
    await tagStore.fetchTags()
  }
})

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

function toggleTag(tagId: number): void {
  bookStore.toggleTagFilter(tagId)
}

function removeTag(tagId: number): void {
  bookStore.setSelectedTags(selectedTags.value.filter(id => id !== tagId))
}

function clearAllFilters(): void {
  bookStore.clearAllFilters()
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-group">
      <label class="filter-label">类型</label>
      <select v-model="selectedCategory" class="filter-select">
        <option :value="null">全部类型</option>
        <option v-for="category in bookStore.availableCategories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">平台</label>
      <select v-model="selectedPlatform" class="filter-select">
        <option :value="null">全部平台</option>
        <option v-for="platform in bookStore.availablePlatforms" :key="platform" :value="platform">
          {{ platform }}
        </option>
      </select>
    </div>

    <div class="filter-group filter-group--tags">
      <label class="filter-label">标签</label>
      <div class="tag-filter">
        <div class="tag-filter-content">
          <!-- 已选标签 -->
          <div v-if="selectedTagObjects.length > 0" class="selected-tags-section">
            <span
              v-for="tag in selectedTagObjects"
              :key="tag.id"
              class="tag-chip tag-chip--selected"
              :style="{
                '--tag-color': tag.color || '#909399',
                '--tag-bg': `${tag.color || '#909399'}20`,
                '--tag-border': `${tag.color || '#909399'}60`
              }"
              @click="removeTag(tag.id)"
            >
              <span class="tag-dot" />
              <span class="tag-name">{{ tag.tagName }}</span>
              <span class="tag-remove">×</span>
            </span>
          </div>
          
          <!-- 可选标签 -->
          <div v-if="availableTagObjects.length > 0" class="available-tags-section">
            <button
              v-for="tag in availableTagObjects"
              :key="tag.id"
              class="tag-chip tag-chip--available"
              type="button"
              :style="{
                '--tag-color': tag.color || '#909399',
                '--tag-bg': `${tag.color || '#909399'}10`,
                '--tag-border': `${tag.color || '#909399'}30`
              }"
              @click="toggleTag(tag.id)"
            >
              <span class="tag-dot" />
              <span class="tag-name">{{ tag.tagName }}</span>
            </button>
          </div>
          
          <!-- 空状态 -->
          <div v-if="selectedTagObjects.length === 0 && availableTagObjects.length === 0" class="tag-empty-state">
            <span class="empty-text">暂无标签</span>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-group">
      <label class="filter-label">排序</label>
      <div class="sort-controls">
        <select v-model="sortBy" class="filter-select">
          <option :value="null">默认</option>
          <option v-for="(label, key) in SORT_BY_LABEL" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
        <select v-if="sortBy" v-model="sortOrder" class="filter-select sort-order">
          <option v-for="(label, key) in SORT_ORDER_LABEL" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="bookStore.hasActiveFilters" class="filter-actions">
      <button class="clear-btn" type="button" @click="clearAllFilters">清空筛选</button>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  padding: 16px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.filter-group--tags {
  flex: 1;
  min-width: 200px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.sort-controls {
  display: flex;
  gap: 8px;
}

.sort-order {
  min-width: 80px;
}

.tag-filter {
  width: 100%;
}

.tag-filter-content {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 32px;
  padding: 4px 0;
}

.selected-tags-section {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.available-tags-section {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  border: 1px solid var(--tag-border, var(--color-border));
  background: var(--tag-bg, var(--color-bg-muted));
  color: var(--tag-color, var(--color-text-primary));
  cursor: pointer;
  user-select: none;
}

.tag-chip--selected {
  background: var(--tag-bg);
  border-color: var(--tag-border);
  color: var(--tag-color);
  padding-right: 6px;
}

.tag-chip--available {
  background: var(--tag-bg);
  border-color: var(--tag-border);
  color: var(--tag-color);
  opacity: 0.7;
}

.tag-chip--available:hover {
  opacity: 1;
  background: var(--tag-color);
  color: white;
  border-color: var(--tag-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-chip--available:hover .tag-dot {
  background: white;
}

.tag-chip--selected:hover {
  background: var(--tag-color);
  color: white;
  border-color: var(--tag-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-chip--selected:hover .tag-dot,
.tag-chip--selected:hover .tag-remove {
  color: white;
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tag-color);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.tag-name {
  font-weight: 500;
  line-height: 1.2;
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 2px;
  font-size: 16px;
  line-height: 1;
  color: var(--tag-color);
  opacity: 0.6;
  transition: all 0.2s ease;
  border-radius: 50%;
}

.tag-chip--selected:hover .tag-remove {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

.tag-empty-state {
  padding: 8px 0;
  width: 100%;
}

.empty-text {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-style: italic;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  margin-left: auto;
}

.clear-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--color-bg-soft);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    margin-left: 0;
  }

  .clear-btn {
    width: 100%;
  }
}
</style>

