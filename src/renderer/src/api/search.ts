/**
 * 搜索相关 API
 */

import type { SearchResult } from '../types'
import type { ApiResponse } from '../types/api'

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

