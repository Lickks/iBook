import type { Chapter } from '../../renderer/src/types/txtToEpub'

/**
 * 章节编辑服务
 * 负责章节的编辑操作：更新标题、调整层级、删除/恢复、添加章节等
 */
class ChapterEditorService {
  /**
   * 更新章节标题
   * @param chapter 章节对象
   * @param newTitle 新标题
   * @returns 更新后的章节
   */
  updateChapterTitle(chapter: Chapter, newTitle: string): Chapter {
    return {
      ...chapter,
      title: newTitle.trim()
    }
  }

  /**
   * 调整章节层级
   * @param chapter 章节对象
   * @param level 新层级（0为顶级）
   * @returns 更新后的章节
   */
  adjustChapterLevel(chapter: Chapter, level: number): Chapter {
    const newLevel = Math.max(0, level) // 确保层级不小于0
    return {
      ...chapter,
      level: newLevel
    }
  }

  /**
   * 切换章节删除状态
   * @param chapter 章节对象
   * @returns 更新后的章节
   */
  toggleChapterDeleted(chapter: Chapter): Chapter {
    return {
      ...chapter,
      deleted: !chapter.deleted
    }
  }

  /**
   * 彻底删除章节
   * @param chapters 章节列表
   * @param chapterIndex 要删除的章节索引（从1开始）
   * @returns 更新后的章节列表
   */
  deleteChapter(chapters: Chapter[], chapterIndex: number): Chapter[] {
    return chapters
      .filter((chapter) => chapter.index !== chapterIndex)
      .map((chapter, index) => ({
        ...chapter,
        index: index + 1
      }))
  }

  /**
   * 添加新章节
   * @param chapters 章节列表
   * @param lineNumber 新章节的起始行号
   * @param title 新章节标题（可选，默认为"新章节"）
   * @returns 更新后的章节列表
   */
  addChapter(chapters: Chapter[], lineNumber: number, title?: string): Chapter[] {
    const newChapter: Chapter = {
      index: chapters.length + 1,
      title: title || '新章节',
      content: '',
      lineStart: lineNumber,
      lineEnd: lineNumber,
      wordCount: 0,
      level: 0,
      deleted: false,
      isShortChapter: false
    }

    // 找到插入位置（按行号排序）
    const sortedChapters = [...chapters, newChapter].sort((a, b) => a.lineStart - b.lineStart)

    // 重新计算索引
    return sortedChapters.map((chapter, index) => ({
      ...chapter,
      index: index + 1
    }))
  }

  /**
   * 标记短章节
   * @param chapters 章节列表
   * @param maxLines 最大行数阈值
   * @returns 更新后的章节列表
   */
  markShortChapters(chapters: Chapter[], maxLines: number): Chapter[] {
    return chapters.map((chapter) => {
      const lineCount = chapter.lineEnd - chapter.lineStart + 1
      return {
        ...chapter,
        isShortChapter: lineCount <= maxLines
      }
    })
  }

  /**
   * 重新计算章节索引
   * @param chapters 章节列表
   * @returns 更新后的章节列表
   */
  recalculateIndices(chapters: Chapter[]): Chapter[] {
    return chapters.map((chapter, index) => ({
      ...chapter,
      index: index + 1
    }))
  }

  /**
   * 验证章节编辑结果
   * @param chapters 章节列表
   * @returns 验证结果
   */
  validateChapters(chapters: Chapter[]): { valid: boolean; errors?: string[] } {
    const errors: string[] = []

    // 检查是否有章节
    if (chapters.length === 0) {
      errors.push('至少需要一个章节')
    }

    // 检查是否有未删除的章节
    const activeChapters = chapters.filter((chapter) => !chapter.deleted)
    if (activeChapters.length === 0) {
      errors.push('至少需要一个未删除的章节')
    }

    // 检查章节标题是否为空
    for (const chapter of activeChapters) {
      if (!chapter.title || chapter.title.trim() === '') {
        errors.push(`章节 ${chapter.index} 的标题不能为空`)
      }
    }

    // 检查行号是否有效
    for (const chapter of activeChapters) {
      if (chapter.lineStart < 1) {
        errors.push(`章节 ${chapter.index} 的起始行号无效`)
      }
      if (chapter.lineEnd < chapter.lineStart) {
        errors.push(`章节 ${chapter.index} 的结束行号小于起始行号`)
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    }
  }
}

export const chapterEditorService = new ChapterEditorService()

