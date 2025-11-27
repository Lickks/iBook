/**
 * TXT 转 EPUB 相关 API
 */

import type { ChapterRule, Chapter, BookMetadata, ImageProcessOptions } from '../types/txtToEpub'
import type { ApiResponse } from '../types/api'

/**
 * 选择 TXT 文件
 */
export async function selectTxtFile(): Promise<string> {
  const response = await window.api.txtToEpub.selectTxtFile()
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '选择文件失败')
}

/**
 * 读取文件内容
 */
export async function readFile(filePath: string): Promise<string> {
  const response = await window.api.txtToEpub.readFile(filePath)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '读取文件失败')
}

/**
 * 检测文件编码
 */
export async function detectEncoding(filePath: string): Promise<string> {
  const response = await window.api.txtToEpub.detectEncoding(filePath)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '检测编码失败')
}

/**
 * 解析章节
 */
export async function parseChapters(content: string, rule: ChapterRule): Promise<Chapter[]> {
  // 确保规则对象是可序列化的（移除任何不可序列化的属性）
  const serializableRule: ChapterRule = {
    mode: rule.mode,
    allowLeadingSpaces: rule.allowLeadingSpaces,
    ordinalPrefix: rule.ordinalPrefix,
    numberType: rule.numberType,
    chapterMarker: rule.chapterMarker,
    additionalRules: rule.additionalRules,
    regex: rule.regex
  }
  const response = await window.api.txtToEpub.parseChapters(content, serializableRule)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '解析章节失败')
}

/**
 * 验证正则表达式
 */
export async function validateRegex(regex: string): Promise<{ valid: boolean; error?: string }> {
  const response = await window.api.txtToEpub.validateRegex(regex)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '验证正则表达式失败')
}

/**
 * 测试正则表达式
 */
export async function testRegex(content: string, regex: string): Promise<string[]> {
  const response = await window.api.txtToEpub.testRegex(content, regex)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '测试正则表达式失败')
}

/**
 * 选择封面图片
 */
export async function selectCoverImage(): Promise<string> {
  const response = await window.api.txtToEpub.selectCoverImage()
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '选择封面图片失败')
}

/**
 * 处理封面图片
 * 返回包含 dataUrl 和 filePath 的对象
 */
export async function processCoverImage(
  imagePath: string,
  options?: ImageProcessOptions
): Promise<{ dataUrl: string; filePath: string }> {
  const response = await window.api.txtToEpub.processCoverImage(imagePath, options)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '处理封面图片失败')
}

/**
 * 生成 EPUB 文件
 */
export async function generateEpub(
  chapters: Chapter[],
  metadata: BookMetadata,
  coverImagePath?: string
): Promise<string> {
  // 确保章节数据完全可序列化（移除 selected 等临时属性）
  const serializableChapters = chapters.map((chapter) => ({
    index: chapter.index,
    title: chapter.title,
    content: chapter.content,
    lineStart: chapter.lineStart,
    lineEnd: chapter.lineEnd,
    wordCount: chapter.wordCount
  }))

  // 确保元数据完全可序列化
  const serializableMetadata: BookMetadata = {
    title: metadata.title,
    author: metadata.author,
    description: metadata.description,
    publisher: metadata.publisher,
    isbn: metadata.isbn,
    publishDate: metadata.publishDate,
    language: metadata.language,
    tags: metadata.tags ? [...metadata.tags] : undefined
  }

  const response = await window.api.txtToEpub.generateEpub(
    serializableChapters,
    serializableMetadata,
    coverImagePath
  )
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '生成 EPUB 失败')
}

/**
 * 保存 EPUB 文件
 */
export async function saveEpub(epubPath: string, defaultFileName?: string): Promise<string> {
  const response = await window.api.txtToEpub.saveEpub(epubPath, defaultFileName)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '保存 EPUB 失败')
}

