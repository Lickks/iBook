import * as fs from 'fs'
import * as path from 'path'
import * as jschardet from 'jschardet'
import * as iconv from 'iconv-lite'
// @ts-ignore
import EPubGen from 'epub-gen'
import type { Chapter, BookMetadata, EpubOptions } from '../../renderer/src/types/txtToEpub'

/**
 * TXT 转 EPUB 服务
 */
class TxtToEpubService {
  /**
   * 读取 TXT 文件
   * @param filePath 文件路径
   * @returns 文件内容
   */
  async readTxtFile(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('文件不存在')
      }

      // 读取文件（二进制）
      const buffer = fs.readFileSync(filePath)

      // 检测编码
      const encoding = await this.detectEncoding(filePath)

      // 解码文本
      const text = iconv.decode(buffer, encoding)

      return text
    } catch (error: any) {
      throw new Error(`读取文件失败: ${error.message}`)
    }
  }

  /**
   * 检测文件编码
   * @param filePath 文件路径
   * @returns 编码名称
   */
  async detectEncoding(filePath: string): Promise<string> {
    try {
      const buffer = fs.readFileSync(filePath)
      const detected = jschardet.detect(buffer)
      const encoding = detected.encoding || 'utf-8'

      // 处理常见的编码别名
      const encodingMap: Record<string, string> = {
        'GB2312': 'gb2312',
        'GBK': 'gbk',
        'GB18030': 'gb18030',
        'UTF-8': 'utf-8',
        'UTF8': 'utf-8',
        'ASCII': 'ascii',
        'ISO-8859-1': 'latin1'
      }

      return encodingMap[encoding.toUpperCase()] || encoding.toLowerCase() || 'utf-8'
    } catch (error: any) {
      // 编码检测失败，使用 UTF-8 作为默认编码
      console.warn('编码检测失败，使用 UTF-8 作为默认编码:', error.message)
      return 'utf-8'
    }
  }

  /**
   * 生成 EPUB 文件
   * @param options EPUB 生成选项
   * @returns 生成的 EPUB 文件路径
   */
  async generateEpub(options: EpubOptions): Promise<string> {
    try {
      const totalChapters = options.chapters.length
      
      // 批量生成章节 HTML（优化性能，使用批量处理）
      const chapterContents = options.chapters.map((chapter) => {
        return {
          title: chapter.title,
          data: this.generateChapterHtml(chapter)
        }
      })

      // 准备 epub-gen 的选项
      const epubOptions: any = {
        title: options.metadata.title,
        author: options.metadata.author || '未知作者',
        publisher: options.metadata.publisher || '',
        description: options.metadata.description || '',
        lang: options.metadata.language || 'zh-CN',
        content: chapterContents,
        output: options.outputPath
      }

      // 添加封面
      if (options.coverImagePath && fs.existsSync(options.coverImagePath)) {
        epubOptions.cover = options.coverImagePath
      }

      // 添加 ISBN
      if (options.metadata.isbn) {
        epubOptions.isbn = options.metadata.isbn
      }

      // 添加出版日期
      if (options.metadata.publishDate) {
        epubOptions.pubdate = options.metadata.publishDate
      }

      // 生成 EPUB
      await new Promise<void>((resolve, reject) => {
        try {
          const epub = new EPubGen(epubOptions)
          epub.promise
            .then(() => {
              resolve()
            })
            .catch((error: Error) => {
              reject(error)
            })
        } catch (error: any) {
          reject(error)
        }
      })

      return options.outputPath
    } catch (error: any) {
      throw new Error(`生成 EPUB 失败: ${error.message}`)
    }
  }

  /**
   * 生成章节 HTML
   * @param chapter 章节信息
   * @returns HTML 字符串
   */
  private generateChapterHtml(chapter: Chapter): string {
    // 转义 HTML 特殊字符
    const escapeHtml = (text: string): string => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }
      return text.replace(/[&<>"']/g, (m) => map[m])
    }

    // 检查章节内容开头是否已经包含标题行，如果包含则移除
    const contentLines = chapter.content.split(/\r?\n/)
    const firstLine = contentLines[0]?.trim() || ''
    const chapterTitle = chapter.title.trim()
    
    // 如果内容第一行与章节标题完全相同，则移除这一行
    // 这样可以避免章节标题行既作为标题又出现在正文中
    let processedContent = chapter.content
    if (firstLine === chapterTitle && contentLines.length > 1) {
      // 移除第一行（标题行）
      processedContent = contentLines.slice(1).join('\n')
    } else if (firstLine === chapterTitle && contentLines.length === 1) {
      // 如果只有一行且是标题，则内容为空
      processedContent = ''
    }

    // 将文本转换为 HTML，保留段落结构
    const content = escapeHtml(processedContent)
      .split(/\r?\n\r?\n/) // 按空行分割段落
      .map((para) => {
        if (para.trim()) {
          // 将单行换行转换为 <br>
          const lines = para.split(/\r?\n/).filter((line) => line.trim())
          return `<p>${lines.join('<br/>')}</p>`
        }
        return ''
      })
      .filter((para) => para)
      .join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeHtml(chapter.title)}</title>
  <style type="text/css">
    body {
      font-family: "Microsoft YaHei", "SimHei", "SimSun", "STSong", "STKaiti", "KaiTi", serif;
      font-size: 1.1em;
      line-height: 2.0;
      margin: 0;
      padding: 1.5em 1.2em;
      color: #333;
      background-color: #fff;
      max-width: 100%;
      word-wrap: break-word;
      word-break: break-all;
    }
    h1 {
      font-size: 1.6em;
      text-align: center;
      margin: 1.5em 0 1.2em 0;
      font-weight: bold;
      color: #2c3e50;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 0.8em;
    }
    p {
      text-indent: 2em;
      margin: 0.8em 0;
      text-align: justify;
      letter-spacing: 0.05em;
    }
    p:first-of-type {
      margin-top: 1.2em;
    }
    p:last-of-type {
      margin-bottom: 1.5em;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(chapter.title)}</h1>
  ${content}
</body>
</html>`
  }
}

export const txtToEpubService = new TxtToEpubService()

