<template>
  <div class="chapter-editor">
    <!-- 当前正则表达式 -->
    <div class="regex-display">
      <label>当前正则表达式:</label>
      <el-input v-model="currentRegex" readonly class="regex-input" />
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-checkbox v-model="markShortEnabled" @change="handleMarkShortChange">
          标记不超过
        </el-checkbox>
        <el-input-number
          v-model="shortChapterMaxLines"
          :min="1"
          :max="100"
          :step="1"
          :precision="0"
          :controls="true"
          :disabled="!markShortEnabled"
          size="small"
          class="lines-input"
        />
        <span>行的章节</span>
        <el-button type="danger" size="small" @click="handleDeleteSelected">
          点击删除
        </el-button>
      </div>
      <div class="toolbar-right">
        <span>新章节,行号:</span>
        <el-input-number
          v-model="newChapterLineNumber"
          :min="1"
          :step="1"
          :precision="0"
          :controls="true"
          size="small"
          class="line-input"
        />
        <el-button type="primary" size="small" @click="handleAddChapter">
          点击添加
        </el-button>
      </div>
    </div>

    <!-- 操作说明 -->
    <div class="instructions">
      <span>Tab/Shift+Tab 调整层级;</span>
      <span>Enter/Delete:删除/恢复选中目录;</span>
    </div>

    <!-- 章节列表表格 -->
    <div class="table-container">
      <el-table
        :data="displayChapters"
        highlight-current-row
        @current-change="handleCurrentChange"
        @row-dblclick="handleRowDoubleClick"
        :row-class-name="getRowClassName"
        height="400"
      >
        <el-table-column prop="index" label="序号" width="80" align="center" />
        <el-table-column prop="title" label="章节名称 (双击编辑)" min-width="300">
          <template #default="{ row, $index }">
            <div v-if="editingIndex !== $index" :style="getTitleStyle(row)" :class="getTitleClass(row)">
              {{ row.title }}
            </div>
            <el-input
              v-else
              v-model="editingTitle"
              @blur="handleChapterTitleBlur($index)"
              @keyup.enter="handleChapterTitleBlur($index)"
              @keyup.esc="handleTitleCancel"
              ref="titleInputRef"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lineStart" label="行号" width="100" align="center" />
      </el-table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElInput,
  ElInputNumber,
  ElCheckbox,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import { useTxtToEpubStore } from '../stores/txtToEpub'
import type { Chapter } from '../types/txtToEpub'

const store = useTxtToEpubStore()

// 当前正则表达式显示
const currentRegex = ref('')

// 工具栏状态
const markShortEnabled = ref(false)
const shortChapterMaxLines = ref(5)
const newChapterLineNumber = ref(1)

// 表格状态
const currentRow = ref<Chapter | null>(null)
const editingIndex = ref<number | null>(null)
const editingTitle = ref('')
const titleInputRef = ref()

// 计算属性：显示所有章节（包括已删除的，用于显示）
const displayChapters = computed(() => {
  return store.chapters
})

