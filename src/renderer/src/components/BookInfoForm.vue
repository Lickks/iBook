<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElForm, ElFormItem, ElInput, ElDatePicker, ElSelect, ElOption } from 'element-plus'
import { useTxtToEpubStore } from '../stores/txtToEpub'
import type { BookMetadata } from '../types/txtToEpub'

const store = useTxtToEpubStore()

const form = ref<BookMetadata>({ ...store.metadata })
const errors = ref<{ title?: string; isbn?: string }>({})

// 语言选项
const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: '英文', value: 'en-US' },
  { label: '日文', value: 'ja-JP' },
  { label: '韩文', value: 'ko-KR' }
]

// 监听表单变化，同步到 store
watch(
  form,
  (newForm) => {
    store.metadata = { ...newForm }
  },
  { deep: true }
)

// 监听 store 变化，同步到表单
watch(
  () => store.metadata,
  (newMetadata) => {
    form.value = { ...newMetadata }
  },
  { deep: true }
)

// 验证表单
function validate(): boolean {
  errors.value = {}

  if (!form.value.title || !form.value.title.trim()) {
    errors.value.title = '书名为必填项'
    return false
  }

  // 验证 ISBN（如果填写）
  if (form.value.isbn) {
    const isbn = form.value.isbn.replace(/[-\s]/g, '')
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
    <el-form :model="form" label-width="100px">
      <el-form-item label="书名" :error="errors.title" required>
        <el-input v-model="form.title" placeholder="请输入书名" maxlength="200" show-word-limit />
      </el-form-item>

      <el-form-item label="作者">
        <el-input v-model="form.author" placeholder="请输入作者（多个作者用逗号分隔）" maxlength="100" />
      </el-form-item>

      <el-form-item label="简介">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="5"
          placeholder="请输入书籍简介"
          maxlength="5000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="出版社">
        <el-input v-model="form.publisher" placeholder="请输入出版社" maxlength="100" />
      </el-form-item>

      <el-form-item label="ISBN" :error="errors.isbn">
        <el-input v-model="form.isbn" placeholder="请输入 ISBN（10 位或 13 位）" maxlength="17" />
      </el-form-item>

      <el-form-item label="出版日期">
        <el-date-picker
          v-model="form.publishDate"
          type="date"
          placeholder="选择出版日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="语言">
        <el-select v-model="form.language" style="width: 100%">
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
          v-model="form.tags"
          placeholder="请输入标签（多个标签用逗号分隔）"
          @input="
            (val) => {
              form.tags = val ? val.split(',').map((t) => t.trim()).filter((t) => t) : []
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
  background: var(--color-bg);
  border-radius: 8px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}
</style>

