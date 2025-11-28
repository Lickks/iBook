<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { useTagStore } from '../stores/tag'
import type { Book, BookInput, Document } from '../types'
import BookForm from '../components/BookForm.vue'
import TagSelector from '../components/TagSelector.vue'
import { fetchYoushuDetail } from '../api/search'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as tagAPI from '../api/tag'

const route = useRoute()
const router = useRouter()
const bookStore = useBookStore()
const tagStore = useTagStore()

// 获取滚动容器并滚动到顶部
function scrollToTop(): void {
  // 使用 nextTick 确保 DOM 已完全渲染
  nextTick(() => {
    requestAnimationFrame(() => {
      const container = document.querySelector('.view-wrapper') as HTMLElement | null
      if (container) {
        container.scrollTop = 0
      }
    })
  })
}

const isEditing = ref(false)
const confirmDelete = ref(false)
const updating = ref(false)
const deleting = ref(false)
const detailEnriched = ref(false)

// 文档管理相关
const documents = ref<Document[]>([])
const loadingDocuments = ref(false)
const uploadingDocument = ref(false)
const countingWords = ref(false)
const showWordCountDialog = ref(false)
const selectedWordSource = ref<'document' | 'manual' | 'search'>('manual')
const isDraggingDocument = ref(false)
const dragDocumentCounter = ref(0)

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

// 加载文档列表
async function loadDocuments(): Promise<void> {
  if (!book.value) return
  loadingDocuments.value = true
  try {
    const result = await window.api.document.getByBookId(bookId.value)
    if (result.success) {
      documents.value = result.data || []
    }
  } catch (error) {
    console.error('加载文档列表失败:', error)
  } finally {
    loadingDocuments.value = false
  }
}

// 上传文档（通过文件路径）
async function uploadDocumentByPath(filePath: string): Promise<void> {
  uploadingDocument.value = true
  try {
    // 上传文件
    const uploadResult = await window.api.document.upload(filePath, bookId.value)
    if (uploadResult.success) {
      ElMessage.success('文档上传成功')
      await loadDocuments()

      // 自动更新文档统计字数到数据库
      const document = uploadResult.data
      if (document && document.wordCount > 0) {
        // 一本书只有一个文档，直接使用当前文档的字数
        const roundedWordCount = roundWordCount(document.wordCount)
        if (roundedWordCount) {
          // 自动更新 wordCountDocument 字段，不需要用户选择
          await bookStore.updateBook(bookId.value, {
            wordCountDocument: roundedWordCount
          })
          
          // 询问是否使用文档字数作为当前显示的字数
          await ElMessageBox.confirm(
            `检测到文档字数为 ${formatWordCount(roundedWordCount)}，是否使用此字数作为书籍字数？`,
            '提示',
            {
              confirmButtonText: '是',
              cancelButtonText: '否',
              type: 'info'
            }
          )
            .then(async () => {
              await handleSetWordCountSource('document', roundedWordCount)
            })
            .catch(() => {
              // 用户选择否，不做任何操作（但 wordCountDocument 已经更新了）
            })
        }
      }
    } else {
      ElMessage.error(uploadResult.error || '文档上传失败')
    }
  } catch (error: any) {
    console.error('上传文档失败:', error)
    ElMessage.error(error?.message || '上传文档失败')
  } finally {
    uploadingDocument.value = false
  }
}

// 上传文档（通过按钮点击）
async function handleUploadDocument(): Promise<void> {
  try {
    // 选择文件
    const fileResult = await window.api.document.selectFile()
    if (!fileResult.success || !fileResult.data) {
      return
    }

    const filePath = fileResult.data
    await uploadDocumentByPath(filePath)
  } catch (error: any) {
    console.error('上传文档失败:', error)
    ElMessage.error(error?.message || '上传文档失败')
  }
}

// 处理文档拖拽
function handleDocumentDragEnter(event: DragEvent): void {
  event.preventDefault()
  event.stopPropagation()
  dragDocumentCounter.value++
  if (event.dataTransfer?.items && event.dataTransfer.items.length > 0) {
    isDraggingDocument.value = true
  }
}

function handleDocumentDragLeave(event: DragEvent): void {
  event.preventDefault()
  event.stopPropagation()
  dragDocumentCounter.value--
  if (dragDocumentCounter.value === 0) {
    isDraggingDocument.value = false
  }
}

function handleDocumentDragOver(event: DragEvent): void {
  event.preventDefault()
  event.stopPropagation()
}

