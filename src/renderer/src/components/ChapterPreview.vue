<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElCheckbox,
  ElInputNumber
} from 'element-plus'
import { useTxtToEpubStore } from '../stores/txtToEpub'
import type { Chapter } from '../types/txtToEpub'

const store = useTxtToEpubStore()

const expandedRows = ref<number[]>([])
const selectedChapters = ref<number[]>([])
const editingTitleIndex = ref<number | null>(null)
const editingTitle = ref('')

// 拆分章节相关
const showSplitDialog = ref(false)
const splitChapterIndex = ref<number | null>(null)
const splitPosition = ref(0)
const splitNewTitle = ref('')

// 计算属性
const chapters = computed(() => store.chapters)
const stats = computed(() => ({
  total: store.totalChapters,
  totalWords: store.totalWordCount,
  average: store.averageWordCount,
  max: store.maxWordCount,
  min: store.minWordCount
}))

// 切换展开/折叠
function toggleExpand(index: number) {
  const idx = expandedRows.value.indexOf(index)
  if (idx > -1) {
    expandedRows.value.splice(idx, 1)
  } else {
    expandedRows.value.push(index)
  }
}

// 选择章节
function toggleSelect(index: number) {
  const idx = selectedChapters.value.indexOf(index)
  if (idx > -1) {
    selectedChapters.value.splice(idx, 1)
  } else {
    selectedChapters.value.push(index)
  }
}

// 开始编辑标题
function startEditTitle(chapter: Chapter) {
  editingTitleIndex.value = chapter.index - 1
  editingTitle.value = chapter.title
}

// 保存标题
function saveTitle() {
  if (editingTitleIndex.value !== null && editingTitle.value.trim()) {
    store.updateChapterTitle(editingTitleIndex.value, editingTitle.value.trim())
    editingTitleIndex.value = null
    editingTitle.value = ''
  }
}

// 取消编辑
function cancelEdit() {
  editingTitleIndex.value = null
  editingTitle.value = ''
}

// 合并章节
function handleMerge() {
  if (selectedChapters.value.length < 2) {
    ElMessage.warning('请至少选择两个章节进行合并')
    return
  }

  ElMessageBox.confirm('确定要合并选中的章节吗？', '确认合并', {
    type: 'warning'
  })
    .then(() => {
      store.mergeChapters(selectedChapters.value)
      selectedChapters.value = []
    })
    .catch(() => {
      // 用户取消
    })
}

// 删除章节
function handleDelete(index: number) {
  ElMessageBox.confirm('确定要删除这个章节吗？', '确认删除', {
    type: 'warning'
  })
    .then(() => {
      store.deleteChapter(index)
    })
    .catch(() => {
      // 用户取消
    })
}

// 上移章节
function handleMoveUp(index: number) {
  store.moveChapterUp(index)
}

// 下移章节
function handleMoveDown(index: number) {
  store.moveChapterDown(index)
}

// 打开拆分对话框
function openSplitDialog(chapter: Chapter) {
  splitChapterIndex.value = chapter.index - 1
  splitPosition.value = Math.floor(chapter.content.split(/\r?\n/).length / 2)
  splitNewTitle.value = `第 ${chapter.index + 1} 章`
  showSplitDialog.value = true
}

// 确认拆分
function confirmSplit() {
  if (splitChapterIndex.value === null) {
    return
  }

  const lines = chapters.value[splitChapterIndex.value].content.split(/\r?\n/)
  if (splitPosition.value < 1 || splitPosition.value >= lines.length) {
    ElMessage.error('分割位置无效')
    return
  }

  store.splitChapter(splitChapterIndex.value, splitPosition.value, splitNewTitle.value)
  showSplitDialog.value = false
  splitChapterIndex.value = null
  splitPosition.value = 0
  splitNewTitle.value = ''
}

// 格式化字数
function formatWordCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  return count.toString()
}

// 预览内容（前100字）
function getPreview(content: string): string {
  const text = content.replace(/\s/g, '')
  if (text.length <= 100) {
    return text
  }
  return text.substring(0, 100) + '...'
}
</script>

