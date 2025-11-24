<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Book } from '../types'

const props = withDefaults(
  defineProps<{
    book: Book
    view?: 'grid' | 'list'
    highlight?: string
  }>(),
  {
    view: 'grid',
    highlight: ''
  }
)

const readingStatusMap: Record<Book['readingStatus'], string> = {
  unread: '未读',
  reading: '阅读中',
  finished: '已读完',
  dropped: '弃读',
  'to-read': '待读'
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return map[char]
  })
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text?: string): string {
  if (!text) return ''
  const safe = escapeHtml(text)
  const keyword = props.highlight.trim()
  if (!keyword) return safe
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
  return safe.replace(regex, '<mark>$1</mark>')
}

function formatWordCount(count?: number | null): string {
  if (!count) return '—'
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)} 万字`
  }
  return `${count.toLocaleString()} 字`
}

function coverFallback(title: string): string {
  return title.slice(0, 1).toUpperCase()
}
</script>

<template>
  <article class="book-card" :class="view">
    <div class="cover">
      <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" loading="lazy" />
      <span v-else>{{ coverFallback(book.title) }}</span>
    </div>

    <div class="info">
      <RouterLink class="title" :to="`/book/${book.id}`" v-html="highlightText(book.title)" />
      <p class="meta">
        <span v-html="highlightText(book.author || '未知作者')" />
        <span class="dot">•</span>
        <span>{{ book.platform || '未知平台' }}</span>
      </p>

      <p class="description" v-html="highlightText(book.description || '暂无简介')" />

      <div class="stats">
        <span>{{ formatWordCount(book.wordCountDisplay) }}</span>
        <span class="dot">•</span>
        <span>评分：{{ book.personalRating ?? '暂无' }}</span>
      </div>
    </div>

    <div class="status">
      <span class="badge">{{ readingStatusMap[book.readingStatus] }}</span>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 12px 30px var(--color-card-shadow);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.book-card.grid {
  flex-direction: column;
  height: 100%;
}

.book-card.list {
  align-items: center;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 45px var(--color-card-shadow);
}

.cover {
  flex-shrink: 0;
  width: 120px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--color-accent);
  text-transform: uppercase;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.meta {
  font-size: 14px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  opacity: 0.6;
}

.description {
  font-size: 14px;
  color: var(--color-text-secondary);
  max-height: 48px;
  overflow: hidden;
}

.stats {
  font-size: 13px;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status {
  align-self: flex-start;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 600;
}

mark {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  padding: 0 2px;
  border-radius: 4px;
}

@media (max-width: 640px) {
  .book-card {
    flex-direction: column;
  }

  .cover {
    width: 100%;
    height: 200px;
  }
}
</style>

