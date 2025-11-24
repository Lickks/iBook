<script setup lang="ts">
import { ref } from 'vue'
import type { SearchResult } from '../types'
import { searchYoushu } from '../api/search'

const props = withDefaults(
  defineProps<{
    importing?: boolean
  }>(),
  {
    importing: false
  }
)

const emit = defineEmits<{
  (e: 'import', payload: SearchResult): void
}>()

const keyword = ref('')
const loading = ref(false)
const error = ref('')
const hasSearched = ref(false)
const results = ref<SearchResult[]>([])

async function handleSearch(): Promise<void> {
  if (!keyword.value.trim() || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const data = await searchYoushu(keyword.value.trim())
    results.value = data
    hasSearched.value = true
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '搜索失败，请稍后重试'
    error.value = message
    results.value = []
    hasSearched.value = true
  } finally {
    loading.value = false
  }
}

function handleImport(result: SearchResult): void {
  emit('import', result)
}

function formatWordCount(wordCount: number): string {
  if (!wordCount) return '未知字数'
  return wordCount >= 10000
    ? `${(wordCount / 10000).toFixed(1)} 万字`
    : `${wordCount.toLocaleString()} 字`
}

function handleCoverError(result: SearchResult): void {
  result.cover = ''
}
</script>

<template>
  <section class="network-search">
    <div class="search-controls">
      <div class="input-wrapper">
        <input
          v-model="keyword"
          type="text"
          placeholder="输入书名或作者，例如：诡秘之主"
          @keyup.enter.prevent="handleSearch"
        />
      </div>
      <button
        type="button"
        class="primary-btn"
        :disabled="loading || !keyword.trim()"
        @click="handleSearch"
      >
        {{ loading ? '检索中...' : '开始搜索' }}
      </button>
    </div>
    <p class="hint">数据来源：youshu.me，仅供学习交流使用。</p>

    <div v-if="error" class="feedback error">
      {{ error }}
    </div>

    <div v-else-if="loading" class="state-card">
      <div class="loader" />
      正在爬取搜索结果...
    </div>

    <div v-else-if="!results.length && hasSearched" class="state-card">
      暂无搜索结果，尝试更换关键词或缩短关键词长度。
    </div>

    <div v-else class="results-list">
      <article
        v-for="result in results"
        :key="result.sourceUrl || result.title"
        class="result-card"
      >
        <div class="cover">
          <img
            v-if="result.cover"
            :src="result.cover"
            :alt="result.title"
            loading="lazy"
            @error="handleCoverError(result)"
          />
          <span v-else>{{ result.title.slice(0, 1).toUpperCase() }}</span>
        </div>
        <div class="content">
          <header>
            <h3>{{ result.title }}</h3>
            <p class="meta">
              <span>{{ result.author || '未知作者' }}</span>
              <span class="dot">•</span>
              <span>{{ result.category || '未知类型' }}</span>
              <span class="dot">•</span>
              <span>{{ formatWordCount(result.wordCount) }}</span>
            </p>
          </header>
          <p class="desc">
            {{ result.description || '暂无简介' }}
          </p>
          <footer>
            <a
              v-if="result.sourceUrl"
              class="ghost-btn"
              :href="result.sourceUrl"
              target="_blank"
              rel="noreferrer"
            >
              查看原站
            </a>
            <button
              class="primary-btn"
              type="button"
              :disabled="props.importing"
              @click="handleImport(result)"
            >
              {{ props.importing ? '导入中...' : '填充到表单' }}
            </button>
          </footer>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.network-search {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.input-wrapper {
  flex: 1;
  min-width: 260px;
}

.input-wrapper input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 12px 16px;
  font-size: 14px;
  background: var(--color-bg-soft);
}

.primary-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.feedback {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
}

.feedback.error {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}

.state-card {
  padding: 28px;
  text-align: center;
  border-radius: 16px;
  border: 1px dashed var(--color-border);
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
}

.loader {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  display: flex;
  gap: 16px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px;
  background: var(--color-surface);
}

.result-card .cover {
  width: 96px;
  height: 128px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--color-accent);
}

.result-card .cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-card .content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-card header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-primary);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.dot {
  opacity: 0.6;
}

.desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-height: 4.5em;
  overflow: hidden;
}

.result-card footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.ghost-btn {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 8px 14px;
  background: transparent;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 13px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .result-card {
    flex-direction: column;
  }

  .result-card .cover {
    width: 100%;
    height: 200px;
  }

  .result-card footer {
    flex-direction: column;
    align-items: stretch;
  }

  .result-card footer .primary-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
