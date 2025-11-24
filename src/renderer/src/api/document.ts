/**
 * 文档相关 API
 */

import type { Document, DocumentInput } from '../types'
import type { ApiResponse } from '../types/api'

/**
 * 上传文档
 */
export async function uploadDocument(input: DocumentInput): Promise<Document> {
  const response = await window.api.document.upload(input)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '上传文档失败')
}

/**
 * 删除文档
 */
export async function deleteDocument(id: number): Promise<boolean> {
  const response = await window.api.document.delete(id)
  if (response.success) {
    return true
  }
  throw new Error(response.error || '删除文档失败')
}

/**
 * 打开文档
 */
export async function openDocument(filePath: string): Promise<void> {
  const response = await window.api.document.open(filePath)
  if (response.success) {
    return
  }
  throw new Error(response.error || '打开文档失败')
}

/**
 * 统计文档字数
 */
export async function countWords(filePath: string): Promise<number> {
  const response = await window.api.document.countWords(filePath)
  if (response.success && response.data !== undefined) {
    return response.data
  }
  throw new Error(response.error || '统计字数失败')
}

/**
 * 根据书籍ID获取所有文档
 */
export async function getDocumentsByBookId(bookId: number): Promise<Document[]> {
  const response = await window.api.document.getByBookId(bookId)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '获取文档列表失败')
}

/**
 * 更新文档
 */
export async function updateDocument(
  id: number,
  input: Partial<DocumentInput>
): Promise<Document> {
  const response = await window.api.document.update(id, input)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '更新文档失败')
}

