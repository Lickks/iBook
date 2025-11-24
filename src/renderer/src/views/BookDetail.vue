<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import type { Book, BookInput } from '../types'
import BookForm from '../components/BookForm.vue'
import { fetchYoushuDetail } from '../api/search'

const route = useRoute()
const router = useRouter()
const bookStore = useBookStore()

const isEditing = ref(false)
const confirmDelete = ref(false)
const updating = ref(false)
const deleting = ref(false)
const detailEnriched = ref(false)

const bookId = computed(() => Number(route.params.id))
const statusMap: Record<string, string> = {
  unread: '未读',
  reading: '阅读中',
  finished: '已读完',
  dropped: '弃读',
  'to-read': '待读'
}

function formatWordCount(count?: number | null): string {
  if (!count) return '未知'
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)} 万字`
  }
  return `${count.toLocaleString()} 字`
}

const book = computed(() =>
  bookStore.books.find((item) => item.id === bookId.value) || bookStore.currentBook
)

async function loadBook(): Promise<void> {
  if (!book.value) {
    await bookStore.fetchBookById(bookId.value)
  }
}

async function handleUpdate(payload: BookInput): Promise<void> {
  updating.value = true
  try {
    await bookStore.updateBook(bookId.value, payload)
    isEditing.value = false
  } catch (error) {
    console.error(error)
  } finally {
    updating.value = false
  }
}

async function handleDelete(): Promise<void> {
  deleting.value = true
  try {
    await bookStore.deleteBook(bookId.value)
    router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    deleting.value = false
    confirmDelete.value = false
  }
}

async function enrichBookFromSource(current?: Book | null): Promise<void> {
  if (!current || detailEnriched.value) {
    return
  }
  if (current.platform || !current.sourceUrl) {
    detailEnriched.value = true
    return
  }

  try {
    const detail = await fetchYoushuDetail(current.sourceUrl)
    const payload: Partial<BookInput> = {}
    if (detail.platform) {
      payload.platform = detail.platform
    }
    if (detail.category && !current.category) {
      payload.category = detail.category
    }
    if (Object.keys(payload).length > 0) {
      await bookStore.updateBook(current.id, payload)
    }
  } catch (error) {
    console.warn('自动补全平台信息失败', error)
  } finally {
    detailEnriched.value = true
  }
}

onMounted(() => {
  loadBook()
})

watch(
  () => book.value,
  (current) => {
    void enrichBookFromSource(current as Book | null)
  },
  { immediate: true }
)
</script>

<template>
  <section class="book-detail" v-if="book">
    <header class="detail-header">
      <div>
        <p class="eyebrow">书籍详情</p>
        <h2>{{ book.title }}</h2>
        <p class="subtitle">
          {{ book.author || '未知作者' }} · {{ book.platform || '未知平台' }}
        </p>
      </div>
      <div class="header-actions">
        <button class="ghost-btn" type="button" @click="isEditing = !isEditing">
          {{ isEditing ? '取消编辑' : '编辑' }}
        </button>
        <button class="danger-btn" type="button" @click="confirmDelete = true">删除</button>
      </div>
    </header>

    <div class="detail-content" v-if="!isEditing">
      <div class="cover" v-if="book.coverUrl">
        <img :src="book.coverUrl" :alt="book.title" />
      </div>
      <ul class="info-grid">
        <li><span>分类</span>{{ book.category || '未设置' }}</li>
        <li><span>字数</span>{{ formatWordCount(book.wordCountDisplay) }}</li>
        <li><span>阅读状态</span>{{ statusMap[book.readingStatus] || book.readingStatus }}</li>
        <li><span>评分</span>{{ book.personalRating ?? '暂无' }}</li>
        <li><span>创建时间</span>{{ book.createdAt }}</li>
        <li><span>更新时间</span>{{ book.updatedAt }}</li>
      </ul>

      <article class="description">
        <h3>简介</h3>
        <p>{{ book.description || '暂无简介' }}</p>
      </article>
    </div>

    <div v-else>
      <BookForm
        :initial-value="book"
        :submitting="updating"
        submit-label="保存修改"
        @submit="handleUpdate"
      />
    </div>

    <div v-if="confirmDelete" class="modal-backdrop">
      <div class="modal">
        <h3>删除书籍</h3>
        <p>确定删除该书籍？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="ghost-btn" type="button" @click="confirmDelete = false">取消</button>
          <button class="danger-btn" type="button" :disabled="deleting" @click="handleDelete">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </section>

  <div v-else class="state-card">
    正在加载书籍信息...
  </div>
</template>

<style scoped>
.book-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-header h2 {
  font-size: 28px;
  margin: 6px 0;
}

.subtitle {
  color: var(--color-text-secondary);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.ghost-btn,
.danger-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}

.ghost-btn {
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
}

.danger-btn {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--color-surface);
  border-radius: 18px;
  padding: 24px;
  border: 1px solid var(--color-border);
}

.cover img {
  width: 180px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 20px 40px var(--color-card-shadow);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-grid span {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-tertiary);
}

.description {
  background: var(--color-bg-soft);
  border-radius: 16px;
  padding: 20px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.modal {
  background: var(--color-surface);
  padding: 24px;
  border-radius: 16px;
  width: min(90%, 360px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.modal-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.state-card {
  padding: 32px;
  border-radius: 16px;
  border: 1px dashed var(--color-border);
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .detail-content {
    padding: 16px;
  }
}
</style>

