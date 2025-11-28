<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, ArrowDown } from '@element-plus/icons-vue'
import { useBookStore } from '../stores/book'
import { useDisplayModeStore } from '../stores/displayMode'
import { READING_STATUS_LABEL } from '../constants'
import type { Book } from '../types'

const imageError = ref(false)

const props = withDefaults(
  defineProps<{
    book: Book
    view?: 'grid' | 'list'
    highlight?: string
    selectable?: boolean
    selected?: boolean
  }>(),
  {
    view: 'grid',
    highlight: '',
    selectable: false,
    selected: false
  }
)

const displayModeStore = useDisplayModeStore()

const emit = defineEmits<{
  (e: 'toggle-select', id: number): void
}>()

const bookStore = useBookStore()
const router = useRouter()
const showStatusDropdown = ref(false)

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

// 处理卡片点击
function handleCardClick(event: MouseEvent): void {
  if (props.selectable) {
    // 选择模式下：选择/取消选择书籍
    event.preventDefault()
    event.stopPropagation()
    emit('toggle-select', props.book.id)
  } else {
    // 非选择模式下：进入详情页
    router.push(`/book/${props.book.id}`)
  }
}

async function updateReadingStatus(status: string): Promise<void> {
  try {
    await bookStore.updateBook(props.book.id, { readingStatus: status })
    ElMessage.success(`状态已更新为：${READING_STATUS_LABEL[status as keyof typeof READING_STATUS_LABEL]}`)
    showStatusDropdown.value = false
  } catch (error: any) {
    ElMessage.error('更新状态失败')
    console.error('更新阅读状态失败:', error)
  }
}

function handleStatusClick(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  showStatusDropdown.value = !showStatusDropdown.value
}

function handleStatusSelect(status: string, event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  if (status !== props.book.readingStatus) {
    updateReadingStatus(status)
  } else {
    showStatusDropdown.value = false
  }
}

// 处理选择指示器点击，阻止卡片点击事件
function handleSelectIndicatorClick(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  emit('toggle-select', props.book.id)
}

// 获取状态颜色
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    unread: '#909399',
    reading: '#409EFF',
    finished: '#67C23A',
    dropped: '#F56C6C',
    'to-read': '#E6A23C'
  }
  return colorMap[status] || '#909399'
}

// 处理点击外部关闭下拉菜单
function handleClickOutside(event: MouseEvent): void {
  const target = event.target as Element
  if (!target.closest('.status-wrapper')) {
    showStatusDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <article
    class="book-card"
    :class="[view, { selectable: selectable, selected, 'status-dropdown-open': showStatusDropdown }]"
    @click="handleCardClick"
  >
    <button
      v-if="selectable"
      class="select-indicator"
      type="button"
      :class="{ active: selected }"
      @click="handleSelectIndicatorClick"
    >
      <el-icon v-if="selected"><Check /></el-icon>
    </button>

    <!-- 左上角阅读状态标签 -->
    <div class="status">
      <div class="status-wrapper">
        <span
          class="badge clickable"
          :style="{ backgroundColor: getStatusColor(book.readingStatus) }"
          @click="handleStatusClick"
        >
          {{ readingStatusMap[book.readingStatus] }}
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </span>

        <div v-if="showStatusDropdown" class="status-dropdown">
          <div
            v-for="(label, key) in READING_STATUS_LABEL"
            :key="key"
            class="status-option"
            :class="{ active: key === book.readingStatus }"
            :style="{ borderLeftColor: getStatusColor(key) }"
            @click="handleStatusSelect(key, $event)"
          >
            <span class="status-indicator" :style="{ backgroundColor: getStatusColor(key) }"></span>
            {{ label }}
            <el-icon v-if="key === book.readingStatus" class="check"><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <div class="cover">
      <img
        v-if="book.coverUrl && !imageError"
        :src="book.coverUrl"
        :alt="book.title"
        loading="lazy"
        @error="imageError = true"
      />
      <span v-if="!book.coverUrl || imageError">{{ coverFallback(book.title) }}</span>
    </div>

    <div class="info">
      <span class="title" v-html="highlightText(book.title)" />

      <!-- 简约模式：只显示作者 -->
      <p v-if="displayModeStore.isSimpleMode" class="meta">
        <span v-html="highlightText(book.author || '未知作者')" />
      </p>

      <!-- 经典模式：显示作者 • 类型 • 平台 -->
      <p v-else class="meta">
        <span v-html="highlightText(book.author || '未知作者')" />
        <span class="dot">•</span>
        <span>{{ book.category || '未知类型' }}</span>
        <span class="dot">•</span>
        <span>{{ book.platform || '未知平台' }}</span>
      </p>

      <!-- 经典模式：显示简介 -->
      <p v-if="displayModeStore.isClassicMode" class="description" v-html="highlightText(book.description || '暂无简介')" />

      <div class="stats">
        <span>{{ formatWordCount(book.wordCountDisplay) }}</span>
      </div>
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
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  /* 强制 GPU 加速，优化动画性能 */
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
}

/* 网格模式下的卡片样式优化 */
.book-card.grid {
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px var(--color-card-shadow);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.book-card.grid {
  flex-direction: column;
  height: 100%;
  padding: 16px 12px;
  gap: 12px;
  /* 移除固定高度限制，让内容自然流动 */
  min-height: auto;
  max-height: none;
}

.book-card.list {
  align-items: center;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 45px var(--color-card-shadow);
}

/* 网格模式下的悬停效果 */
.book-card.grid:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px var(--color-card-shadow);
  border-color: var(--color-border-strong);
}

.book-card:not(.selectable) {
  cursor: pointer;
}

.book-card.selectable {
  cursor: pointer;
}

.book-card.selectable:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px var(--color-card-shadow);
}

