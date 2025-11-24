/**
 * 搜索相关 API
 */

import type { SearchResult } from '../types'

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
