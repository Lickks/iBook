<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import BookForm from '../components/BookForm.vue'
import NetworkSearch from '../components/NetworkSearch.vue'
import type { BookInput, SearchResult } from '../types'
import { downloadCover } from '../api/search'

const bookStore = useBookStore()
const router = useRouter()
const submitting = ref(false)
const importing = ref(false)
const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const activeTab = ref<'manual' | 'online'>('manual')
const formInitialValue = ref<Partial<BookInput> | undefined>()

function switchTab(tab: 'manual' | 'online'): void {
  activeTab.value = tab
}

async function handleSubmit(payload: BookInput): Promise<void> {
  try {
    submitting.value = true
    const book = await bookStore.createBook(payload)
    feedback.value = { type: 'success', message: '书籍创建成功，正在跳转...' }
    setTimeout(() => {
      router.push(`/book/${book.id}`)
    }, 600)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '创建书籍失败，请稍后重试'
    feedback.value = {
      type: 'error',
      message
    }
  } finally {
    submitting.value = false
  }
}

async function handleImportFromSearch(result: SearchResult): Promise<void> {
  try {
    importing.value = true
    let coverUrl = result.cover
    if (result.cover) {
      try {
        coverUrl = await downloadCover(result.cover, result.title)
      } catch (coverError) {
        console.warn('封面下载失败，使用原始链接', coverError)
      }
    }

    formInitialValue.value = {
      title: result.title,
      author: result.author,
      coverUrl,
      platform: result.platform,
      description: result.description,
      wordCountDisplay: result.wordCount || undefined,
      sourceUrl: result.sourceUrl,
      wordCountSource: 'search'
    }

    feedback.value = {
      type: 'success',
      message: '已填充搜索结果，请核对信息后保存。'
    }
    activeTab.value = 'manual'
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '导入搜索结果失败'
    feedback.value = {
      type: 'error',
      message
    }
  } finally {
    importing.value = false
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

    <div class="tab-switcher">
      <button
        type="button"
        :class="['tab-btn', { active: activeTab === 'manual' }]"
        @click="switchTab('manual')"
      >
        手动录入
      </button>
      <button
        type="button"
        :class="['tab-btn', { active: activeTab === 'online' }]"
        @click="switchTab('online')"
      >
        从网络检索
      </button>
    </div>

    <div v-if="feedback" class="feedback" :class="feedback.type">
      {{ feedback.message }}
    </div>

    <div v-if="activeTab === 'manual'">
      <BookForm
        :initial-value="formInitialValue"
        :submitting="submitting"
        submit-label="保存书籍"
        @submit="handleSubmit"
      />
    </div>
    <div v-else class="network-panel">
      <NetworkSearch :importing="importing" @import="handleImportFromSearch" />
      <p class="tip">选择搜索结果后系统会自动下载封面并填充表单。</p>
    </div>
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

.tab-switcher {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 4px;
  background: var(--color-bg-soft);
  gap: 6px;
}

.tab-btn {
  border: none;
  border-radius: 999px;
  padding: 8px 20px;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.tab-btn.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.network-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 45px var(--color-card-shadow);
}

.tip {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

@media (max-width: 640px) {
  .network-panel {
    padding: 16px;
  }
}
</style>
