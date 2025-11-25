<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { useTagStore } from '../stores/tag'
import { DEFAULT_TAG_COLORS } from '../constants'
import type { Tag, TagInput } from '../types'

const props = withDefaults(
  defineProps<{
    modelValue: number[]
    allowCreate?: boolean
    placeholder?: string
  }>(),
  {
    modelValue: () => [],
    allowCreate: true,
    placeholder: '选择或创建标签'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const tagStore = useTagStore()
const showDropdown = ref(false)
const searchKeyword = ref('')
const showCreateDialog = ref(false)
const newTagName = ref('')
const newTagColor = ref(DEFAULT_TAG_COLORS[0])
const creating = ref(false)

const selectedTagIds = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedTags = computed(() => {
  return tagStore.tags.filter((tag) => selectedTagIds.value.includes(tag.id))
})

const filteredTags = computed(() => {
  if (!searchKeyword.value.trim()) {
    return tagStore.tags
  }
  const keyword = searchKeyword.value.toLowerCase()
  return tagStore.tags.filter(
    (tag) =>
      tag.tagName.toLowerCase().includes(keyword) &&
      !selectedTagIds.value.includes(tag.id)
  )
})

const availableTags = computed(() => {
  return filteredTags.value.filter((tag) => !selectedTagIds.value.includes(tag.id))
})

onMounted(async () => {
  if (tagStore.tags.length === 0) {
    await tagStore.fetchTags()
  }
})

function toggleTag(tagId: number): void {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index === -1) {
    selectedTagIds.value = [...selectedTagIds.value, tagId]
  } else {
    selectedTagIds.value = selectedTagIds.value.filter((id) => id !== tagId)
  }
}

function removeTag(tagId: number): void {
  selectedTagIds.value = selectedTagIds.value.filter((id) => id !== tagId)
}

async function createTag(): Promise<void> {
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
    if (!selectedTagIds.value.includes(existingTag.id)) {
      selectedTagIds.value = [...selectedTagIds.value, existingTag.id]
    }
    showCreateDialog.value = false
    newTagName.value = ''
    return
  }

  creating.value = true
  try {
    const input: TagInput = {
      tagName: newTagName.value.trim(),
      color: newTagColor.value
    }
    const tag = await tagStore.createTag(input)
    selectedTagIds.value = [...selectedTagIds.value, tag.id]
    showCreateDialog.value = false
    newTagName.value = ''
    ElMessage.success('标签创建成功')
  } catch (error: any) {
    ElMessage.error(error.message || '创建标签失败')
  } finally {
    creating.value = false
  }
}

function handleClickOutside(event: MouseEvent): void {
  const target = event.target as HTMLElement
  const dropdown = document.querySelector('.tag-dropdown')
  const addBtn = document.querySelector('.add-tag-btn')
  if (
    dropdown &&
    !dropdown.contains(target) &&
    addBtn &&
    !addBtn.contains(target)
  ) {
    showDropdown.value = false
    searchKeyword.value = ''
  }
}

onMounted(() => {
  if (showDropdown.value) {
    document.addEventListener('click', handleClickOutside)
  }
})

watch(showDropdown, (newVal) => {
  if (newVal) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="tag-selector">
    <!-- 已选标签展示 -->
    <div class="selected-tags">
      <span
        v-for="tag in selectedTags"
        :key="tag.id"
        class="selected-tag"
        :style="{
          '--tag-color': tag.color || '#909399',
          '--tag-bg': `${tag.color || '#909399'}15`,
          '--tag-border': `${tag.color || '#909399'}40`
        }"
      >
        <span class="tag-dot" />
        <span class="tag-name">{{ tag.tagName }}</span>
        <button
          class="remove-btn"
          type="button"
          @click.stop="removeTag(tag.id)"
          title="删除标签"
        >
          ×
        </button>
      </span>
      <button
        v-if="allowCreate || tagStore.tags.length > 0"
        class="add-tag-btn"
        type="button"
        @click="showDropdown = !showDropdown"
      >
        <span class="icon">+</span>
        <span class="text">添加标签</span>
      </button>
    </div>

    <!-- 下拉选择器 -->
    <div v-if="showDropdown" class="tag-dropdown">
      <div class="dropdown-header">
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="搜索标签..."
          @keyup.enter="searchKeyword = ''"
        />
      </div>

      <div class="dropdown-content">
        <div v-if="availableTags.length === 0 && !searchKeyword.trim()" class="empty-state">
          <p>暂无可用标签</p>
        </div>
        <div v-else-if="availableTags.length === 0" class="empty-state">
          <p>未找到匹配的标签</p>
        </div>
        <div v-else class="tag-options">
          <div
            v-for="tag in availableTags"
            :key="tag.id"
            class="tag-option"
            :style="{
              '--tag-color': tag.color || '#909399',
              '--tag-bg': `${tag.color || '#909399'}15`
            }"
            @click="toggleTag(tag.id)"
          >
            <span class="tag-dot" />
            <span class="tag-name">{{ tag.tagName }}</span>
            <span class="check-icon">✓</span>
          </div>
        </div>
      </div>

      <div v-if="allowCreate" class="dropdown-footer">
        <button class="create-tag-btn" type="button" @click="showCreateDialog = true">
          <span class="icon">+</span>
          <span>创建新标签</span>
        </button>
      </div>
    </div>

    <!-- 创建标签对话框 -->
    <div v-if="showCreateDialog" class="create-dialog-overlay" @click="showCreateDialog = false">
      <div class="create-dialog" @click.stop>
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
              @keyup.enter="createTag"
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
          <button class="btn btn-cancel" type="button" @click="showCreateDialog = false">
            取消
          </button>
          <button class="btn btn-confirm" type="button" :disabled="creating" @click="createTag">
            {{ creating ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-selector {
  position: relative;
  width: 100%;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 10px;
  border-radius: 12px;
  background: var(--tag-bg);
  border: 1px solid var(--tag-border);
  font-size: 12px;
  color: var(--tag-color);
  transition: all 0.2s ease;
}

.selected-tag .tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tag-color);
  flex-shrink: 0;
}

.selected-tag .tag-name {
  font-weight: 500;
  white-space: nowrap;
}

.selected-tag .remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--tag-color);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.selected-tag .remove-btn:hover {
  opacity: 1;
  background: var(--tag-color);
  color: white;
  transform: scale(1.1);
}

.add-tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-tag-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-bg-soft);
}

.add-tag-btn .icon {
  font-size: 14px;
  font-weight: bold;
}

.tag-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.dropdown-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.tag-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--tag-bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-option:hover {
  background: var(--tag-color);
  color: white;
}

.tag-option .tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tag-color);
  flex-shrink: 0;
}

.tag-option:hover .tag-dot {
  background: white;
}

.tag-option .tag-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.tag-option .check-icon {
  opacity: 0;
  transition: opacity 0.2s;
}

.tag-option:hover .check-icon {
  opacity: 1;
}

.dropdown-footer {
  padding: 8px;
  border-top: 1px solid var(--color-border);
}

.create-tag-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-tag-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-bg-soft);
}

.create-dialog-overlay {
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

.create-dialog {
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

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
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

