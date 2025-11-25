import type { Tag, TagInput } from '../types/book'
import type { ApiResponse } from '../types/api'

/**
 * 创建标签
 */
export async function createTag(input: TagInput): Promise<Tag> {
  const response = (await window.api.tag.create(input)) as ApiResponse<Tag>
  if (!response.success) {
    throw new Error(response.error || '创建标签失败')
  }
  return response.data!
}

/**
 * 更新标签
 */
export async function updateTag(id: number, input: Partial<TagInput>): Promise<Tag> {
  const response = (await window.api.tag.update(id, input)) as ApiResponse<Tag>
  if (!response.success) {
    throw new Error(response.error || '更新标签失败')
  }
  return response.data!
}

/**
 * 删除标签
 */
export async function deleteTag(id: number): Promise<boolean> {
  const response = (await window.api.tag.delete(id)) as ApiResponse
  if (!response.success) {
    throw new Error(response.error || '删除标签失败')
  }
  return true
}

/**
 * 获取所有标签
 */
export async function getAllTags(): Promise<Tag[]> {
  const response = (await window.api.tag.getAll()) as ApiResponse<Tag[]>
  if (!response.success) {
    throw new Error(response.error || '获取标签列表失败')
  }
  return response.data || []
}

/**
 * 根据ID获取标签
 */
export async function getTagById(id: number): Promise<Tag | null> {
  const response = (await window.api.tag.getById(id)) as ApiResponse<Tag>
  if (!response.success) {
    throw new Error(response.error || '获取标签失败')
  }
  return response.data || null
}

/**
 * 为书籍添加标签
 */
export async function addTagToBook(bookId: number, tagId: number): Promise<boolean> {
  const response = (await window.api.tag.addToBook(bookId, tagId)) as ApiResponse
  if (!response.success) {
    throw new Error(response.error || '添加标签失败')
  }
  return true
}

/**
 * 移除书籍标签
 */
export async function removeTagFromBook(bookId: number, tagId: number): Promise<boolean> {
  const response = (await window.api.tag.removeFromBook(bookId, tagId)) as ApiResponse
  if (!response.success) {
    throw new Error(response.error || '移除标签失败')
  }
  return true
}

/**
 * 获取书籍的所有标签
 */
export async function getTagsByBookId(bookId: number): Promise<Tag[]> {
  const response = (await window.api.tag.getByBookId(bookId)) as ApiResponse<Tag[]>
  if (!response.success) {
    throw new Error(response.error || '获取书籍标签失败')
  }
  return response.data || []
}

/**
 * 批量为书籍添加标签
 */
export async function batchAddTagToBooks(bookIds: number[], tagId: number): Promise<number> {
  const response = (await window.api.tag.batchAddToBooks(bookIds, tagId)) as ApiResponse<number>
  if (!response.success) {
    throw new Error(response.error || '批量添加标签失败')
  }
  return response.data || 0
}

/**
 * 获取标签使用统计
 */
export async function getTagUsageCount(tagId: number): Promise<number> {
  const response = (await window.api.tag.getUsageCount(tagId)) as ApiResponse<number>
  if (!response.success) {
    throw new Error(response.error || '获取标签使用统计失败')
  }
  return response.data || 0
}

