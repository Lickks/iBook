<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import BookForm from '../components/BookForm.vue'
import type { BookInput } from '../types'

const bookStore = useBookStore()
const router = useRouter()
const submitting = ref(false)
const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

async function handleSubmit(payload: BookInput): Promise<void> {
  try {
    submitting.value = true
    const book = await bookStore.createBook(payload)
    feedback.value = { type: 'success', message: '书籍创建成功，正在跳转...' }
    setTimeout(() => {
      router.push(`/book/${book.id}`)
    }, 600)
  } catch (error: any) {
    feedback.value = {
      type: 'error',
      message: error?.message || '创建书籍失败，请稍后重试'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="add-book">
    <header class="page-header">
      <div>
        <p class="eyebrow">新增书籍</p>
        <h2>手动录入书籍信息</h2>
        <p class="subtitle">完善书籍信息，方便后续检索与管理。</p>
      </div>
    </header>

    <div v-if="feedback" class="feedback" :class="feedback.type">
      {{ feedback.message }}
    </div>

    <BookForm :submitting="submitting" submit-label="保存书籍" @submit="handleSubmit" />
  </section>
</template>

<style scoped>
.add-book {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header h2 {
  font-size: 26px;
  margin-bottom: 4px;
  color: var(--color-text-primary);
}

.subtitle {
  color: var(--color-text-secondary);
}

.feedback {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
}

.feedback.success {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.feedback.error {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
}
</style>