<template>
  <div class="chapter-preview">
    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总章节数：</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">总字数：</span>
        <span class="stat-value">{{ formatWordCount(stats.totalWords) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">平均字数：</span>
        <span class="stat-value">{{ formatWordCount(stats.average) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">最大/最小：</span>
        <span class="stat-value">{{ formatWordCount(stats.max) }} / {{ formatWordCount(stats.min) }}</span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button
        type="primary"
        :disabled="selectedChapters.length < 2"
        @click="handleMerge"
      >
        合并选中章节 ({{ selectedChapters.length }})
      </el-button>
    </div>

    <!-- 章节列表 -->
    <div class="chapter-list">
      <div
        v-for="(chapter, index) in chapters"
        :key="chapter.index"
        class="chapter-item"
        :class="{ expanded: expandedRows.includes(index) }"
      >
        <div class="chapter-header">
          <el-checkbox
            :model-value="selectedChapters.includes(index)"
            @change="toggleSelect(index)"
          />
          <span class="chapter-index">[{{ chapter.index }}]</span>
          <div class="chapter-title">
            <span v-if="editingTitleIndex !== index" @dblclick="startEditTitle(chapter)">
              {{ chapter.title }}
            </span>
            <el-input
              v-else
              v-model="editingTitle"
              size="small"
              @blur="saveTitle"
              @keyup.enter="saveTitle"
              @keyup.esc="cancelEdit"
            />
          </div>
          <div class="chapter-meta">
            <span class="word-count">{{ formatWordCount(chapter.wordCount) }} 字</span>
            <span class="line-range">行 {{ chapter.lineStart }}-{{ chapter.lineEnd }}</span>
          </div>
          <div class="chapter-actions">
            <el-button size="small" @click="toggleExpand(index)">
              {{ expandedRows.includes(index) ? '收起' : '展开' }}
            </el-button>
            <el-button size="small" @click="openSplitDialog(chapter)">拆分</el-button>
            <el-button size="small" :disabled="index === 0" @click="handleMoveUp(index)">
              上移
            </el-button>
            <el-button
              size="small"
              :disabled="index === chapters.length - 1"
              @click="handleMoveDown(index)"
            >
              下移
            </el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="chapters.length <= 1"
              @click="handleDelete(index)"
            >
              删除
            </el-button>
          </div>
        </div>
        <div v-if="expandedRows.includes(index)" class="chapter-content">
          <div class="content-preview">{{ getPreview(chapter.content) }}</div>
        </div>
      </div>
    </div>

    <!-- 拆分对话框 -->
    <el-dialog v-model="showSplitDialog" title="拆分章节" width="500px">
      <div class="split-dialog">
        <div class="form-item">
          <label>新章节标题：</label>
          <el-input v-model="splitNewTitle" placeholder="请输入新章节标题" />
        </div>
        <div class="form-item">
          <label>分割位置（行号）：</label>
          <el-input-number
            v-model="splitPosition"
            :min="1"
            :max="splitChapterIndex !== null ? chapters[splitChapterIndex]?.content.split(/\r?\n/).length - 1 : 1"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showSplitDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmSplit">确认拆分</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.chapter-preview {
  padding: 20px;
  background: var(--color-bg);
  border-radius: 8px;
}

.stats-bar {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: var(--color-bg-soft);
  border-radius: 4px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  color: var(--color-text-secondary);
  margin-right: 4px;
}

.stat-value {
  font-weight: 600;
  color: var(--color-accent);
}

.action-bar {
  margin-bottom: 16px;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-item {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  transition: all 0.2s ease;
}

.chapter-item:hover {
  border-color: var(--color-accent);
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.chapter-index {
  font-weight: 600;
  color: var(--color-accent);
  min-width: 50px;
}

.chapter-title {
  flex: 1;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
}

.chapter-title:hover {
  color: var(--color-accent);
}

.chapter-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.chapter-actions {
  display: flex;
  gap: 8px;
}

.chapter-content {
  padding: 12px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-soft);
}

.content-preview {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}

.split-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-weight: 500;
  color: var(--color-text-primary);
}
</style>

