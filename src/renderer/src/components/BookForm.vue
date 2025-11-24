<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
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
const coverInputRef = ref<HTMLInputElement>()

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

function triggerFileInput(): void {
  coverInputRef.value?.click()
}

function removeCover(): void {
  form.coverUrl = ''
  if (coverInputRef.value) {
    coverInputRef.value.value = ''
  }
}
</script>

<template>
  <form class="book-form" @submit.prevent="handleSubmit">
    <!-- 主要信息区域 -->
    <div class="form-main-section">
      <!-- 左侧：基本信息 -->
      <div class="basic-info-section">
        <h3 class="section-title">基本信息</h3>

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
      </div>

      <!-- 右侧：封面区域 -->
      <div class="cover-section">
        <h3 class="section-title">书籍封面</h3>

        <div class="cover-upload-area">
          <div class="cover-preview" v-if="form.coverUrl">
            <img :src="form.coverUrl" alt="封面预览" />
            <div class="cover-overlay">
              <button type="button" class="remove-btn" @click="removeCover">×</button>
              <button type="button" class="change-btn" @click="triggerFileInput">更换封面</button>
            </div>
          </div>
          <div v-else class="upload-placeholder" @click="triggerFileInput">
            <div class="upload-icon">📷</div>
            <div class="upload-text">
              <p>点击上传封面</p>
              <small>支持 JPG、PNG 格式</small>
            </div>
          </div>
          <input
            ref="coverInputRef"
            type="file"
            accept="image/*"
            @change="handleCoverUpload"
            class="hidden-input"
          />
        </div>

        <div class="cover-link-section">
          <label class="form-field">
            <span>或输入封面链接</span>
            <input v-model="form.coverUrl" type="url" placeholder="https://example.com/cover.jpg" />
          </label>
        </div>
      </div>
    </div>

    <!-- 详细信息区域 -->
    <div class="form-detail-section">
      <h3 class="section-title">详细信息</h3>

      <label class="form-field">
        <span>书籍描述</span>
        <textarea v-model="form.description" rows="4" placeholder="简介或个人备注" />
      </label>

      <label class="form-field">
        <span>源链接</span>
        <input v-model="form.sourceUrl" type="url" placeholder="书籍来源链接（可选）" />
      </label>
    </div>

    <!-- 操作按钮 -->
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
  gap: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 32px;
  box-shadow: 0 20px 45px var(--color-card-shadow);
}

/* 区域标题样式 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: var(--color-accent);
  border-radius: 2px;
}

/* 主要信息区域布局 */
.form-main-section {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: start;
}

.basic-info-section {
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.form-field span {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 13px;
}

.form-field input,
.form-field select,
.form-field textarea {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-soft);
  transition: all 0.2s ease;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-field textarea {
  resize: vertical;
  min-height: 100px;
}

/* 封面区域样式 */
.cover-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 200px;
}

.cover-upload-area {
  position: relative;
  display: flex;
  justify-content: center;
}

.cover-preview {
  position: relative;
  width: 140px;
  height: 186px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px var(--color-card-shadow);
  border: 2px solid var(--color-border);
  transition: all 0.3s ease;
}

.cover-preview:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px var(--color-card-shadow);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--color-bg-soft);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  gap: 12px;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.remove-btn {
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.remove-btn:hover {
  background: #d73527;
  transform: scale(1.1);
}

.change-btn {
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-btn:hover {
  background: #0b88e3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.upload-placeholder {
  width: 140px;
  height: 186px;
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-soft);
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 12px;
}

.upload-placeholder:hover {
  border-color: var(--color-accent);
  background: linear-gradient(135deg, var(--color-bg-soft), rgba(59, 130, 246, 0.08));
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.1);
}

.upload-icon {
  font-size: 36px;
  opacity: 0.7;
}

.upload-text {
  text-align: center;
  color: var(--color-text-secondary);
}

.upload-text p {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: var(--color-text-primary);
}

.upload-text small {
  font-size: 12px;
  opacity: 0.7;
}

.hidden-input {
  display: none;
}

.cover-link-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cover-link-section .form-field {
  max-width: 200px;
}

/* 详细信息区域 */
.form-detail-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 8px;
}

/* 操作按钮区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.primary-btn {
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  background: var(--color-accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.primary-btn:hover:not(:disabled) {
  background: #0b88e3;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.primary-btn[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .form-main-section {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .cover-section {
    align-self: center;
    max-width: 300px;
  }
}

@media (max-width: 640px) {
  .book-form {
    padding: 24px 20px;
    gap: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .cover-preview,
  .upload-placeholder {
    width: 120px;
    height: 160px;
  }

  .upload-icon {
    font-size: 28px;
  }

  .form-main-section {
    gap: 24px;
  }

  .cover-link-section .form-field {
    max-width: none;
  }
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
