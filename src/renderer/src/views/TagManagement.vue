<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTagStore } from '../stores/tag'
import { DEFAULT_TAG_COLORS } from '../constants'
import type { Tag, TagInput } from '../types'
import * as tagAPI from '../api/tag'
import TagList from '../components/TagList.vue'

const tagStore = useTagStore()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingTag = ref<Tag | null>(null)
const newTagName = ref('')
const newTagColor = ref(DEFAULT_TAG_COLORS[0])
const creating = ref(false)
const tagUsageCounts = ref<Record<number, number>>({})

const tags = computed(() => tagStore.tags)

onMounted(async () => {
  await tagStore.fetchTags()
  await loadUsageCounts()
})

async function loadUsageCounts(): Promise<void> {
  const counts: Record<number, number> = {}
  for (const tag of tagStore.tags) {
    try {
      counts[tag.id] = await tagAPI.getTagUsageCount(tag.id)
    } catch (error) {
      counts[tag.id] = 0
    }
  }
  tagUsageCounts.value = counts
}

function openCreateDialog(): void {
  newTagName.value = ''
  newTagColor.value = DEFAULT_TAG_COLORS[0]
  showCreateDialog.value = true
}

function openEditDialog(tag: Tag): void {
  editingTag.value = tag
  newTagName.value = tag.tagName
  newTagColor.value = tag.color || DEFAULT_TAG_COLORS[0]
  showEditDialog.value = true
}

function closeDialogs(): void {
  showCreateDialog.value = false
  showEditDialog.value = false
  editingTag.value = null
  newTagName.value = ''
}

