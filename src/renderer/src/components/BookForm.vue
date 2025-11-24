<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { BookInput } from '../types'

const props = withDefaults(
  defineProps<{
    initialValue?: Partial<BookInput>
    submitting?: boolean
    submitLabel?: string
  }>(),
  {
    submitting: false,
    submitLabel: '保存书籍'
  }
)

const emit = defineEmits<{
  (e: 'submit', payload: BookInput): void
}>()

const form = reactive({
  title: '',
  author: '',
  coverUrl: '',
  platform: '',
  category: '',
  description: '',
  wordCount: '',
  readingStatus: 'unread',
  sourceUrl: ''
})

const errors = reactive<{ title?: string; wordCount?: string }>({})

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return
    form.title = value.title || ''
    form.author = value.author || ''
    form.coverUrl = value.coverUrl || ''
    form.platform = value.platform || ''
    form.category = value.category || ''
    form.description = value.description || ''
    form.wordCount = value.wordCountDisplay ? String(value.wordCountDisplay) : ''
    form.readingStatus = (value.readingStatus as typeof form.readingStatus) || 'unread'
    form.sourceUrl = value.sourceUrl || ''
  },
  { immediate: true }
)

const disableSubmit = computed(() => props.submitting)

function validate(): boolean {
  errors.title = !form.title.trim() ? '书名为必填项' : ''

  if (form.wordCount) {
    const parsed = Number(form.wordCount)
    errors.wordCount = Number.isNaN(parsed) || parsed < 0 ? '字数需为非负数字' : ''
  } else {
    errors.wordCount = ''
  }

  return !errors.title && !errors.wordCount
}

function handleSubmit(): void {
  if (!validate()) return

  const parsedWordCount = form.wordCount ? Number(form.wordCount) : undefined

  const payload: BookInput = {
    title: form.title.trim(),
    author: form.author.trim() || undefined,
    coverUrl: form.coverUrl.trim() || undefined,
    platform: form.platform.trim() || undefined,
    category: form.category.trim() || undefined,
    description: form.description.trim() || undefined,
    wordCountDisplay:
      parsedWordCount !== undefined && !Number.isNaN(parsedWordCount) ? parsedWordCount : undefined,
    readingStatus: form.readingStatus,
    sourceUrl: form.sourceUrl || undefined
  }

  // 如果用户输入了字数，且没有设置字数来源（说明是纯手动录入），则设置为手动输入
  if (parsedWordCount !== undefined && !Number.isNaN(parsedWordCount)) {
    const existingSource = props.initialValue?.wordCountSource

    // 如果已有来源，保持原来的来源和对应字段
    if (existingSource) {
      payload.wordCountSource = existingSource
      if (existingSource === 'search') {
        payload.wordCountSearch = props.initialValue?.wordCountSearch
      } else if (existingSource === 'document') {
        payload.wordCountDocument = props.initialValue?.wordCountDocument
      } else if (existingSource === 'manual') {
        payload.wordCountManual = parsedWordCount
      }
    } else {
      // 没有来源，说明是纯手动录入，设置为 manual
      payload.wordCountSource = 'manual'
      payload.wordCountManual = parsedWordCount
    }
  }

  emit('submit', payload)
}

function handleCoverUpload(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    form.coverUrl = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <form class="book-form" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <label class="form-field">
        <span>书名 *</span>
        <input v-model="form.title" type="text" placeholder="请输入书名" required />
        <small v-if="errors.title" class="error">{{ errors.title }}</small>
      </label>

      <label class="form-field">
        <span>作者</span>
        <input v-model="form.author" type="text" placeholder="作者姓名" />
      </label>

      <label class="form-field">
        <span>封面链接</span>
        <input v-model="form.coverUrl" type="url" placeholder="https://example.com/cover.jpg" />
        <small>支持直接粘贴图片链接或上传文件。</small>
      </label>

      <label class="form-field upload-field">
        <span>封面上传</span>
        <input type="file" accept="image/*" @change="handleCoverUpload" />
      </label>

      <label class="form-field">
        <span>平台</span>
        <input v-model="form.platform" type="text" placeholder="起点、纵横..." />
      </label>

      <label class="form-field">
        <span>类型</span>
        <input v-model="form.category" type="text" placeholder="玄幻、都市..." />
      </label>

      <label class="form-field">
        <span>字数</span>
        <input
          v-model="form.wordCount"
          type="number"
          min="0"
          step="1000"
          placeholder="例如：1200000"
        />
        <small v-if="errors.wordCount" class="error">{{ errors.wordCount }}</small>
      </label>

      <label class="form-field">
        <span>阅读状态</span>
        <select v-model="form.readingStatus">
          <option value="unread">未读</option>
          <option value="reading">阅读中</option>
          <option value="finished">已读完</option>
          <option value="dropped">弃读</option>
          <option value="to-read">待读</option>
        </select>
      </label>
    </div>

    <label class="form-field">
      <span>描述</span>
      <textarea v-model="form.description" rows="4" placeholder="简介或个人备注" />
    </label>

    <div class="form-actions">
      <button class="primary-btn" type="submit" :disabled="disableSubmit">
        {{ submitting ? '提交中...' : submitLabel }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.book-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 45px var(--color-card-shadow);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.form-field input,
.form-field select,
.form-field textarea {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-soft);
  transition: border 0.2s ease;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.upload-field input {
  padding: 8px 0;
}

.error {
  color: var(--color-danger);
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  background: var(--color-accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.primary-btn[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .book-form {
    padding: 16px;
  }
}
</style>
