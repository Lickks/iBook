import type { ChapterRule, Chapter } from '../../renderer/src/types/txtToEpub'

/**
 * 章节解析服务
 * 负责将文本内容按照规则解析为章节列表
 */
class ChapterParserService {
  /**
   * 解析章节
   * @param content 文件内容
   * @param rule 章节划分规则
   * @returns 章节列表
   */
  parseChapters(content: string, rule: ChapterRule): Chapter[] {
    try {
      // 构建正则表达式
      const regex = rule.mode === 'simple' ? this.buildRegex(rule) : new RegExp(rule.regex || '', 'm')

      // 按行分割内容
      const lines = content.split(/\r?\n/)
      const chapters: Chapter[] = []
      let currentChapter: { title: string; lineStart: number; content: string[] } | null = null

      // 遍历每一行
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1

        // 检查是否匹配章节标题
        if (regex.test(line)) {
          // 如果已有章节，先保存
          if (currentChapter) {
            const chapterContent = currentChapter.content.join('\n')
            const level = this.detectChapterLevel(currentChapter.title)
            const chapter: Chapter = {
              index: chapters.length + 1,
              title: currentChapter.title,
              content: chapterContent,
              lineStart: currentChapter.lineStart,
              lineEnd: lineNumber - 1,
              wordCount: this.countWords(chapterContent),
              level: level,
              deleted: false,
              isShortChapter: false
            }
            chapters.push(chapter)
          }

          // 创建新章节
          currentChapter = {
            title: line.trim(),
            lineStart: lineNumber,
            content: []
          }
        } else {
          // 添加到当前章节内容
          if (currentChapter) {
            currentChapter.content.push(line)
          }
        }
      }

      // 处理最后一个章节
      if (currentChapter) {
        const chapterContent = currentChapter.content.join('\n')
        const level = this.detectChapterLevel(currentChapter.title)
        const chapter: Chapter = {
          index: chapters.length + 1,
          title: currentChapter.title,
          content: chapterContent,
          lineStart: currentChapter.lineStart,
          lineEnd: lines.length,
          wordCount: this.countWords(chapterContent),
          level: level,
          deleted: false,
          isShortChapter: false
        }
        chapters.push(chapter)
      }

      // 如果没有匹配到任何章节，将整个文件作为单章节
      if (chapters.length === 0) {
        chapters.push({
          index: 1,
          title: '正文',
          content: content,
          lineStart: 1,
          lineEnd: lines.length,
          wordCount: this.countWords(content),
          level: 0,
          deleted: false,
          isShortChapter: false
        })
      }

      // 根据章节间的相对关系调整层级（确保层级关系正确）
      this.adjustChapterLevels(chapters)

      return chapters
    } catch (error: any) {
      throw new Error(`章节解析失败: ${error.message}`)
    }
  }

  /**
   * 根据章节间的相对关系调整层级
   * 确保层级关系正确（例如：卷下的章应该是 level 1）
   * @param chapters 章节列表
   */
  private adjustChapterLevels(chapters: Chapter[]): void {
    if (chapters.length === 0) return

    // 重新检测所有章节的层级，确保使用最新的检测逻辑
    for (const chapter of chapters) {
      chapter.level = this.detectChapterLevel(chapter.title)
    }
  }

  /**
   * 检测章节层级
   * 根据章节标题中的标识符确定层级
   * @param title 章节标题
   * @returns 层级（0为顶级，1为二级，以此类推）
   */
  private detectChapterLevel(title: string): number {
    // 层级定义：根据章节标识符确定层级
    // 卷、部 → level 0（顶级）
    // 章、回 → level 1（二级）
    // 节、集 → level 2（三级）
    
    const trimmedTitle = title.trim()
    
    // 优先检测包含"第"字的完整模式（更精确）
    // 匹配：第 + 数字/中文数字 + 卷/部（后面可以有空格和其他内容）
    const volumePattern = /第[\d一二三四五六七八九十百千万]+[卷部]/
    if (volumePattern.test(trimmedTitle)) {
      return 0 // 顶级：第一卷、第一部、第一卷 xxx
    }
    
    // 匹配：第 + 数字/中文数字 + 章/回（后面可以有空格和其他内容）
    const chapterPattern = /第[\d一二三四五六七八九十百千万]+[章回]/
    if (chapterPattern.test(trimmedTitle)) {
      return 1 // 二级：第一章、第一回、第一章 xxx
    }
    
    // 匹配：第 + 数字/中文数字 + 节/集（后面可以有空格和其他内容）
    const sectionPattern = /第[\d一二三四五六七八九十百千万]+[节集]/
    if (sectionPattern.test(trimmedTitle)) {
      return 2 // 三级：第一节、第一集
    }
    
    // 检测不包含"第"字的章节标题
    if (/^[序卷部]/.test(trimmedTitle) || 
        /^序[言卷曲]/.test(trimmedTitle) || 
        /^[前言后记尾声番外楔子最终章引子引言导言跋附记补记附录外传别传前篇后篇]/.test(trimmedTitle)) {
      return 0 // 顶级：序、卷、部、序言、序卷、前言、后记、引子、引言、导言、跋、附记、补记、附录、外传、别传、前篇、后篇等
    } else if (/^[章回]/.test(trimmedTitle)) {
      return 1 // 二级：章、回（无"第"字的情况）
    } else if (/^[节集]/.test(trimmedTitle)) {
      return 2 // 三级：节、集（无"第"字的情况）
    }
    
    // 检测是否包含层级标识符（即使不在开头，但优先级较低）
    // 如果标题中包含"卷"或"部"，且不包含"章"、"回"、"节"、"集"，则为顶级
    if (/[卷部]/.test(trimmedTitle) && !/[章回节集]/.test(trimmedTitle)) {
      return 0
    }
    // 如果标题中包含"章"或"回"，且不包含"节"或"集"，则为二级
    if (/[章回]/.test(trimmedTitle) && !/[节集]/.test(trimmedTitle)) {
      return 1
    }
    // 如果标题中包含"节"或"集"，则为三级
    if (/[节集]/.test(trimmedTitle)) {
      return 2
    }
    
    // 默认层级为 0
    return 0
  }

  /**
   * 将简易规则转换为正则表达式
   * @param rule 简易规则
   * @returns 正则表达式
   */
  private buildRegex(rule: ChapterRule): RegExp {
    let pattern = ''

    // 行首空格
    if (rule.allowLeadingSpaces) {
      pattern += '^\\s*'
    } else {
      pattern += '^'
    }

    // 序数词前缀
    if (rule.ordinalPrefix && rule.ordinalPrefix !== '无' && rule.ordinalPrefix !== '') {
      pattern += this.escapeRegex(rule.ordinalPrefix)
    }

    // 数字类型
    if (rule.numberType) {
      switch (rule.numberType) {
        case 'arabic':
          pattern += '\\d+'
          break
        case 'chinese':
          pattern += '[一二三四五六七八九十百千万]+'
          break
        case 'mixed':
          pattern += '[\\d一二三四五六七八九十百千万]+'
          break
      }
    }

    // 章节标识
    if (rule.chapterMarker && rule.chapterMarker !== '无' && rule.chapterMarker !== '') {
      // 特殊处理"章回卷节集部"，转换为字符类匹配任意一个
      if (rule.chapterMarker === '章回卷节集部') {
        pattern += '[章回卷节集部]'
      } else {
        pattern += this.escapeRegex(rule.chapterMarker)
      }
    }

    // 附加规则
    if (rule.additionalRules && rule.additionalRules.trim()) {
      const additionalPatterns = rule.additionalRules
        .split('|')
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
        .map((r) => {
          // 如果附加规则不包含行首匹配，添加行首匹配
          if (!r.startsWith('^')) {
            return (rule.allowLeadingSpaces ? '^\\s*' : '^') + r
          }
          return r
        })

      if (additionalPatterns.length > 0) {
        pattern = `(?:${pattern}|${additionalPatterns.join('|')})`
      }
    }

    return new RegExp(pattern, 'm')
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 验证正则表达式
   * @param regex 正则表达式字符串
   * @returns 验证结果
   */
  validateRegex(regex: string): { valid: boolean; error?: string } {
    try {
      new RegExp(regex)
      return { valid: true }
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || '正则表达式语法错误'
      }
    }
  }

  /**
   * 测试正则表达式匹配
   * @param content 文件内容
   * @param regex 正则表达式字符串
   * @returns 匹配到的前 5 个章节标题
   */
  testRegex(content: string, regex: string): string[] {
    try {
      const regExp = new RegExp(regex, 'gm')
      const lines = content.split(/\r?\n/)
      const matches: string[] = []

      for (const line of lines) {
        if (regExp.test(line) && matches.length < 5) {
          matches.push(line.trim())
        }
        if (matches.length >= 5) {
          break
        }
      }

      return matches
    } catch (error: any) {
      throw new Error(`正则表达式测试失败: ${error.message}`)
    }
  }

  /**
   * 统计字数（中文字符数）
   */
  private countWords(text: string): number {
    // 移除空白字符后统计中文字符
    return text.replace(/\s/g, '').replace(/[^\u4e00-\u9fa5]/g, '').length
  }
}

export const chapterParserService = new ChapterParserService()

