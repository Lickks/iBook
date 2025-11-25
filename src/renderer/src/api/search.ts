/**
 * 搜索相关 API
 */

import type { SearchDetail, SearchResult } from '../types'

/**
 * 从 youshu.me 搜索书籍
 */
export async function searchYoushu(keyword: string): Promise<SearchResult[]> {
  const response = await window.api.search.youshu(keyword)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '搜索书籍失败')
}

/**
 * 下载远程封面并进行压缩
 */
export async function downloadCover(url: string, title?: string): Promise<string> {
  const response = await window.api.search.downloadCover(url, title)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '封面下载失败')
}

/**
 * 获取 youshu 作品详情信息（平台等）
 */
export async function fetchYoushuDetail(sourceUrl: string): Promise<SearchDetail> {
  const response = await window.api.search.detail(sourceUrl)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '获取作品详情失败')
}

/**
 * 批量搜索书籍
 */
export async function batchSearchYoushu(keywords: string[]): Promise<Array<{
  keyword: string
  success: boolean
  data?: SearchResult
  error?: string
}>> {
  const response = await window.api.search.batchSearch(keywords)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '批量搜索失败')
}
