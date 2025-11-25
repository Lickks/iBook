import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag, TagInput } from '../types'
import * as tagAPI from '../api/tag'

/**
 * 标签状态管理 Store
 */
export const useTagStore = defineStore('tag', () => {
  // State
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  // Actions
  /**
   * 获取所有标签
   */
  async function fetchTags(): Promise<void> {
    loading.value = true
    try {
      tags.value = await tagAPI.getAllTags()
    } catch (error: any) {
      console.error('获取标签列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建标签
   */
  async function createTag(input: TagInput): Promise<Tag> {
    loading.value = true
    try {
      const tag = await tagAPI.createTag(input)
      tags.value.unshift(tag) // 添加到列表开头
      return tag
    } catch (error: any) {
      console.error('创建标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新标签
   */
  async function updateTag(id: number, input: Partial<TagInput>): Promise<Tag> {
    loading.value = true
    try {
      const tag = await tagAPI.updateTag(id, input)
      const index = tags.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tags.value[index] = tag
      }
      return tag
    } catch (error: any) {
      console.error('更新标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除标签
   */
  async function deleteTag(id: number): Promise<void> {
    loading.value = true
    try {
      await tagAPI.deleteTag(id)
      const index = tags.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tags.value.splice(index, 1)
      }
    } catch (error: any) {
      console.error('删除标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取标签
   */
  function getTagById(id: number): Tag | undefined {
    return tags.value.find((t) => t.id === id)
  }

  return {
    // State
    tags,
    loading,
    // Actions
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getTagById
  }
})

