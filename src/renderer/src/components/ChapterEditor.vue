<template>
  <div class="chapter-editor">
    <!-- 顶部：当前正则表达式 -->
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
              @blur="handleTitleBlur($index)"
              @keyup.enter="handleTitleBlur($index)"
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

// 处理标题编辑完成
async function handleTitleBlur(index: number) {
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

.regex-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.regex-display label {
  white-space: nowrap;
}

.regex-input {
  flex: 1;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lines-input,
.line-input {
  width: 80px;
}

.table-container {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}

:deep(.table-container .el-table) {
  border: none;
}

.instructions {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 8px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
}

:deep(.deleted-row) {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

:deep(.deleted-row td) {
  text-decoration: line-through;
  opacity: 0.6;
}

:deep(.short-chapter-row) {
  background-color: var(--el-warning-color-light-9);
}

:deep(.el-table__row.current-row) {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
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
</style>

