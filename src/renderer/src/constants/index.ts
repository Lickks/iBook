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

