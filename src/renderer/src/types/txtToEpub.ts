/**
 * TXT 转 EPUB 相关类型定义
 */

/**
 * 章节划分规则
 */
export interface ChapterRule {
  /** 模式：简易规则或正则表达式 */
  mode: 'simple' | 'regex'
  /** 简易规则：是否允许行首空格 */
  allowLeadingSpaces?: boolean
  /** 简易规则：序数词前缀（第、序、卷等） */
  ordinalPrefix?: string
  /** 简易规则：数字类型 */
  numberType?: 'arabic' | 'chinese' | 'mixed'
  /** 简易规则：章节标识（章、回、卷、节、集、部等） */
  chapterMarker?: string
  /** 简易规则：附加规则（使用 | 分隔多个规则） */
  additionalRules?: string
  /** 正则表达式模式：正则表达式字符串 */
  regex?: string
}

/**
 * 章节信息
 */
export interface Chapter {
  /** 章节序号（从 1 开始） */
  index: number
  /** 章节标题 */
  title: string
  /** 章节内容 */
  content: string
  /** 章节在文件中的起始行号（从 1 开始） */
  lineStart: number
  /** 章节在文件中的结束行号（从 1 开始） */
  lineEnd: number
  /** 章节字数 */
  wordCount: number
  /** 是否选中（用于多选操作） */
  selected?: boolean
  /** 层级（0为顶级，1为二级，以此类推） */
  level?: number
  /** 是否已删除（逻辑删除） */
  deleted?: boolean
  /** 是否为短章节（行数不超过阈值） */
  isShortChapter?: boolean
}

/**
 * 书籍元数据
 */
export interface BookMetadata {
  /** 书名（必填） */
  title: string
  /** 作者 */
  author?: string
  /** 简介/描述 */
  description?: string
  /** 出版社 */
  publisher?: string
  /** ISBN */
  isbn?: string
  /** 出版日期（格式：YYYY-MM-DD） */
  publishDate?: string
  /** 语言（默认：zh-CN） */
  language?: string
  /** 分类/标签 */
  tags?: string[]
}

/**
 * EPUB 生成选项
 */
export interface EpubOptions {
  /** 章节列表 */
  chapters: Chapter[]
  /** 书籍元数据 */
  metadata: BookMetadata
  /** 封面图片路径（可选） */
  coverImagePath?: string
  /** 输出文件路径 */
  outputPath: string
}

/**
 * 转换进度
 */
export interface ConversionProgress {
  /** 当前步骤 */
  step: 'reading' | 'parsing' | 'generating' | 'packaging' | 'complete'
  /** 进度百分比（0-100） */
  progress: number
  /** 进度消息 */
  message: string
}

/**
 * 图片处理选项
 */
export interface ImageProcessOptions {
  /** 目标宽度 */
  width?: number
  /** 目标高度 */
  height?: number
  /** 是否保持宽高比 */
  maintainAspectRatio?: boolean
  /** 质量（0-100，仅适用于 JPEG） */
  quality?: number
}