async function handleDocumentDrop(event: DragEvent): Promise<void> {
  event.preventDefault()
  event.stopPropagation()
  isDraggingDocument.value = false
  dragDocumentCounter.value = 0

  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  // 在 Electron 中，拖拽的文件可能包含 path 属性
  const file = files[0] as File & { path?: string }

  // 检查文件类型
  const allowedTypes = [
    'text/plain',
    'application/epub+zip',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
  const allowedExtensions = ['.txt', '.epub', '.pdf', '.docx', '.doc', '.mobi', '.azw', '.azw3']
  const fileName = file.name.toLowerCase()
  const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext))

  if (!hasValidExtension && !allowedTypes.includes(file.type)) {
    ElMessage.warning(
      '不支持的文件格式，请上传 TXT、EPUB、PDF、DOCX、DOC、MOBI、AZW、AZW3 格式的文件'
    )
    return
  }

  // 如果文件有 path 属性（Electron 拖拽文件），直接使用路径
  if (file.path) {
    await uploadDocumentByPath(file.path)
  } else {
    // 如果没有 path，提示用户使用文件选择对话框
    ElMessage.info('请使用文件选择按钮上传文档')
  }
}

// 删除文档
async function handleDeleteDocument(document: Document): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除文档 "${document.fileName}" 吗？此操作不可恢复。`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = await window.api.document.delete(document.id)
    if (result.success) {
      ElMessage.success('文档删除成功')
      await loadDocuments()
    } else {
      ElMessage.error(result.error || '文档删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除文档失败:', error)
      ElMessage.error(error?.message || '删除文档失败')
    }
  }
}

// 打开文档
async function handleOpenDocument(document: Document): Promise<void> {
  try {
    const result = await window.api.document.open(document.filePath)
    if (!result.success) {
      ElMessage.error(result.error || '打开文档失败')
    }
  } catch (error: any) {
    console.error('打开文档失败:', error)
    ElMessage.error(error?.message || '打开文档失败')
  }
}

// 重新统计文档字数
async function handleCountWords(document: Document): Promise<void> {
  countingWords.value = true
  try {
    const result = await window.api.document.countWords(document.filePath)
    if (result.success) {
      ElMessage.success(`字数统计完成：${formatWordCount(result.data)}`)
      await loadDocuments()
    } else {
      ElMessage.error(result.error || '字数统计失败')
    }
  } catch (error: any) {
    console.error('字数统计失败:', error)
    ElMessage.error(error?.message || '字数统计失败')
  } finally {
    countingWords.value = false
  }
}

// 设置字数来源
async function handleSetWordCountSource(
  source: 'document' | 'manual' | 'search',
  wordCount: number
): Promise<void> {
  if (!book.value) return

  try {
    // 根据来源更新对应的字段
    const updateData: Partial<BookInput> = {
      wordCountSource: source,
      wordCountDisplay: wordCount
    }

    // 如果是文档来源，更新 wordCountDocument
    // 只有当字数大于0时才更新，避免覆盖已保存的值
    if (source === 'document') {
      if (wordCount > 0) {
        updateData.wordCountDocument = wordCount
      } else {
        // 如果字数为0，使用数据库中保存的值（不更新）
        updateData.wordCountDisplay = book.value.wordCountDocument || 0
      }
    }
    // 如果是手动输入，更新 wordCountManual
    else if (source === 'manual') {
      updateData.wordCountManual = wordCount
    }
    // 如果是搜索来源，更新 wordCountSearch
    else if (source === 'search') {
      updateData.wordCountSearch = wordCount
    }

    await bookStore.updateBook(bookId.value, updateData)
    ElMessage.success('字数来源已更新')
    showWordCountDialog.value = false
  } catch (error) {
    console.error('更新字数来源失败:', error)
    ElMessage.error('更新字数来源失败')
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 计算字数信息
const wordCountInfo = computed(() => {
  if (!book.value) return null

  // 文档统计字数使用数据库中保存的值，而不是实时计算
  // 这样即使文档被删除，字数也会保留
  const docWordCount = book.value.wordCountDocument || 0
  const searchWordCount = book.value.wordCountSearch || 0
  const manualWordCount = book.value.wordCountManual || 0
  const currentSource = book.value.wordCountSource || 'manual'

  return {
    document: docWordCount,
    search: searchWordCount,
    manual: manualWordCount,
    current: book.value.wordCountDisplay || 0,
    source: currentSource
  }
})

// 标签管理
const selectedTagIds = ref<number[]>([])
const isTagInitialized = ref(false)
const isUpdatingTags = ref(false)

// 同步标签到本地状态
watch(
  () => book.value?.tags,
  (tags) => {
    // 如果正在更新标签，跳过同步（避免循环更新）
    if (isUpdatingTags.value) {
      return
    }
    if (tags) {
      const tagIds = tags.map((tag) => tag.id)
      selectedTagIds.value = tagIds
      isTagInitialized.value = true
    } else {
      selectedTagIds.value = []
      isTagInitialized.value = false
    }
  },
  { immediate: true }
)

// 监听标签变化并更新到服务器
watch(
  selectedTagIds,
  async (newTagIds, oldTagIds) => {
    // 如果还未初始化完成，不执行更新
    if (!isTagInitialized.value || !book.value) {
      return
    }

    // 如果 oldTagIds 是 undefined，说明是第一次触发，跳过
    if (oldTagIds === undefined) {
      return
    }

    const currentTagIds = book.value.tags?.map((tag) => tag.id) || []
    const toAdd = newTagIds.filter((id) => !currentTagIds.includes(id))
    const toRemove = currentTagIds.filter((id) => !newTagIds.includes(id))

    if (toAdd.length === 0 && toRemove.length === 0) {
      // 没有变化，不需要更新
      return
    }

    isUpdatingTags.value = true
    try {
      // 添加新标签
      for (const tagId of toAdd) {
        await tagAPI.addTagToBook(bookId.value, tagId)
      }
      // 移除标签
      for (const tagId of toRemove) {
        await tagAPI.removeTagFromBook(bookId.value, tagId)
      }
      // 刷新书籍信息
      await bookStore.fetchBookById(bookId.value)
      // 手动同步标签（因为 isUpdatingTags 标志会阻止自动同步）
      // 从 currentBook 获取最新标签，因为 fetchBookById 会更新 currentBook
      const updatedBook = bookStore.currentBook
      if (updatedBook?.tags) {
        selectedTagIds.value = updatedBook.tags.map((tag) => tag.id)
      }
      ElMessage.success('标签更新成功')
    } catch (error: any) {
      ElMessage.error(error.message || '更新标签失败')
      // 更新失败时恢复旧值
      selectedTagIds.value = oldTagIds || []
    } finally {
      isUpdatingTags.value = false
    }
  },
  { deep: true }
)

onMounted(async () => {
  // 进入详情页时滚动到顶部
  scrollToTop()
  
  loadBook()
  loadDocuments()
  if (tagStore.tags.length === 0) {
    await tagStore.fetchTags()
  }
})

watch(
  () => book.value,
  (current) => {
    void enrichBookFromSource(current as Book | null)
  },
  { immediate: true }
)

watch(
  () => bookId.value,
  () => {
    // 书籍 ID 变化时，滚动到顶部
    scrollToTop()
    loadBook()
    loadDocuments()
  }
)
</script>

<template>
  <section class="page-container book-detail" v-if="book">
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" type="button" @click="router.push('/')" title="返回">
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <div>
          <p class="eyebrow">书籍详情</p>
          <h1>{{ book.title }}</h1>
          <p class="subtitle">
            {{ book.author || '未知作者' }} · {{ book.platform || '未知平台' }}
          </p>
        </div>
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

      <!-- 标签区域 -->
      <div class="tag-section">
        <TagSelector v-model="selectedTagIds" />
      </div>

      <article class="description">
        <h3>简介</h3>
        <p>{{ book.description || '暂无简介' }}</p>
      </article>

      <!-- 文档管理区域 -->
      <section
        class="document-section"
        :class="{ 'is-dragging': isDraggingDocument }"
        @dragenter="handleDocumentDragEnter"
        @dragleave="handleDocumentDragLeave"
        @dragover="handleDocumentDragOver"
        @drop="handleDocumentDrop"
      >
        <div class="section-header">
          <h3>文档管理</h3>
          <button
            class="primary-btn"
            type="button"
            :disabled="uploadingDocument"
            @click="handleUploadDocument"
          >
            {{ uploadingDocument ? '上传中...' : '上传文档' }}
          </button>
        </div>

        <div v-if="loadingDocuments" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="documents.length === 0" class="empty-state">
          <p>{{ isDraggingDocument ? '松开鼠标上传文档' : '点击上方按钮或拖拽文件上传' }}</p>
          <p class="hint">支持 TXT、EPUB、PDF、DOCX、DOC、MOBI、AZW、AZW3 格式</p>
        </div>

        <div v-else class="documents-list">
          <div v-for="doc in documents" :key="doc.id" class="document-item">
            <div class="doc-icon">
              <span>{{ doc.fileType.toUpperCase() }}</span>
            </div>
            <div class="doc-info">
              <p class="doc-name">{{ doc.fileName }}</p>
              <p class="doc-meta">
                {{ formatFileSize(doc.fileSize) }} · {{ formatWordCount(doc.wordCount) }} ·
                {{ doc.uploadedAt }}
              </p>
            </div>
            <div class="doc-actions">
              <button class="action-btn" type="button" @click="handleOpenDocument(doc)">
                打开
              </button>
              <button
                class="action-btn"
                type="button"
                :disabled="countingWords"
                @click="handleCountWords(doc)"
              >
                统计字数
              </button>
              <button class="action-btn danger" type="button" @click="handleDeleteDocument(doc)">
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 字数来源选择 -->
        <div v-if="wordCountInfo" class="word-count-selector">
          <h4>字数来源选择</h4>
          <div class="word-sources">
            <div
              class="source-item"
              :class="{ active: wordCountInfo.source === 'manual' }"
              @click="handleSetWordCountSource('manual', wordCountInfo.manual)"
            >
              <span class="source-label">手动输入</span>
              <span class="source-value">{{ formatWordCount(wordCountInfo.manual) }}</span>
            </div>
            <div
              class="source-item"
              :class="{ active: wordCountInfo.source === 'search' }"
              @click="handleSetWordCountSource('search', wordCountInfo.search)"
            >
              <span class="source-label">网络检索</span>
              <span class="source-value">{{ formatWordCount(wordCountInfo.search) }}</span>
            </div>
            <div
              class="source-item"
              :class="{ active: wordCountInfo.source === 'document' }"
              @click="handleSetWordCountSource('document', documents.length > 0 ? (documents[0].wordCount || 0) : wordCountInfo.document)"
            >
              <span class="source-label">文档统计</span>
              <span class="source-value">{{ formatWordCount(wordCountInfo.document) }}</span>
            </div>
          </div>
          <p class="word-count-hint">
            当前使用:
            {{
              wordCountInfo.source === 'manual'
                ? '手动输入'
                : wordCountInfo.source === 'search'
                  ? '网络检索'
                  : '文档统计'
            }}
            ({{ formatWordCount(wordCountInfo.current) }})
          </p>
        </div>
      </section>
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--color-bg-soft);
  color: var(--color-text-primary);
  transform: translateX(-2px);
}

.back-btn .el-icon {
  font-size: 18px;
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

/* 文档管理样式 */
.document-section {
  margin-top: 24px;
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 4px;
}

.document-section.is-dragging {
  background: var(--color-accent-soft);
  border: 2px dashed var(--color-accent);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--color-bg-soft);
  border-radius: 12px;
  color: var(--color-text-secondary);
}

.empty-state .hint {
  font-size: 12px;
  margin-top: 8px;
  color: var(--color-text-tertiary);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin: 0;
  font-size: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
}

.primary-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #5a67d8));
  color: white;
  border: 1px solid;
  padding: 10px 20px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 0 0 1px;
}

/* 亮色模式下的按钮样式 */
.light .primary-btn {
  color: var(--color-text-primary);
  border-color: #000000;
  box-shadow: 0 0 0 1px #000000;
}

/* 暗色模式下的按钮样式 */
.dark .primary-btn {
  border-color: #ffffff;
  box-shadow: 0 0 0 1px #ffffff;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), 0 0 0 1px;
}

/* 亮色模式下的悬停状态 */
.light .primary-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), 0 0 0 1px #000000;
  border-color: #000000;
}

/* 暗色模式下的悬停状态 */
.dark .primary-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), 0 0 0 1px #ffffff;
  border-color: #ffffff;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.documents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-bg-soft);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
}

.document-item:hover {
  background: var(--color-bg-muted);
}

.doc-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #5a67d8));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 亮色模式下的文档图标 */
.light .doc-icon {
  background: var(--color-bg-muted);
}

/* 暗色模式下的文档图标 */
.dark .doc-icon {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
}

.doc-icon span {
  color: white;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* 亮色模式下的文档类型文字 */
.light .doc-icon span {
  color: var(--color-text-primary);
}

/* 暗色模式下的文档类型文字 */
.dark .doc-icon span {
  color: white;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-weight: 600;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}

.doc-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-bg-muted);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.danger:hover:not(:disabled) {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

/* 字数来源选择器 */
.word-count-selector {
  margin-top: 24px;
  padding: 20px;
  background: var(--color-bg-soft);
  border-radius: 12px;
}

.word-count-selector h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.word-sources {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.source-item {
  padding: 16px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.source-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.source-item.active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(90, 103, 216, 0.1));
}

.source-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.source-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.word-count-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}

/* 标签区域样式 */
.tag-section {
  margin-top: 0;
}

@media (max-width: 640px) {
  .detail-content {
    padding: 16px;
  }

  .document-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .doc-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .word-sources {
    grid-template-columns: 1fr;
  }
}
</style>

