<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { useTagStore } from '../stores/tag'
import BookForm from '../components/BookForm.vue'
import NetworkSearch from '../components/NetworkSearch.vue'
import TagSelector from '../components/TagSelector.vue'
import type { BookInput, SearchResult } from '../types'
import { downloadCover, fetchYoushuDetail } from '../api/search'
import * as tagAPI from '../api/tag'

const bookStore = useBookStore()
const tagStore = useTagStore()
const router = useRouter()
const submitting = ref(false)
const importing = ref(false)
const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const activeTab = ref<'manual' | 'online'>('manual')
const formInitialValue = ref<Partial<BookInput> | undefined>()
const selectedTagIds = ref<number[]>([])

onMounted(async () => {
  if (tagStore.tags.length === 0) {
    await tagStore.fetchTags()
  }
})

function switchTab(tab: 'manual' | 'online'): void {
  activeTab.value = tab
}

/**
 * 将字数四舍五入到最接近的step倍数
 * @param wordCount 原始字数
 * @param step 步长（默认1000）
 * @returns 四舍五入后的字数
 */
function roundWordCount(wordCount: number | undefined, step: number = 1000): number | undefined {
  if (!wordCount) return undefined
  return Math.round(wordCount / step) * step
}

async function handleSubmit(payload: BookInput): Promise<void> {
  try {
    submitting.value = true
    const book = await bookStore.createBook(payload)
    
    // 如果有选中的标签，批量添加
    if (selectedTagIds.value.length > 0) {
      try {
        for (const tagId of selectedTagIds.value) {
          await tagAPI.addTagToBook(book.id, tagId)
        }
      } catch (tagError) {
        console.warn('添加标签失败:', tagError)
        // 标签添加失败不影响书籍创建成功
      }
    }
    
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
    let platform = result.platform
    let category = result.category
    if (result.cover) {
      try {
        coverUrl = await downloadCover(result.cover, result.title)
      } catch (coverError) {
        console.warn('封面下载失败，使用原始链接', coverError)
      }
    }

    if ((!platform || platform === '未知平台') && result.sourceUrl) {
      try {
        const detail = await fetchYoushuDetail(result.sourceUrl)
        platform = detail.platform || platform
        category = category || detail.category
      } catch (detailError) {
        console.warn('获取作品平台信息失败，保留默认值', detailError)
      }
    }

    formInitialValue.value = {
      title: result.title,
      author: result.author,
      coverUrl,
      platform,
      category,
      description: result.description,
      wordCountDisplay: roundWordCount(result.wordCount),
      wordCountSearch: roundWordCount(result.wordCount),
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
      <div class="tag-section">
        <h3 class="section-title">标签（可选）</h3>
        <TagSelector v-model="selectedTagIds" />
      </div>
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

.tag-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

@media (max-width: 640px) {
  .network-panel {
    padding: 16px;
  }
}
</style>