.book-card.selectable.selected {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-soft), 0 12px 30px var(--color-card-shadow);
}

.select-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.dark .select-indicator {
  background: rgba(15, 23, 42, 0.9);
}

.select-indicator.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* 网格视图下的封面样式优化 */
.book-card.grid .cover {
  margin: 0 auto;
  width: 75%; /* 缩小封面尺寸 */
  max-width: 160px; /* 限制最大宽度 */
  aspect-ratio: 5 / 7; /* 保持书籍封面的标准宽高比 */
  height: auto;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  border-radius: 14px;
  margin-top: 32px; /* 减少留白，给状态标签留出适当空间 */
}

/* 兼容不支持 aspect-ratio 的浏览器 */
@supports not (aspect-ratio: 5 / 7) {
  .book-card.grid .cover {
    height: 0;
    padding-bottom: 140%; /* 约等于 5:7 的宽高比 */
  }
  
  .book-card.grid .cover img,
  .book-card.grid .cover span {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.book-card.grid:hover .cover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
  gap: 8px;
  min-width: 0;
  /* 确保内容不会溢出 */
  overflow: hidden;
}

/* 网格视图下的信息区域优化 */
.book-card.grid .info {
  text-align: center;
  align-items: center;
  gap: 8px;
  padding-top: 0;
}

.book-card.grid .meta {
  justify-content: center;
  flex-wrap: wrap;
}

.book-card.grid .stats {
  justify-content: center;
  margin-top: auto;
  padding-top: 4px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: inherit;
  text-decoration: none;
  width: 100%;
}

/* 列表模式下标题单行显示 */
.book-card.list .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 网格模式下标题优化 */
.book-card.grid .title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 0;
  min-height: 42px; /* 确保两行标题的高度一致 */
  text-align: center;
}

.meta {
  font-size: 14px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 网格模式下的元信息优化 */
.book-card.grid .meta {
  font-size: 12px;
  line-height: 1.4;
  min-height: 18px;
}

.dot {
  opacity: 0.6;
}

.description {
  font-size: 13px;
  color: var(--color-text-secondary);
  overflow: hidden;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 网格模式下的描述优化 */
.book-card.grid .description {
  font-size: 11px;
  line-height: 1.4;
  color: var(--color-text-tertiary);
  margin-top: 0;
  min-height: 32px; /* 确保两行描述的高度一致 */
  text-align: center;
}

.stats {
  font-size: 13px;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 网格模式下的统计信息优化 */
.book-card.grid .stats {
  font-size: 11px;
  color: var(--color-text-tertiary);
  padding-top: 4px;
  border-top: 1px solid var(--color-border);
  width: 100%;
  margin-top: auto;
  display: flex;
  justify-content: center;
}

.status {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 5;
}

/* 网格模式下状态标签保持在左上角，但不遮挡封面 */
.book-card.grid .status {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  /* 状态标签在卡片左上角，位置更紧凑 */
}

/* 调整状态标签样式，避免遮挡封面 */
.badge {
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--color-accent-soft);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
}

/* 网格模式下状态标签稍微缩小 */
.book-card.grid .badge {
  padding: 3px 7px;
  font-size: 10px;
  border-radius: 5px;
}

.status-wrapper {
  position: relative;
}

.badge.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  padding-right: 20px;
}

/* 网格模式下可点击标签的右侧内边距调整 */
.book-card.grid .badge.clickable {
  padding-right: 18px;
}

.badge.clickable:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.arrow {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 9px;
  opacity: 0.8;
  display: flex;
  align-items: center;
}

/* 网格模式下箭头图标稍微缩小 */
.book-card.grid .arrow {
  font-size: 8px;
  right: 5px;
}

.status-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 140px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
}

/* 确保book-card创建新的层叠上下文 */
.book-card {
  position: relative;
  z-index: 1;
}

.book-card:hover {
  z-index: 10;
}

/* 当下拉菜单显示时，提升z-index */
.book-card.status-dropdown-open {
  z-index: 100;
}

.dark .status-dropdown {
  background: var(--color-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-left: 3px solid transparent;
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 13px;
  position: relative;
}

.status-option:hover {
  background: var(--color-bg-soft);
}

.status-option.active {
  background: var(--color-accent-soft);
  font-weight: 600;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.check {
  margin-left: auto;
  color: var(--color-accent);
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.select-indicator .el-icon {
  font-size: 14px;
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