async function handleCreate(): Promise<void> {
  if (!newTagName.value.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  // 检查标签是否已存在
  const existingTag = tagStore.tags.find(
    (tag) => tag.tagName.toLowerCase() === newTagName.value.trim().toLowerCase()
  )
  if (existingTag) {
    ElMessage.warning('标签已存在')
    return
  }

  creating.value = true
  try {
    const input: TagInput = {
      tagName: newTagName.value.trim(),
      color: newTagColor.value
    }
    await tagStore.createTag(input)
    await loadUsageCounts()
    closeDialogs()
    ElMessage.success('标签创建成功')
  } catch (error: any) {
    ElMessage.error(error.message || '创建标签失败')
  } finally {
    creating.value = false
  }
}

async function handleUpdate(): Promise<void> {
  if (!editingTag.value || !newTagName.value.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  // 检查标签是否已存在（排除当前编辑的标签）
  const existingTag = tagStore.tags.find(
    (tag) =>
      tag.id !== editingTag.value!.id &&
      tag.tagName.toLowerCase() === newTagName.value.trim().toLowerCase()
  )
  if (existingTag) {
    ElMessage.warning('标签名称已存在')
    return
  }

  creating.value = true
  try {
    const input: Partial<TagInput> = {
      tagName: newTagName.value.trim(),
      color: newTagColor.value
    }
    await tagStore.updateTag(editingTag.value.id, input)
    await loadUsageCounts()
    closeDialogs()
    ElMessage.success('标签更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '更新标签失败')
  } finally {
    creating.value = false
  }
}

async function handleDelete(tag: Tag): Promise<void> {
  const usageCount = tagUsageCounts.value[tag.id] || 0
  if (usageCount > 0) {
    ElMessageBox.confirm(
      `标签 "${tag.tagName}" 正在被 ${usageCount} 本书使用，删除后这些书籍将失去该标签。确定要删除吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          await tagStore.deleteTag(tag.id)
          await loadUsageCounts()
          ElMessage.success('标签删除成功')
        } catch (error: any) {
          ElMessage.error(error.message || '删除标签失败')
        }
      })
      .catch(() => {
        // 用户取消
      })
  } else {
    ElMessageBox.confirm(`确定要删除标签 "${tag.tagName}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await tagStore.deleteTag(tag.id)
          await loadUsageCounts()
          ElMessage.success('标签删除成功')
        } catch (error: any) {
          ElMessage.error(error.message || '删除标签失败')
        }
      })
      .catch(() => {
        // 用户取消
      })
  }
}

function getTagStyle(tag: Tag): Record<string, string> {
  const color = tag.color || '#909399'
  return {
    '--tag-color': color,
    '--tag-bg': `${color}15`,
    '--tag-border': `${color}40`
  }
}
</script>

<template>
  <div class="tag-management">
    <div class="page-header">
      <h1 class="page-title">标签管理</h1>
      <button class="btn btn-primary" type="button" @click="openCreateDialog">
        <span class="icon">+</span>
        <span>创建标签</span>
      </button>
    </div>

    <div v-if="tagStore.loading" class="loading-state">
      <div class="loader" />
      <p>加载中...</p>
    </div>

    <div v-else-if="tags.length === 0" class="empty-state">
      <p>暂无标签，点击「创建标签」开始添加</p>
    </div>

    <div v-else class="tag-grid">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="tag-card"
        :style="getTagStyle(tag)"
      >
        <div class="tag-header">
          <div class="tag-info">
            <span class="tag-dot" />
            <span class="tag-name">{{ tag.tagName }}</span>
          </div>
          <div class="tag-actions">
            <button
              class="action-btn edit-btn"
              type="button"
              title="编辑"
              @click="openEditDialog(tag)"
            >
              ✏️
            </button>
            <button
              class="action-btn delete-btn"
              type="button"
              title="删除"
              @click="handleDelete(tag)"
            >
              🗑️
            </button>
          </div>
        </div>
        <div class="tag-footer">
          <span class="usage-count">
            使用于 {{ tagUsageCounts[tag.id] || 0 }} 本书
          </span>
        </div>
      </div>
    </div>

    <!-- 创建标签对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="closeDialogs">
      <div class="dialog" @click.stop>
        <h3 class="dialog-title">创建新标签</h3>
        <div class="dialog-content">
          <div class="form-item">
            <label class="form-label">标签名称</label>
            <input
              v-model="newTagName"
              type="text"
              class="form-input"
              placeholder="请输入标签名称"
              maxlength="20"
              @keyup.enter="handleCreate"
            />
          </div>
          <div class="form-item">
            <label class="form-label">标签颜色</label>
            <div class="color-picker">
              <button
                v-for="color in DEFAULT_TAG_COLORS"
                :key="color"
                type="button"
                class="color-option"
                :class="{ active: newTagColor === color }"
                :style="{ backgroundColor: color }"
                @click="newTagColor = color"
              />
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" type="button" @click="closeDialogs">取消</button>
          <button
            class="btn btn-confirm"
            type="button"
            :disabled="creating"
            @click="handleCreate"
          >
            {{ creating ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑标签对话框 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click="closeDialogs">
      <div class="dialog" @click.stop>
        <h3 class="dialog-title">编辑标签</h3>
        <div class="dialog-content">
          <div class="form-item">
            <label class="form-label">标签名称</label>
            <input
              v-model="newTagName"
              type="text"
              class="form-input"
              placeholder="请输入标签名称"
              maxlength="20"
              @keyup.enter="handleUpdate"
            />
          </div>
          <div class="form-item">
            <label class="form-label">标签颜色</label>
            <div class="color-picker">
              <button
                v-for="color in DEFAULT_TAG_COLORS"
                :key="color"
                type="button"
                class="color-option"
                :class="{ active: newTagColor === color }"
                :style="{ backgroundColor: color }"
                @click="newTagColor = color"
              />
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" type="button" @click="closeDialogs">取消</button>
          <button
            class="btn btn-confirm"
            type="button"
            :disabled="creating"
            @click="handleUpdate"
          >
            {{ creating ? '更新中...' : '更新' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-management {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background: var(--color-accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-tertiary);
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
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

.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.tag-card {
  background: var(--color-surface);
  border: 1px solid var(--tag-border);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.tag-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--tag-color);
  flex-shrink: 0;
}

.tag-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--tag-color);
}

.tag-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--color-bg-muted);
}

.delete-btn:hover {
  background: #fee;
}

.tag-footer {
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.usage-count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dialog-content {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--color-text-primary);
  box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-text-primary);
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
}

.btn-cancel:hover {
  background: var(--color-bg-soft);
}

.btn-confirm {
  background: var(--color-accent);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

