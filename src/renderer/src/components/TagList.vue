<script setup lang="ts">
import type { Tag } from '../types'

const props = withDefaults(
  defineProps<{
    tags?: Tag[]
    clickable?: boolean
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    tags: () => [],
    clickable: false,
    size: 'medium'
  }
)

const emit = defineEmits<{
  (e: 'tag-click', tag: Tag): void
}>()

function handleTagClick(tag: Tag): void {
  if (props.clickable) {
    emit('tag-click', tag)
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
  <div v-if="tags && tags.length > 0" class="tag-list" :class="[`tag-list--${size}`]">
    <span
      v-for="tag in tags"
      :key="tag.id"
      class="tag-item"
      :class="{ 'tag-item--clickable': clickable }"
      :style="getTagStyle(tag)"
      @click="handleTagClick(tag)"
    >
      <span class="tag-dot" />
      <span class="tag-name">{{ tag.tagName }}</span>
    </span>
  </div>
  <div v-else class="tag-list tag-list--empty">
    <span class="empty-text">暂无标签</span>
  </div>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-list--small {
  gap: 6px;
}

.tag-list--large {
  gap: 10px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--tag-bg);
  border: 1px solid var(--tag-border);
  font-size: 12px;
  color: var(--tag-color);
  transition: all 0.2s ease;
}

.tag-list--small .tag-item {
  padding: 2px 8px;
  font-size: 11px;
  gap: 4px;
}

.tag-list--large .tag-item {
  padding: 6px 12px;
  font-size: 13px;
  gap: 8px;
}

.tag-item--clickable {
  cursor: pointer;
}

.tag-item--clickable:hover {
  background: var(--tag-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--tag-border);
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tag-color);
  flex-shrink: 0;
}

.tag-list--small .tag-dot {
  width: 4px;
  height: 4px;
}

.tag-list--large .tag-dot {
  width: 8px;
  height: 8px;
}

.tag-name {
  font-weight: 500;
  white-space: nowrap;
}

.tag-list--empty {
  padding: 8px 0;
}

.empty-text {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-style: italic;
}
</style>

