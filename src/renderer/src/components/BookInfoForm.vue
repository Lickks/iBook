<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElForm, ElFormItem, ElInput, ElDatePicker, ElSelect, ElOption } from 'element-plus'
import { useTxtToEpubStore } from '../stores/txtToEpub'
import type { BookMetadata } from '../types/txtToEpub'

const store = useTxtToEpubStore()

// 直接使用store.metadata的引用，避免创建副本导致的同步问题
const metadata = store.metadata
const errors = ref<{ title?: string; isbn?: string }>({})

// 语言选项
const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: '英文', value: 'en-US' },
  { label: '日文', value: 'ja-JP' },
  { label: '韩文', value: 'ko-KR' }
]

// 验证表单
function validate(): boolean {
  errors.value = {}

  if (!metadata.title || !metadata.title.trim()) {
    errors.value.title = '书名为必填项'
    return false
  }

  // 验证 ISBN（如果填写）
  if (metadata.isbn) {
    const isbn = String(metadata.isbn).replace(/[-\s]/g, '')
    if (isbn.length !== 10 && isbn.length !== 13) {
      errors.value.isbn = 'ISBN 格式不正确（应为 10 位或 13 位）'
      return false
    }
  }

  return true
}

// 暴露验证方法
defineExpose({
  validate
})
</script>

<template>
  <div class="book-info-form">
    <el-form :model="metadata" label-width="100px">
      <el-form-item label="书名" :error="errors.title" required>
        <el-input v-model="metadata.title" placeholder="请输入书名" maxlength="200" show-word-limit />
      </el-form-item>

      <el-form-item label="作者">
        <el-input v-model="metadata.author" placeholder="请输入作者（多个作者用逗号分隔）" maxlength="100" />
      </el-form-item>

      <el-form-item label="简介">
        <el-input
          v-model="metadata.description"
          type="textarea"
          :rows="5"
          placeholder="请输入书籍简介"
          maxlength="5000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="出版社">
        <el-input v-model="metadata.publisher" placeholder="请输入出版社" maxlength="100" />
      </el-form-item>

      <el-form-item label="ISBN" :error="errors.isbn">
        <el-input v-model="metadata.isbn" placeholder="请输入 ISBN（10 位或 13 位）" maxlength="17" />
      </el-form-item>

      <el-form-item label="出版日期">
        <el-date-picker
          v-model="metadata.publishDate"
          type="date"
          placeholder="选择出版日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="语言">
        <el-select v-model="metadata.language" style="width: 100%">
          <el-option
            v-for="option in languageOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="标签">
        <el-input
          :model-value="Array.isArray(metadata.tags) ? metadata.tags.join(',') : ''"
          placeholder="请输入标签（多个标签用逗号分隔）"
          @input="
            (val) => {
              metadata.tags = val ? val.split(',').map((t) => t.trim()).filter((t) => t) : []
            }
          "
        />
        <div class="form-hint">多个标签用逗号分隔</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.book-info-form {
  padding: 20px;
  background: transparent;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  transition: all 0.3s ease;
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  opacity: 0.8;
}

:deep(.el-form-item__error) {
  color: var(--el-color-error);
  font-size: 12px;
  padding-top: 4px;
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes shake {
  10%, 90% {
    transform: translateX(-2px);
  }
  20%, 80% {
    transform: translateX(2px);
  }
  30%, 50%, 70% {
    transform: translateX(-2px);
  }
  40%, 60% {
    transform: translateX(2px);
  }
}

/* 表单项进入动画 */
:deep(.el-form-item) {
  animation: fadeInLeft 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) backwards;
}

:deep(.el-form-item:nth-child(1)) {
  animation-delay: 0.05s;
}

:deep(.el-form-item:nth-child(2)) {
  animation-delay: 0.1s;
}

:deep(.el-form-item:nth-child(3)) {
  animation-delay: 0.15s;
}

:deep(.el-form-item:nth-child(4)) {
  animation-delay: 0.2s;
}

:deep(.el-form-item:nth-child(5)) {
  animation-delay: 0.25s;
}

:deep(.el-form-item:nth-child(6)) {
  animation-delay: 0.3s;
}

:deep(.el-form-item:nth-child(7)) {
  animation-delay: 0.35s;
}

:deep(.el-form-item:nth-child(8)) {
  animation-delay: 0.4s;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

