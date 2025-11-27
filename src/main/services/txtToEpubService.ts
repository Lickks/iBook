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
      // 准备 epub-gen 的选项
      const epubOptions: any = {
        title: options.metadata.title,
        author: options.metadata.author || '未知作者',
        publisher: options.metadata.publisher || '',
        description: options.metadata.description || '',
        lang: options.metadata.language || 'zh-CN',
        content: options.chapters.map((chapter) => ({
          title: chapter.title,
          data: this.generateChapterHtml(chapter)
        })),
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

    // 将文本转换为 HTML，保留段落结构
    const content = escapeHtml(chapter.content)
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
      font-family: "Microsoft YaHei", "SimSun", serif;
      font-size: 1.2em;
      line-height: 1.8;
      margin: 1em;
      padding: 0;
    }
    h1 {
      font-size: 1.5em;
      text-align: center;
      margin: 1em 0;
      font-weight: bold;
    }
    p {
      text-indent: 2em;
      margin: 0.5em 0;
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

