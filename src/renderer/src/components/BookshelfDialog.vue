<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useBookshelfStore } from '../stores/bookshelf'
import type { Bookshelf, BookshelfInput } from '../types/bookshelf'

interface Props {
  modelValue: boolean
  bookshelf?: Bookshelf | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  bookshelf: null
})

const emit = defineEmits<Emits>()

const bookshelfStore = useBookshelfStore()

const name = ref('')
const description = ref('')
const loading = ref(false)

const isEdit = computed(() => !!props.bookshelf)
const dialogTitle = computed(() => isEdit.value ? '编辑书架' : '创建书架')

watch(() => props.modelValue, (visible) => {
  if (visible) {
    if (props.bookshelf) {
      name.value = props.bookshelf.name
      description.value = props.bookshelf.description || ''
    } else {
      name.value = ''
      description.value = ''
    }
  }
})

watch(() => props.bookshelf, (bookshelf) => {
  if (bookshelf) {
    name.value = bookshelf.name
    description.value = bookshelf.description || ''
  } else {
    name.value = ''
    description.value = ''
  }
})

async function handleSubmit(): Promise<void> {
  if (!name.value.trim()) {
    ElMessage.warning('请输入书架名称')
    return
  }

  loading.value = true
  try {
    if (isEdit.value && props.bookshelf) {
      await bookshelfStore.updateBookshelf(props.bookshelf.id, {
        name: name.value.trim(),
        description: description.value.trim() || undefined
      })
      ElMessage.success('书架更新成功')
    } else {
      await bookshelfStore.createBookshelf(name.value.trim(), description.value.trim() || undefined)
      ElMessage.success('书架创建成功')
    }
    emit('success')
    emit('update:modelValue', false)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
    console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
}

function handleCancel(): void {
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="dialog-overlay" @click="handleCancel">
    <div class="dialog" @click.stop>
      <h3 class="dialog-title">{{ dialogTitle }}</h3>
      <div class="dialog-content">
        <div class="form-group">
          <label class="form-label">书架名称 <span class="required">*</span></label>
          <input
            v-model="name"
            type="text"
            class="form-input"
            placeholder="请输入书架名称"
            maxlength="100"
            @keyup.enter="handleSubmit"
          />
        </div>
        <div class="form-group">
          <label class="form-label">书架描述</label>
          <textarea
            v-model="description"
            class="form-textarea"
            placeholder="请输入书架描述（可选）"
            rows="3"
            maxlength="500"
          />
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
          :disabled="loading || !name.trim()"
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

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.required {
  color: #f56c6c;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg);
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-soft);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
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