// 监听章节规则变化，更新正则表达式显示
watch(
  () => store.chapterRule,
  (rule) => {
    if (rule.mode === 'regex' && rule.regex) {
      currentRegex.value = rule.regex
    } else if (rule.mode === 'simple') {
      // 构建简易规则的正则表达式（包含附加规则）
      let pattern = rule.allowLeadingSpaces ? '^\\s*' : '^'
      if (rule.ordinalPrefix && rule.ordinalPrefix !== '无' && rule.ordinalPrefix !== '') {
        pattern += rule.ordinalPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      }
      if (rule.numberType === 'arabic') {
        pattern += '\\d+'
      } else if (rule.numberType === 'chinese') {
        pattern += '[一二三四五六七八九十百千万]+'
      } else if (rule.numberType === 'mixed') {
        pattern += '[\\d一二三四五六七八九十百千万]+'
      }
      if (rule.chapterMarker && rule.chapterMarker !== '无' && rule.chapterMarker !== '') {
        // 特殊处理"章回卷节集部"
        if (rule.chapterMarker === '章回卷节集部') {
          pattern += '[章回卷节集部]'
        } else {
          pattern += rule.chapterMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
      }
      
      // 添加附加规则
      if (rule.additionalRules && rule.additionalRules.trim()) {
        const additionalPatterns = rule.additionalRules
          .split('|')
          .map((r) => r.trim())
          .filter((r) => r.length > 0)
          .map((r) => {
            // 如果附加规则不包含行首匹配，添加行首匹配
            if (!r.startsWith('^')) {
              return (rule.allowLeadingSpaces ? '^\\s*' : '^') + r
            }
            return r
          })
        
        if (additionalPatterns.length > 0) {
          pattern = `(?:${pattern}|${additionalPatterns.join('|')})`
        }
      }
      
      currentRegex.value = pattern
    }
  },
  { immediate: true }
)

// 处理当前行变化
function handleCurrentChange(row: Chapter | null) {
  currentRow.value = row
}

// 处理行双击（编辑标题）
function handleRowDoubleClick(row: Chapter, column: any, event: MouseEvent) {
  if (column.property === 'title') {
    const index = displayChapters.value.findIndex((ch) => ch.index === row.index)
    if (index >= 0) {
      editingIndex.value = index
      editingTitle.value = row.title
      nextTick(() => {
        titleInputRef.value?.focus()
      })
    }
  }
}

// 处理章节标题编辑完成
async function handleChapterTitleBlur(index: number) {
  if (editingIndex.value === null) return

  const chapter = displayChapters.value[index]
  if (editingTitle.value.trim() && editingTitle.value !== chapter.title) {
    try {
      await store.updateChapterTitleApi(chapter, editingTitle.value.trim())
    } catch (error) {
      // 错误已在 store 中处理
    }
  }

  editingIndex.value = null
  editingTitle.value = ''
}

// 处理标题编辑取消
function handleTitleCancel() {
  editingIndex.value = null
  editingTitle.value = ''
}

// 获取标题样式
function getTitleStyle(chapter: Chapter) {
  const styles: Record<string, any> = {}
  const level = chapter.level || 0
  // 根据层级设置左边距（缩进）
  styles.paddingLeft = `${level * 24}px`
  styles.display = 'block'
  styles.width = '100%'
  
  if (chapter.deleted) {
    styles.textDecoration = 'line-through'
    styles.color = '#999'
  }
  if (chapter.isShortChapter) {
    styles.backgroundColor = '#fff3cd'
  }
  return styles
}

// 获取标题类名
function getTitleClass(chapter: Chapter) {
  return {
    'chapter-title': true,
    [`level-${chapter.level || 0}`]: true
  }
}

// 获取行类名
function getRowClassName({ row }: { row: Chapter }) {
  if (row.deleted) {
    return 'deleted-row'
  }
  if (row.isShortChapter) {
    return 'short-chapter-row'
  }
  return ''
}

// 处理短章节标记
async function handleMarkShortChange() {
  if (markShortEnabled.value) {
    try {
      await store.markShortChaptersApi(shortChapterMaxLines.value)
    } catch (error) {
      // 错误已在 store 中处理
    }
  }
}

// 处理删除选中章节（逻辑删除，只画横线）
async function handleDeleteSelected() {
  if (!currentRow.value) {
    ElMessage.warning('请先选择要删除的章节')
    return
  }

  try {
    await store.toggleChapterDeletedApi(currentRow.value)
    if (currentRow.value.deleted) {
      ElMessage.success('章节已标记为删除')
    } else {
      ElMessage.success('章节已恢复')
    }
  } catch (error) {
    // 错误已在 store 中处理
  }
}

// 处理添加章节
async function handleAddChapter() {
  if (newChapterLineNumber.value < 1) {
    ElMessage.warning('行号必须大于 0')
    return
  }

  try {
    await store.addChapterApi(newChapterLineNumber.value)
    ElMessage.success('章节添加成功')
  } catch (error) {
    // 错误已在 store 中处理
  }
}


// 键盘快捷键处理
function handleKeyDown(event: KeyboardEvent) {
  if (!currentRow.value) return

  const chapter = currentRow.value

  // Tab/Shift+Tab: 调整层级
  if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault()
    const newLevel = (chapter.level || 0) + 1
    store.adjustChapterLevelApi(chapter, newLevel)
  } else if (event.key === 'Tab' && event.shiftKey) {
    event.preventDefault()
    const newLevel = Math.max(0, (chapter.level || 0) - 1)
    store.adjustChapterLevelApi(chapter, newLevel)
  }

  // Enter: 删除/恢复
  if (event.key === 'Enter' && !event.shiftKey && editingIndex.value === null) {
    event.preventDefault()
    store.toggleChapterDeletedApi(chapter)
  }

  // Delete: 逻辑删除（画横线）
  if (event.key === 'Delete' && !event.shiftKey) {
    event.preventDefault()
    store.toggleChapterDeletedApi(chapter)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  // 确保规则已从 localStorage 加载并同步
  // 触发一次 watch 以确保正则表达式显示正确
  if (store.chapterRule) {
    // watch 会自动触发，这里只是确保规则已加载
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.chapter-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-title-editor {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.book-title-editor label {
  white-space: nowrap;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
  min-width: 50px;
}

.book-title-editor .el-input {
  flex: 1;
}

.book-title-editor :deep(.el-input__inner) {
  border-radius: 6px;
  border-color: var(--el-border-color);
  transition: all 0.3s ease;
}

.book-title-editor :deep(.el-input__inner:focus) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
}

.regex-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.dark .regex-display {
  background: var(--color-bg-soft);
  border-color: var(--color-border);
}

.regex-display label {
  white-space: nowrap;
  font-weight: 500;
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.regex-input {
  flex: 1;
}

.regex-input :deep(.el-input__inner) {
  background: var(--el-bg-color-page);
  border-color: var(--el-border-color-lighter);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
}

.dark .regex-input :deep(.el-input__inner) {
  background: var(--color-bg-soft);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar :deep(.el-button) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.toolbar :deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lines-input,
.line-input {
  width: 90px;
}

.lines-input :deep(.el-input__inner),
.line-input :deep(.el-input__inner) {
  border-radius: 6px;
  text-align: center;
}

.table-container {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

.dark .table-container {
  background: #1E2736;
  border-color: var(--color-border);
}

:deep(.table-container .el-table) {
  border: none;
  background: transparent;
}

.dark :deep(.table-container .el-table) {
  background: #1E2736;
}

.dark :deep(.table-container .el-table .el-table__inner-wrapper) {
  background: #1E2736;
}

.dark :deep(.table-container .el-table tbody) {
  background: #1E2736;
}

/* 暗色主题下表格行基础样式优化 */
.dark :deep(.table-container .el-table tbody tr) {
  background-color: #1E2736;
  transition: background-color 0.2s ease;
}

.dark :deep(.table-container .el-table tbody tr:nth-child(even)) {
  background-color: #1E2736;
}

.dark :deep(.table-container .el-table tbody tr:hover) {
  background-color: #2A3441 !important;
}

.dark :deep(.table-container .el-table tbody tr.current-row) {
  background-color: rgba(64, 158, 255, 0.15) !important;
}

:deep(.table-container .el-table__header) {
  background: var(--el-bg-color-page);
}

.dark :deep(.table-container .el-table__header) {
  background: #1E2736;
}

:deep(.table-container .el-table th) {
  background: transparent;
  border-bottom: 2px solid var(--el-border-color);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dark :deep(.table-container .el-table th) {
  border-bottom-color: var(--color-border);
}

:deep(.table-container .el-table td) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.dark :deep(.table-container .el-table td) {
  border-bottom-color: var(--color-border);
}

:deep(.table-container .el-table__row:hover) {
  background: var(--el-fill-color-lighter);
}

.dark :deep(.table-container .el-table__row:hover) {
  background: #2A3441;
}

.instructions {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 12px 0;
  margin-bottom: 16px;
  opacity: 0.9;
}

.instructions span {
  padding: 4px 8px;
  background: var(--el-bg-color);
  border-radius: 4px;
  font-weight: 500;
}

.dark .instructions span {
  background: var(--color-surface);
}

:deep(.deleted-row) {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.dark :deep(.deleted-row) {
  background-color: var(--color-bg-muted);
  opacity: 0.7;
}

.dark :deep(.deleted-row:hover) {
  background-color: var(--color-bg-muted);
  opacity: 0.85;
}

:deep(.deleted-row td) {
  text-decoration: line-through;
  opacity: 0.6;
}

:deep(.short-chapter-row) {
  background-color: var(--el-warning-color-light-9);
}

.dark :deep(.short-chapter-row) {
  background-color: rgba(251, 146, 60, 0.12);
}

.dark :deep(.short-chapter-row:hover) {
  background-color: rgba(251, 146, 60, 0.18) !important;
}

:deep(.el-table__row.current-row) {
  background-color: var(--el-color-primary-light-9);
}

.dark :deep(.el-table__row.current-row) {
  background-color: rgba(64, 158, 255, 0.15) !important;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
  background-color: transparent;
}


:deep(.el-table .el-table__cell .cell) {
  padding: 0;
  padding-right: 12px;
  overflow: visible;
}

:deep(.el-table .el-table__cell:first-child .cell) {
  padding-left: 12px;
}

.chapter-title {
  display: block;
  transition: padding-left 0.2s;
  box-sizing: border-box;
  white-space: nowrap;
}

.chapter-title.level-0 {
  font-weight: 500;
}

.chapter-title.level-1 {
  font-weight: 400;
}

.chapter-title.level-2 {
  font-weight: 300;
  font-size: 0.95em;
}

/* 章节编辑器进入动画 */
.chapter-editor {
  animation: fadeIn 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 正则显示进入动画 */
.regex-display {
  animation: slideDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 工具栏进入动画 */
.toolbar {
  animation: slideUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表格容器进入动画 */
.table-container {
  animation: scaleIn 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 表格行动画 */
:deep(.el-table__row) {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.el-table__row:hover) {
  transform: translateX(4px);
}

:deep(.el-table__row.current-row) {
  animation: rowHighlight 0.5s ease;
}

@keyframes rowHighlight {
  0% {
    background-color: var(--el-color-primary-light-9);
  }
  50% {
    background-color: var(--el-color-primary-light-8);
  }
  100% {
    background-color: var(--el-color-primary-light-9);
  }
}

/* 章节标题编辑动画 */
.chapter-title {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.chapter-title:hover {
  transform: translateX(2px);
}

/* 按钮点击动画 */
.toolbar :deep(.el-button) {
  position: relative;
  overflow: hidden;
}

.toolbar :deep(.el-button::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.toolbar :deep(.el-button:active::after) {
  width: 300px;
  height: 300px;
}

/* 操作说明动画 */
.instructions {
  animation: fadeInUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 删除行动画 */
:deep(.deleted-row) {
  animation: fadeOut 0.3s ease;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.6;
  }
}

/* 短章节标记动画 */
:deep(.short-chapter-row) {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    background-color: var(--el-warning-color-light-9);
  }
  50% {
    background-color: var(--el-warning-color-light-8);
  }
}
</style>

