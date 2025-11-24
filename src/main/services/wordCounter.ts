import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import EPub from 'epub'
// @ts-ignore
import pdf from 'pdf-parse'
// @ts-ignore
import mammoth from 'mammoth'
import * as iconv from 'iconv-lite'
import * as jschardet from 'jschardet'

/**
 * 字数统计服务
 * 支持 TXT, EPUB, PDF, DOCX 格式
 */
class WordCounterService {
  /**
   * 统计文件字数
   * @param filePath 文件完整路径
   * @returns 字数
   */
  async countWords(filePath: string): Promise<number> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('文件不存在')
      }

      const ext = path.extname(filePath).toLowerCase()

      switch (ext) {
        case '.txt':
          return await this.countTxtWords(filePath)
        case '.epub':
          return await this.countEpubWords(filePath)
        case '.pdf':
          return await this.countPdfWords(filePath)
        case '.docx':
        case '.doc':
          return await this.countDocxWords(filePath)
        default:
          throw new Error(`不支持的文件格式: ${ext}`)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`字数统计失败: ${message}`)
    }
  }

  /**
   * 统计 TXT 文件字数
   * 支持自动编码检测
   */
  private async countTxtWords(filePath: string): Promise<number> {
    try {
      // 读取文件内容（二进制）
      const buffer = fs.readFileSync(filePath)

      // 检测编码
      const detected = jschardet.detect(buffer)
      const encoding = detected.encoding || 'utf-8'

      // 解码文本
      let text = iconv.decode(buffer, encoding)

      // 统计字数
      return this.calculateWordCount(text)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`TXT 文件解析失败: ${message}`)
    }
  }

  /**
   * 统计 EPUB 文件字数
   */
  private async countEpubWords(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const epub = new EPub(filePath)

        epub.on('error', (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err)
          reject(new Error(`EPUB 解析失败: ${message}`))
        })

        epub.on('end', async () => {
          try {
            const chapters = epub.flow
            let totalText = ''

            // 提取所有章节的文本
            for (const chapter of chapters) {
              const chapterText = await this.getChapterText(epub, chapter.id)
              totalText += chapterText + ' '
            }

            const wordCount = this.calculateWordCount(totalText)
            resolve(wordCount)
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            reject(new Error(`EPUB 文本提取失败: ${message}`))
          }
        })

        epub.parse()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        reject(new Error(`EPUB 文件读取失败: ${message}`))
      }
    })
  }

  /**
   * 获取 EPUB 章节文本
   */
  private getChapterText(epub: any, chapterId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      epub.getChapter(chapterId, (err, text) => {
        if (err) {
          reject(err)
        } else {
          // 移除 HTML 标签
          const cleanText = text.replace(/<[^>]*>/g, '')
          resolve(cleanText)
        }
      })
    })
  }

  /**
   * 统计 PDF 文件字数
   */
  private async countPdfWords(filePath: string): Promise<number> {
    try {
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdf(dataBuffer)

      // 提取文本
      const text = data.text

      return this.calculateWordCount(text)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`PDF 文件解析失败: ${message}`)
    }
  }

  /**
   * 统计 DOCX 文件字数
   */
  private async countDocxWords(filePath: string): Promise<number> {
    try {
      const result = await mammoth.extractRawText({ path: filePath })
      const text = result.value

      return this.calculateWordCount(text)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`DOCX 文件解析失败: ${message}`)
    }
  }

  /**
   * 计算字数
   * 中文按字符数，英文按单词数
   */
  private calculateWordCount(text: string): number {
    if (!text || text.trim().length === 0) {
      return 0
    }

    // 移除多余的空白字符
    text = text.replace(/\s+/g, ' ').trim()

    // 分离中文字符和英文单词
    // 匹配中文字符
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g)
    const chineseCount = chineseChars ? chineseChars.length : 0

    // 移除中文字符后统计英文单词
    const textWithoutChinese = text.replace(/[\u4e00-\u9fa5]/g, ' ')
    const englishWords = textWithoutChinese.match(/[a-zA-Z]+/g)
    const englishCount = englishWords ? englishWords.length : 0

    return chineseCount + englishCount
  }

  /**
   * 获取文件支持的格式列表
   */
  getSupportedFormats(): string[] {
    return ['.txt', '.epub', '.pdf', '.docx', '.doc']
  }

  /**
   * 检查文件格式是否支持
   */
  isFormatSupported(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase()
    return this.getSupportedFormats().includes(ext)
  }
}

// 导出单例
export default new WordCounterService()
