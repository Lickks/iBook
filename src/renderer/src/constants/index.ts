/**
 * 常量定义
 */

/**
 * 阅读状态
 */
export const READING_STATUS = {
  UNREAD: 'unread',
  READING: 'reading',
  FINISHED: 'finished',
  DROPPED: 'dropped',
  TO_READ: 'to-read'
} as const

export const READING_STATUS_LABEL = {
  [READING_STATUS.UNREAD]: '未读',
  [READING_STATUS.READING]: '阅读中',
  [READING_STATUS.FINISHED]: '已读完',
  [READING_STATUS.DROPPED]: '弃读',
  [READING_STATUS.TO_READ]: '待读'
} as const

/**
 * 字数来源
 */
export const WORD_COUNT_SOURCE = {
  SEARCH: 'search',
  DOCUMENT: 'document',
  MANUAL: 'manual'
} as const

export const WORD_COUNT_SOURCE_LABEL = {
  [WORD_COUNT_SOURCE.SEARCH]: '检索来源',
  [WORD_COUNT_SOURCE.DOCUMENT]: '文档计算',
  [WORD_COUNT_SOURCE.MANUAL]: '手动输入'
} as const

/**
 * 支持的文档类型
 */
export const SUPPORTED_FILE_TYPES = [
  'txt',
  'epub',
  'pdf',
  'mobi',
  'azw',
  'azw3',
  'doc',
  'docx'
] as const

/**
 * 文件大小限制（字节）
 */
export const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200MB

/**
 * 排序选项
 */
export const SORT_BY = {
  WORD_COUNT: 'wordCount',
  CREATED_AT: 'createdAt',
  RATING: 'rating',
  TITLE: 'title',
  AUTHOR: 'author'
} as const

export const SORT_BY_LABEL = {
  [SORT_BY.WORD_COUNT]: '字数',
  [SORT_BY.CREATED_AT]: '添加时间',
  [SORT_BY.RATING]: '评分',
  [SORT_BY.TITLE]: '书名',
  [SORT_BY.AUTHOR]: '作者'
} as const

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export const SORT_ORDER_LABEL = {
  [SORT_ORDER.ASC]: '升序',
  [SORT_ORDER.DESC]: '降序'
} as const

/**
 * 默认标签颜色列表
 */
export const DEFAULT_TAG_COLORS = [
  '#409EFF', // 蓝色
  '#67C23A', // 绿色
  '#E6A23C', // 橙色
  '#F56C6C', // 红色
  '#909399', // 灰色
  '#9C27B0', // 紫色
  '#00BCD4', // 青色
  '#FF9800'  // 深橙色
] as const

