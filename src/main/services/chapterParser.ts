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
            chapters.push({
              index: chapters.length + 1,
              title: currentChapter.title,
              content: chapterContent,
              lineStart: currentChapter.lineStart,
              lineEnd: lineNumber - 1,
              wordCount: this.countWords(chapterContent)
            })
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
        chapters.push({
          index: chapters.length + 1,
          title: currentChapter.title,
          content: chapterContent,
          lineStart: currentChapter.lineStart,
          lineEnd: lines.length,
          wordCount: this.countWords(chapterContent)
        })
      }

      // 如果没有匹配到任何章节，将整个文件作为单章节
      if (chapters.length === 0) {
        chapters.push({
          index: 1,
          title: '正文',
          content: content,
          lineStart: 1,
          lineEnd: lines.length,
          wordCount: this.countWords(content)
        })
      }

      return chapters
    } catch (error: any) {
      throw new Error(`章节解析失败: ${error.message}`)
    }
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
      pattern += this.escapeRegex(rule.chapterMarker)
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

