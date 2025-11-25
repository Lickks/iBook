<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useBookshelfStore } from '../stores/bookshelf'

interface Props {
  modelValue: boolean
  bookIds: number[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const bookshelfStore = useBookshelfStore()

const selectedBookshelfIds = ref<number[]>([])
const loading = ref(false)

const availableBookshelves = computed(() => {
  // 排除默认书架，因为所有书籍默认都在全局书架中
  return bookshelfStore.customBookshelves
})

onMounted(async () => {
  try {
    await bookshelfStore.fetchBookshelves()
  } catch (error: any) {
    console.error('加载书架列表失败:', error)
  }
})

watch(() => props.modelValue, (visible) => {
  if (visible) {
    selectedBookshelfIds.value = []
  }
})

async function handleSubmit(): Promise<void> {
  if (selectedBookshelfIds.value.length === 0) {
    ElMessage.warning('请至少选择一个书架')
    return
  }

  if (props.bookIds.length === 0) {
    ElMessage.warning('没有选中的书籍')
    return
  }

  loading.value = true
  try {
    // 确保 bookIds 是纯数组，避免序列化问题
    const bookIds = Array.isArray(props.bookIds) ? [...props.bookIds] : []
    let totalCount = 0
    for (const bookshelfId of selectedBookshelfIds.value) {
      const count = await bookshelfStore.addBooksToBookshelf(bookshelfId, bookIds)
      totalCount += count
    }
    ElMessage.success(`已将 ${totalCount} 本书籍添加到 ${selectedBookshelfIds.value.length} 个书架`)
    emit('success')
    emit('update:modelValue', false)
  } catch (error: any) {
    ElMessage.error(error.message || '添加书籍到书架失败')
    console.error('添加书籍到书架失败:', error)
  } finally {
    loading.value = false
  }
}

function handleCancel(): void {
  emit('update:modelValue', false)
}

function toggleBookshelf(bookshelfId: number): void {
  const index = selectedBookshelfIds.value.indexOf(bookshelfId)
  if (index === -1) {
    selectedBookshelfIds.value.push(bookshelfId)
  } else {
    selectedBookshelfIds.value.splice(index, 1)
  }
}
</script>

<template>
  <div v-if="modelValue" class="dialog-overlay" @click="handleCancel">
    <div class="dialog" @click.stop>
      <h3 class="dialog-title">添加到书架</h3>
      <div class="dialog-content">
        <p class="dialog-hint">已选择 {{ bookIds.length }} 本书籍</p>
        <div v-if="availableBookshelves.length === 0" class="empty-state">
          <p>还没有自定义书架，请先创建书架</p>
        </div>
        <div v-else class="bookshelf-list">
          <div
            v-for="bookshelf in availableBookshelves"
            :key="bookshelf.id"
            class="bookshelf-item"
            :class="{ selected: selectedBookshelfIds.includes(bookshelf.id) }"
            @click="toggleBookshelf(bookshelf.id)"
          >
            <div class="checkbox">
              <input
                type="checkbox"
                :checked="selectedBookshelfIds.includes(bookshelf.id)"
                @change="toggleBookshelf(bookshelf.id)"
                @click.stop
              />
            </div>
            <div class="bookshelf-info">
              <div class="bookshelf-name">{{ bookshelf.name }}</div>
              <div v-if="bookshelf.description" class="bookshelf-description">
                {{ bookshelf.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-cancel" type="button" @click="handleCancel" :disabled="loading">
          取消
        </button>
        <button
          class="btn btn-confirm"
          type="button"
          @click="handleSubmit"
          :disabled="loading || selectedBookshelfIds.length === 0 || availableBookshelves.length === 0"
        >
          {{ loading ? '处理中...' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  max-height: 80vh;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.dialog-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dialog-content {
  margin-bottom: 20px;
  flex: 1;
  overflow-y: auto;
}

.dialog-hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-secondary);
}

.bookshelf-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bookshelf-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-bg);
}

.bookshelf-item:hover {
  border-color: var(--color-accent);
  background: var(--color-bg-soft);
}

.bookshelf-item.selected {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.checkbox {
  flex-shrink: 0;
}

.checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.bookshelf-info {
  flex: 1;
  min-width: 0;
}

.bookshelf-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.bookshelf-description {
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-shrink: 0;
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

.btn-cancel:hover:not(:disabled) {
  background: var(--color-bg-soft);
}

.btn-confirm {
  background: var(--color-accent);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

