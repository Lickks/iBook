/**
 * 工具函数统一导出
 */

export * from './format'

/**
 * 过滤书名用于网络检索
 * 去除括号及其内容，例如 "你好（111）.epub" -> "你好.epub"
 * 注意：仅用于网络检索，原始书名保留用于表单填充
 */
export function filterTitleForSearch(title: string): string {
  if (!title) return ''
  // 移除括号及其内容，包括中文括号和英文括号
  return title.replace(/[（(][^）)]*[）)]/g, '').trim()
}

