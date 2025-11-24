import axios, {
  AxiosInstance,
  type AxiosResponse,
  type AxiosResponseHeaders,
  type RawAxiosResponseHeaders
} from 'axios'
import * as cheerio from 'cheerio'
import type { Element as DomElement } from 'domhandler'
import iconv from 'iconv-lite'
import type { SearchResult } from '../../renderer/src/types/book'

/**
 * youshu.me 爬虫服务
 * 负责发起检索请求并解析 HTML
 */
class SpiderService {
  private readonly baseUrl = 'https://youshu.me'
  private readonly client: AxiosInstance
  private readonly maxResults = 20
  private readonly requestTimeouts = [10000, 15000, 20000]
  private readonly retryDelay = 500
  private readonly detailLabelMap: Record<'category' | 'platform', string[]> = {
    category: ['作品分类', '作品类别', '小说分类', '小说类别', '作品类型', '小说类型'],
    platform: ['首发网站', '首发站点', '首发平台']
  }

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: this.baseUrl
      },
      responseType: 'arraybuffer',
      validateStatus: (status) => status >= 200 && status < 400
    })
  }

  /**
   * 根据关键词检索 youshu
   */
  async searchYoushu(keyword: string): Promise<SearchResult[]> {
    const trimmed = keyword.trim()
    if (!trimmed) {
      return []
    }

    try {
      const path = `/search/articlename/${encodeURIComponent(trimmed)}/1.html`
      const response = await this.requestWithRetry(path)
      const buffer = Buffer.from(response.data)
      const html = this.decodeHtml(buffer, response.headers)
      const $ = cheerio.load(html)

      const results: SearchResult[] = []
      const rows = $('.c_row').toArray()
      for (const element of rows) {
        const row = $(element)
        const title = row.find('.c_subject a').first().text().replace(/\s+/g, ' ').trim()
        if (!title) continue

        const link = row.find('.c_subject a').first().attr('href') ?? ''
        const coverSrc = row.find('.fl img').attr('src') ?? ''
        const description = row.find('.c_description').text().replace(/\s+/g, ' ').trim()

        const meta = this.extractMeta(row, $)

        const normalizedCover = this.normalizeUrl(coverSrc)

        results.push({
          title,
          author: meta.author || '未知作者',
          cover: this.toProxyImageUrl(normalizedCover),
          platform: meta.platform || undefined,
          category: meta.category || '',
          wordCount: meta.wordCount,
          description: description || '暂无简介',
          sourceUrl: this.normalizeUrl(link)
        })
      }

      return results.slice(0, this.maxResults)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '网络异常'
      throw new Error(`抓取 youshu 数据失败: ${message}`)
    }
  }

  /**
   * 带超时重试的请求封装
   */
  private async requestWithRetry(path: string): Promise<AxiosResponse<ArrayBuffer>> {
    let lastError: unknown
    for (let attempt = 0; attempt < this.requestTimeouts.length; attempt += 1) {
      const timeout = this.requestTimeouts[attempt]
      try {
        return await this.client.get<ArrayBuffer>(path, { timeout })
      } catch (error: unknown) {
        lastError = error
        const shouldRetry =
          this.isRetryableError(error) && attempt < this.requestTimeouts.length - 1
        if (!shouldRetry) {
          throw error
        }
        await this.delay(this.retryDelay * (attempt + 1))
      }
    }
    throw lastError instanceof Error ? lastError : new Error('网络异常')
  }

  private isRetryableError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false
    }
    const retryableCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND']
    return !!error.code && retryableCodes.includes(error.code)
  }

  private async delay(ms: number): Promise<void> {
    return await new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 解析 meta 信息
   */
  private extractMeta(
    row: cheerio.Cheerio<DomElement>,
    $: cheerio.CheerioAPI
  ): {
    author: string
    platform: string
    category: string
    wordCount: number
  } {
    const meta = {
      author: '',
      platform: '',
      category: '',
      wordCount: 0
    }

    row.find('.c_tag').each((_idx, tag) => {
      let currentLabel = ''
      $(tag)
        .children('span')
        .each((_spanIdx, span) => {
          const el = $(span)
          if (el.hasClass('c_label')) {
            currentLabel = this.normalizeLabel(el.text())
          } else if (el.hasClass('c_value')) {
            const value = el.text().replace(/\s+/g, ' ').trim()
            switch (currentLabel) {
              case '作者':
                meta.author = value
                break
              case '类别':
              case '分类':
              case '类型':
              case '题材':
                meta.category = value
                break
              case '来源':
              case '平台':
                meta.platform = value
                break
              case '字数':
                meta.wordCount = this.parseWordCount(value)
                break
              default:
                break
            }
          }
        })
    })

    return meta
  }

  async fetchDetailInfo(sourceUrl: string): Promise<{
    category?: string
    platform?: string
  }> {
    const detailUrl = this.normalizeUrl(sourceUrl)
    if (!detailUrl) {
      throw new Error('sourceUrl 不能为空')
    }

    const response = await this.requestWithRetry(detailUrl)
    const buffer = Buffer.from(response.data)
    const html = this.decodeHtml(buffer, response.headers)
    return this.extractDetailMeta(html)
  }

  private extractDetailMeta(html: string): {
    category?: string
    platform?: string
  } {
    const $ = cheerio.load(html)
    const detailMeta: Partial<{ category: string; platform: string }> = {}
    const selectors = [
      '.bookinfo li',
      '.workinfo li',
      '.book-information li',
      '.book-info li',
      '.bookinfo p',
      '.workinfo p'
    ]

    for (const selector of selectors) {
      $(selector).each((_idx, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim()
        this.assignDetailValue(text, detailMeta)
      })
      if (detailMeta.category && detailMeta.platform) {
        break
      }
    }

    if (!detailMeta.category || !detailMeta.platform) {
      const bodyText = $.root().text().replace(/\s+/g, ' ').trim()
      this.assignDetailValue(bodyText, detailMeta)
    }

    return detailMeta
  }

  private assignDetailValue(text: string, meta: { category?: string; platform?: string }): void {
    const normalized = text.replace(/\s+/g, ' ').trim()
    const mappings = Object.entries(this.detailLabelMap) as Array<
      [keyof typeof this.detailLabelMap, string[]]
    >

    for (const [key, labels] of mappings) {
      if ((key === 'category' && meta.category) || (key === 'platform' && meta.platform)) {
        continue
      }
      for (const label of labels) {
        const regex = new RegExp(`${label}[：:]\\s*([^\\s，。；;|]+)`, 'i')
        const match = regex.exec(normalized)
        if (match?.[1]) {
          if (key === 'category') {
            meta.category = match[1].trim()
          } else {
            meta.platform = match[1].trim()
          }
          break
        }
      }
    }
  }

  /**
   * 标签标准化，去除中英文冒号
   */
  private normalizeLabel(label: string): string {
    return label.replace(/[\s：:]/g, '').trim()
  }

  /**
   * 将 "123456" "123,456" 或 "123.4万" 等形式转换为数字
   */
  private parseWordCount(value: string): number {
    const text = value.replace(/,/g, '').trim()
    if (!text) return 0
    if (text.includes('万')) {
      const num = parseFloat(text.replace(/[^0-9.]/g, ''))
      return Number.isNaN(num) ? 0 : Math.round(num * 10000)
    }
    const digits = text.replace(/[^\d]/g, '')
    return digits ? parseInt(digits, 10) : 0
  }

  /**
   * 将相对链接转换为绝对链接
   */
  private normalizeUrl(value?: string): string {
    if (!value) return ''
    if (value.startsWith('http')) return value
    if (value.startsWith('//')) return `https:${value}`
    if (value.startsWith('/')) return `${this.baseUrl}${value}`
    return `${this.baseUrl}/${value.replace(/^\//, '')}`
  }

  /**
   * 将封面 URL 经过代理，避免跨域盗链限制
   */
  private toProxyImageUrl(value?: string): string {
    if (!value) return ''
    const https = /^https:\/\//i.test(value)
    const sanitized = value.replace(/^https?:\/\//i, '')
    return `https://images.weserv.nl/?url=${https ? 'ssl:' : ''}${sanitized}`
  }

  /**
   * 根据响应头/HTML meta 自动识别编码并解码为 UTF-8 字符串
   */
  private decodeHtml(
    buffer: Buffer,
    headers: AxiosResponseHeaders | RawAxiosResponseHeaders
  ): string {
    const declared = this.extractEncoding(headers['content-type'])
    const metaEncoding = this.sniffMetaEncoding(buffer)
    const candidate = this.normalizeEncoding(declared || metaEncoding || 'gbk')
    try {
      return iconv.decode(buffer, candidate)
    } catch (error) {
      console.warn(`使用编码 ${candidate} 解码失败，自动回退为 utf-8`, error)
      return iconv.decode(buffer, 'utf-8')
    }
  }

  /**
   * 从 Content-Type 中提取 charset
   */
  private extractEncoding(contentType?: string | null): string | undefined {
    if (!contentType) return undefined
    const match = /charset=([\w-]+)/i.exec(contentType)
    return match?.[1]
  }

  /**
   * 扫描 HTML 头部 meta 标签，获取 charset
   */
  private sniffMetaEncoding(buffer: Buffer): string | undefined {
    const snippet = buffer.toString('ascii', 0, Math.min(buffer.length, 2048))
    const match = /charset=["']?([\w-]+)/i.exec(snippet)
    return match?.[1]
  }

  /**
   * 规范化编码名称，兼容 gb2312/gb18030
   */
  private normalizeEncoding(encoding: string): string {
    const lower = encoding.toLowerCase()
    if (lower === 'gb2312' || lower === 'gbk' || lower === 'gb18030') {
      return 'gbk'
    }
    if (lower === 'utf8') {
      return 'utf-8'
    }
    return lower
  }
}

export const spiderService = new SpiderService()
