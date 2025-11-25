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
import { logger } from '../utils/logger'

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
      maxRedirects: 5, // 允许最多5次重定向
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
  async searchYoushu(keyword: string, retryCount: number = 0): Promise<SearchResult[]> {
    const trimmed = keyword.trim()
    if (!trimmed) {
      return []
    }

    // 防止无限递归
    if (retryCount > 3) {
      logger.warn(`关键词 "${keyword}" 重试次数过多，停止重试`)
      return []
    }

    try {
      const path = `/search/articlename/${encodeURIComponent(trimmed)}/1.html`
      const response = await this.requestWithRetry(path)
      const buffer = Buffer.from(response.data)
      const html = this.decodeHtml(buffer, response.headers)
      const $ = cheerio.load(html)

      // 获取实际请求的URL（可能被重定向到详情页）
      let actualUrl = path
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = response.request as any
        if (request?.res?.responseUrl) {
          actualUrl = request.res.responseUrl
        } else if (request?.res?.request?.res?.responseUrl) {
          actualUrl = request.res.request.res.responseUrl
        } else if (request?.path) {
          actualUrl = request.path
        }
      } catch {
        actualUrl = path
      }

      // 1. 先检查是否是详情页结构（优先判断）
      const isDetailPage = this.isDetailPage($, actualUrl)
      
      if (isDetailPage) {
        // 如果是详情页，直接解析详情页信息
        const detailResult = this.extractDetailPageInfo($, actualUrl)
        if (detailResult) {
          return [detailResult]
        }
        // 如果详情页解析失败，继续尝试列表页解析
        logger.warn('详情页解析失败，尝试解析列表页')
      }

      // 2. 尝试解析列表页
      const results: SearchResult[] = []
      const rows = $('.c_row').toArray()
      
      // 在解析列表页之前，先快速检查：如果只有一个结果，且该结果有简介但缺少作者和字数，
      // 很可能是详情页被误判为列表页，应该先尝试解析详情页
      if (rows.length === 1) {
        const firstRow = $(rows[0])
        const description = firstRow.find('.c_description').text().replace(/\s+/g, ' ').trim()
        const meta = this.extractMeta(firstRow, $)
        const hasDescription = description && description !== '暂无简介' && description.trim().length > 0
        const isUnknownAuthor = !meta.author || meta.author === '未知作者' || meta.author.trim().length === 0
        const isUnknownWordCount = meta.wordCount === 0
        
        // 如果只有一个结果，且该结果有简介但缺少作者和字数，很可能是详情页
        if (hasDescription && isUnknownAuthor && isUnknownWordCount) {
          logger.log(`关键词 "${trimmed}" 检测到单个结果可能是详情页，尝试解析详情页`)
          const detailResult = this.extractDetailPageInfo($, actualUrl)
          if (detailResult) {
            // 如果详情页解析成功，但作者或字数仍然是未知，尝试从整个页面重新提取
            if ((!detailResult.author || detailResult.author === '未知作者') && detailResult.wordCount === 0) {
              // 尝试从整个页面结构提取（可能详情页的结构和列表页类似）
              const fullPageMeta = this.extractMetaFromFullPage($)
              if (fullPageMeta.author) {
                detailResult.author = fullPageMeta.author
              }
              if (fullPageMeta.wordCount > 0) {
                detailResult.wordCount = fullPageMeta.wordCount
              }
              if (fullPageMeta.category) {
                detailResult.category = fullPageMeta.category
              }
              if (fullPageMeta.platform) {
                detailResult.platform = fullPageMeta.platform
              }
            }
            return [detailResult]
          }
        }
      }
      
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

      // 3. 检查列表页结果
      if (results.length > 0) {
        // 优先检查：如果有结果是"未知作者、未知字数、但简介有内容"（说明误解析了详情页内容）
        const hasDetailPageResult = results.some(r => {
          const isUnknownAuthor = !r.author || r.author === '未知作者' || r.author.trim().length === 0
          const isUnknownWordCount = r.wordCount === 0
          const hasDescription = r.description && r.description !== '暂无简介' && r.description.trim().length > 0
          return isUnknownAuthor && isUnknownWordCount && hasDescription
        })

        if (hasDetailPageResult) {
          // 说明误解析了详情页内容，重新解析整个页面作为详情页
          logger.log(`关键词 "${trimmed}" 检测到详情页内容被误解析为列表项，重新解析详情页`)
          const detailResult = this.extractDetailPageInfo($, actualUrl)
          if (detailResult) {
            // 如果详情页解析成功，但作者或字数仍然是未知，尝试从整个页面重新提取
            if ((!detailResult.author || detailResult.author === '未知作者') && detailResult.wordCount === 0) {
              // 尝试从整个页面结构提取（可能详情页的结构和列表页类似）
              const fullPageMeta = this.extractMetaFromFullPage($)
              if (fullPageMeta.author) {
                detailResult.author = fullPageMeta.author
              }
              if (fullPageMeta.wordCount > 0) {
                detailResult.wordCount = fullPageMeta.wordCount
              }
              if (fullPageMeta.category) {
                detailResult.category = fullPageMeta.category
              }
              if (fullPageMeta.platform) {
                detailResult.platform = fullPageMeta.platform
              }
            }
            return [detailResult]
          }
        }

        // 检查是否所有结果都是"未知作者、未知字数、简介为空"（检索失败）
        const allFailed = results.every(r => {
          const isUnknownAuthor = !r.author || r.author === '未知作者' || r.author.trim().length === 0
          const isUnknownWordCount = r.wordCount === 0
          const isEmptyDescription = !r.description || r.description === '暂无简介' || r.description.trim().length === 0
          return isUnknownAuthor && isUnknownWordCount && isEmptyDescription
        })

        if (allFailed) {
          // 检索失败，返回空结果，不需要减字重试
          logger.log(`关键词 "${trimmed}" 检索失败（所有结果都是未知信息且简介为空）`)
          return []
        }

        // 有有效结果，返回
        return results.slice(0, this.maxResults)
      }

      // 4. 如果列表页没有结果
      // 如果之前已经检测过详情页但解析失败，或者没有检测到详情页结构，说明真的没有结果
      // 不进行减字重试，直接返回空结果（避免将"斗罗大陆2"减字成"斗罗大陆"这种错误）
      logger.log(`关键词 "${trimmed}" 未找到搜索结果`)
      return []
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '网络异常'
      throw new Error(`抓取 youshu 数据失败: ${message}`)
    }
  }

  /**
   * 检测是否为详情页
   */
  private isDetailPage($: cheerio.CheerioAPI, url: string): boolean {
    // 检查URL是否包含详情页路径特征
    const detailUrlPatterns = [/\/book\//, /\/work\//, /\/novel\//, /\/article\//, /\/info\//]
    const isDetailUrl = detailUrlPatterns.some(pattern => pattern.test(url))
    
    // 详情页的特征：通常有 .bookinfo, .workinfo, .book-information 等元素
    const hasDetailMarkers = $('.bookinfo, .workinfo, .book-information, .book-info, .work-info').length > 0
    
    // 列表页的特征：有多个 .c_row 元素（通常列表页会有多个结果）
    const listRows = $('.c_row').length
    
    // 如果URL是详情页格式，直接判断为详情页
    if (isDetailUrl) {
      return true
    }
    
    // 如果只有一个列表项，检查其内容特征
    if (listRows === 1) {
      const row = $('.c_row').first()
      const description = row.find('.c_description').text().replace(/\s+/g, ' ').trim()
      const meta = this.extractMeta(row, $)
      const hasDescription = description && description !== '暂无简介' && description.trim().length > 0
      const isUnknownAuthor = !meta.author || meta.author === '未知作者' || meta.author.trim().length === 0
      const isUnknownWordCount = meta.wordCount === 0
      
      // 如果只有一个结果，且该结果有简介但缺少作者和字数，很可能是详情页
      if (hasDescription && isUnknownAuthor && isUnknownWordCount) {
        return true
      }
    }
    
    // 如果有详情页标记，进一步判断
    if (hasDetailMarkers) {
      // 如果列表项很少（0-1个），很可能是详情页
      // 详情页有时也会有一个 .c_row，但通常不会有多个
      if (listRows <= 1) {
        return true
      }
      
      // 如果列表项有多个，但每个结果都是"未知作者、未知字数、有简介"，说明误解析了详情页
      // 这种情况也应该判断为详情页
      const rows = $('.c_row').toArray()
      let detailPageLikeCount = 0
      for (const element of rows.slice(0, 3)) { // 只检查前3个
        const row = $(element)
        const description = row.find('.c_description').text().replace(/\s+/g, ' ').trim()
        const meta = this.extractMeta(row, $)
        const isUnknownAuthor = !meta.author || meta.author === '未知作者' || meta.author.trim().length === 0
        const isUnknownWordCount = meta.wordCount === 0
        const hasDescription = description && description !== '暂无简介' && description.trim().length > 0
        
        if (isUnknownAuthor && isUnknownWordCount && hasDescription) {
          detailPageLikeCount++
        }
      }
      
      // 如果前几个结果都符合详情页特征，判断为详情页
      if (detailPageLikeCount >= Math.min(rows.length, 2)) {
        return true
      }
    }
    
    return false
  }

  /**
   * 从详情页提取完整信息
   * 详情页结构（根据实际HTML）：
   * - 标题：在 <span style="font-size: 20px; font-weight: bold;"> 中
   * - 作者：在标题后的 <span>作者：<a> 中
   * - 封面：在 <a class="book-detail-img"><img> 中
   * - 简介：在第一个 .tabvalue div 中（"内容介绍"标签页）
   * - 作品信息：在第二个 .tabvalue div 的 table 中（"作品信息"标签页）
   *   - 作品分类：在表格的 <td>作品分类：科幻</td> 中
   *   - 首发网站：在表格的 <td>首发网站：起点</td> 中
   *   - 全文字数：在表格的 <td>全文字数：10819600</td> 中
   * - 或者从 .author-item-exp 中提取：起点|科幻|已完结|10819600字
   */
  private extractDetailPageInfo($: cheerio.CheerioAPI, url: string): SearchResult | null {
    try {
      // 1. 提取标题 - 从大号字体span中提取
      let title = ''
      $('span[style*="font-size: 20px"], span[style*="font-size:20px"]').each((_idx, el) => {
        const text = $(el).text().trim()
        if (text && text.length >= 2 && !title) {
          title = text
          return false // 找到后停止
        }
      })
      
      // 如果还没找到，尝试其他选择器
      if (!title || title.length < 2) {
        const titleSelectors = [
          'h1',
          '.book-title',
          '.work-title',
          '.title',
          '.bookname',
          '.workname',
          '.c_subject'
        ]
        
        for (const selector of titleSelectors) {
          title = $(selector).first().text().trim()
          if (title && title.length >= 2) {
            break
          }
        }
      }
      
      // 如果还没找到，从 title 标签提取
      if (!title || title.length < 2) {
        title = $('title').text().trim()
        title = title.split(/[_\-\|]/)[0].trim()
        title = title.replace(/\s*[-_|]\s*.*$/, '').trim()
      }
      
      if (!title || title.length < 2) {
        logger.warn('无法从详情页提取标题')
        return null
      }

      // 2. 提取封面 - 从 .book-detail-img img 中提取
      let coverSrc = ''
      coverSrc = $('.book-detail-img img').first().attr('src') || ''
      
      // 如果还没找到，尝试其他选择器
      if (!coverSrc) {
        const coverSelectors = [
          '.book-cover img',
          '.work-cover img',
          '.cover img',
          '.bookimg img',
          '.bookinfo img',
          '.workinfo img',
          'img[alt*="封面"]',
          'img[alt*="cover"]',
          '.fl img'
        ]
        
        for (const selector of coverSelectors) {
          coverSrc = $(selector).first().attr('src') || ''
          if (coverSrc) {
            break
          }
        }
      }
      
      // 3. 提取作者 - 从标题后的"作者："链接中提取
      let author = ''
      // 查找包含"作者："的span，然后找其中的a标签
      $('span').each((_idx, el) => {
        const text = $(el).text()
        if (text.includes('作者：')) {
          const authorLink = $(el).find('a').first()
          if (authorLink.length) {
            author = authorLink.text().trim()
            return false // 找到后停止
          }
        }
      })
      
      // 如果还没找到，尝试其他方法
      if (!author) {
        author = this.extractAuthorFromDetail($)
      }
      
      // 4. 提取简介 - 从第一个 .tabvalue div 中提取（"内容介绍"标签页）
      let description = ''
      const tabValues = $('.tabcontent .tabvalue').toArray()
      if (tabValues.length > 0) {
        // 第一个 tabvalue 是"内容介绍"标签页
        const introTabValue = $(tabValues[0])
        
        // 根据实际HTML结构，简介在 tabvalue 内部的 div 中
        // 查找第一个包含较长文本的 div（排除包含表格关键词的 div）
        introTabValue.find('div').each((_idx, div) => {
          if (description) return false // 找到后停止
          
          const divText = $(div).text().trim()
          // 如果这个 div 包含较长的文本（可能是简介），且不包含表格标签
          if (divText.length > 50 && 
              !divText.includes('作品分类') && 
              !divText.includes('首发网站') && 
              !divText.includes('全文字数') &&
              !divText.includes('作品性质') &&
              !divText.includes('授权级别') &&
              !divText.includes('连载状态') &&
              !divText.includes('最后更新') &&
              !divText.includes('章节数') &&
              !divText.includes('收藏数') &&
              !divText.includes('点击数') &&
              !divText.includes('推荐数')) {
            description = divText
            return false // 找到后停止
          }
        })
        
        // 如果没找到，直接获取整个 tabvalue 的文本（排除明显的非简介内容）
        if (!description || description.length < 20) {
          const allText = introTabValue.text().trim()
          // 如果文本较长且不包含表格相关关键词，认为是简介
          if (allText.length > 50 && 
              !allText.includes('作品分类') && 
              !allText.includes('首发网站') && 
              !allText.includes('全文字数') &&
              !allText.includes('作品性质') &&
              !allText.includes('授权级别') &&
              !allText.includes('连载状态') &&
              !allText.includes('最后更新') &&
              !allText.includes('章节数') &&
              !allText.includes('收藏数') &&
              !allText.includes('点击数') &&
              !allText.includes('推荐数')) {
            description = allText
          }
        }
        
        // 清理文本
        if (description) {
          description = description.replace(/\s+/g, ' ').trim()
        }
      }
      
      // 如果还没找到，尝试其他选择器
      if (!description || description.length < 20) {
        const descSelectors = [
          '.book-desc',
          '.work-desc',
          '.description',
          '.intro',
          '.bookintro',
          '.c_description',
          'meta[name="description"]'
        ]
        
        for (const selector of descSelectors) {
          if (selector.startsWith('meta')) {
            description = $(selector).attr('content') || ''
          } else {
            description = $(selector).first().text().trim()
          }
          if (description && description.length > 20) {
            break
          }
        }
      }
      
      description = description || '暂无简介'

      // 5. 提取作品信息 - 从第二个 .tabvalue div 的 table 中提取（"作品信息"标签页）
      let category = ''
      let platform = ''
      let wordCount = 0
      
      if (tabValues.length > 1) {
        // 第二个 tabvalue 是"作品信息"
        const infoTable = $(tabValues[1]).find('table')
        if (infoTable.length > 0) {
          // 从表格的 td 中提取信息
          infoTable.find('td').each((_idx, el) => {
            const text = $(el).text().trim()
            
            // 提取作品分类
            if (!category && /作品分类[：:]/.test(text)) {
              const match = text.match(/作品分类[：:]\s*([^\s，。；;|]+)/)
              if (match && match[1]) {
                category = match[1].trim()
              }
            }
            
            // 提取首发网站（平台）
            if (!platform && /首发网站[：:]/.test(text)) {
              const match = text.match(/首发网站[：:]\s*([^\s，。；;|]+)/)
              if (match && match[1]) {
                platform = match[1].trim()
              }
            }
            
            // 提取全文字数
            if (wordCount === 0 && /全文字数[：:]/.test(text)) {
              const match = text.match(/全文字数[：:]\s*([^\s，。；;|]+)/)
              if (match && match[1]) {
                wordCount = this.parseWordCount(match[1])
              }
            }
          })
        }
      }
      
      // 6. 如果从表格中没提取到，尝试从 .author-item-exp 中提取
      // 格式：起点<i class="author-item-line"></i>科幻<i class="author-item-line"></i>已完结<i class="author-item-line"></i>10819600字
      if (!category || !platform || wordCount === 0) {
        const authorItemExpEl = $('.author-item-exp').first()
        if (authorItemExpEl.length > 0) {
          // 获取所有文本节点（不包括子元素的文本）
          // 由于 cheerio 的 text() 会合并所有文本，我们需要手动解析
          const fullText = authorItemExpEl.text().trim()
          
          // 尝试用正则表达式提取：起点 科幻 已完结 10819600字
          // 或者直接查找各个部分
          if (fullText) {
            // 方法1：尝试匹配 "起点 科幻 已完结 10819600字" 这样的格式
            // 由于文本节点被合并，可能是 "起点科幻已完结10819600字" 或 "起点 科幻 已完结 10819600字"
            // 我们需要更智能的解析
            
            // 方法2：直接查找各个子节点
            const children = authorItemExpEl.contents().toArray()
            const parts: string[] = []
            for (const node of children) {
              if (node.type === 'text') {
                const text = $(node).text().trim()
                if (text) {
                  parts.push(text)
                }
              }
            }
            
            // 如果找到了4个部分
            if (parts.length >= 4) {
              if (!platform) {
                platform = parts[0].trim()
              }
              if (!category) {
                category = parts[1].trim()
              }
              if (wordCount === 0) {
                // parts[3] 应该是 "10819600字" 这样的格式
                wordCount = this.parseWordCount(parts[3])
              }
            } else if (fullText) {
              // 如果文本节点被合并了，尝试用正则表达式解析
              // 格式可能是：起点科幻已完结10819600字 或 起点 科幻 已完结 10819600字
              const wordCountMatch = fullText.match(/(\d+)\s*字/)
              if (wordCountMatch && wordCount === 0) {
                wordCount = this.parseWordCount(wordCountMatch[1])
              }
              
              // 尝试提取平台和分类（可能需要根据实际网站结构调整）
              // 如果文本是 "起点科幻已完结10819600字"，我们需要更智能的解析
              // 暂时跳过，因为表格提取应该已经能获取到这些信息
            }
          }
        }
      }
      
      // 7. 如果还没提取到，使用现有的详情页解析方法
      if (!category || !platform) {
        const html = $.html()
        const detailMeta = this.extractDetailMeta(html)
        category = category || detailMeta.category || ''
        platform = platform || detailMeta.platform || ''
      }
      
      // 如果还没提取到字数，尝试其他方法
      if (wordCount === 0) {
        wordCount = this.extractWordCountFromDetail($)
      }
      
      // 8. 最后尝试从全页面提取（作为后备方案）
      const fullPageMeta = this.extractMetaFromFullPage($)
      if (!author) {
        author = fullPageMeta.author || '未知作者'
      }
      if (wordCount === 0) {
        wordCount = fullPageMeta.wordCount || 0
      }
      if (!category) {
        category = fullPageMeta.category || ''
      }
      if (!platform) {
        platform = fullPageMeta.platform || ''
      }

      return {
        title,
        author: author || '未知作者',
        cover: this.toProxyImageUrl(this.normalizeUrl(coverSrc)),
        platform: platform,
        category: category,
        wordCount: wordCount || 0,
        description: description || '暂无简介',
        sourceUrl: this.normalizeUrl(url)
      }
    } catch (error) {
      logger.warn('详情页解析失败:', error)
      return null
    }
  }

  /**
   * 从详情页提取作者信息
   */
  private extractAuthorFromDetail($: cheerio.CheerioAPI): string {
    // 优先使用列表页的提取逻辑（因为详情页可能也使用相同的结构）
    // 尝试从 .c_tag 中提取（复用列表页的提取逻辑）
    let author = ''
    $('.c_tag').each((_idx, tag) => {
      let currentLabel = ''
      $(tag)
        .children('span')
        .each((_spanIdx, span) => {
          const el = $(span)
          if (el.hasClass('c_label')) {
            currentLabel = this.normalizeLabel(el.text())
          } else if (el.hasClass('c_value') && currentLabel === '作者') {
            const value = el.text().replace(/\s+/g, ' ').trim()
            if (value && value.length > 0 && value.length < 50 && value !== '未知作者') {
              author = value
            }
          }
        })
    })
    
    if (author) {
      return author
    }

    // 尝试多种选择器和模式
    const authorSelectors = [
      '.bookinfo .author',
      '.workinfo .author',
      '.bookinfo a[href*="author"]',
      '.workinfo a[href*="author"]',
      '.author-name',
      '.book-author',
      '.work-author',
      'a[href*="/author/"]'
    ]

    for (const selector of authorSelectors) {
      const authorText = $(selector).first().text().trim()
      if (authorText && authorText.length > 0 && authorText.length < 50 && authorText !== '未知作者') {
        // 验证是否是作者名（不包含标签等）
        if (!authorText.includes('：') && !authorText.includes(':')) {
          return authorText
        }
      }
    }

    // 尝试从文本中提取（查找"作者："等模式）
    const text = $('.bookinfo, .workinfo, .c_tag, .book-information, .work-info').text()
    const authorPatterns = [
      /作者[：:]\s*([^\s，。；;|]+)/i,
      /作者[：:]\s*([^\n\r]+?)(?:\s|$)/i,
      /作者\s+([^\s，。；;|]+)/i
    ]
    
    for (const pattern of authorPatterns) {
      const match = pattern.exec(text)
      if (match && match[1]) {
        const extracted = match[1].trim()
        if (extracted.length > 0 && extracted.length < 50 && extracted !== '未知作者') {
          return extracted
        }
      }
    }

    return ''
  }

  /**
   * 从详情页提取字数信息
   */
  private extractWordCountFromDetail($: cheerio.CheerioAPI): number {
    // 优先使用列表页的提取逻辑（因为详情页可能也使用相同的结构）
    // 尝试从 .c_tag 中提取（复用列表页的提取逻辑）
    let wordCount = 0
    $('.c_tag').each((_idx, tag) => {
      let currentLabel = ''
      $(tag)
        .children('span')
        .each((_spanIdx, span) => {
          const el = $(span)
          if (el.hasClass('c_label')) {
            currentLabel = this.normalizeLabel(el.text())
          } else if (el.hasClass('c_value') && currentLabel === '字数') {
            const value = el.text().replace(/\s+/g, ' ').trim()
            const count = this.parseWordCount(value)
            if (count > 0) {
              wordCount = count
            }
          }
        })
    })
    
    if (wordCount > 0) {
      return wordCount
    }

    // 尝试多种选择器
    const wordCountSelectors = [
      '.bookinfo .wordcount',
      '.workinfo .wordcount',
      '.word-count',
      '.book-wordcount',
      '.work-wordcount'
    ]

    for (const selector of wordCountSelectors) {
      const wordCountText = $(selector).first().text().trim()
      if (wordCountText) {
        const count = this.parseWordCount(wordCountText)
        if (count > 0) {
          return count
        }
      }
    }

    // 尝试从文本中提取（查找"字数："等模式）
    const text = $('.bookinfo, .workinfo, .c_tag, .book-information, .work-info').text()
    const wordCountPatterns = [
      /字数[：:]\s*([^\s，。；;|]+)/i,
      /字数[：:]\s*([^\n\r]+?)(?:\s|$)/i,
      /字数\s+([^\s，。；;|]+)/i
    ]
    
    for (const pattern of wordCountPatterns) {
      const match = pattern.exec(text)
      if (match && match[1]) {
        const count = this.parseWordCount(match[1])
        if (count > 0) {
          return count
        }
      }
    }

    return 0
  }

  /**
   * 从整个页面提取 meta 信息（用于详情页解析失败时的补充）
   */
  private extractMetaFromFullPage($: cheerio.CheerioAPI): {
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

    // 1. 优先尝试从所有 .c_tag 中提取（列表页和详情页都可能使用这个结构）
    $('.c_tag').each((_idx, tag) => {
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
                if (!meta.author) {
                  meta.author = value
                }
                break
              case '类别':
              case '分类':
              case '类型':
              case '题材':
                if (!meta.category) {
                  meta.category = value
                }
                break
              case '来源':
              case '平台':
                if (!meta.platform) {
                  meta.platform = value
                }
                break
              case '字数':
                if (meta.wordCount === 0) {
                  meta.wordCount = this.parseWordCount(value)
                }
                break
              default:
                break
            }
          }
        })
    })

    // 2. 如果还没有提取到信息，尝试从详情页的其他结构中提取
    if (!meta.author || meta.wordCount === 0) {
      // 尝试从 .bookinfo, .workinfo 等结构中提取
      const infoText = $('.bookinfo, .workinfo, .book-information, .work-info, .book-info').text()
      
      // 提取作者
      if (!meta.author) {
        const authorPatterns = [
          /作者[：:]\s*([^\s，。；;|]+)/i,
          /作者[：:]\s*([^\n\r]+?)(?:\s|$)/i,
          /作者\s+([^\s，。；;|]+)/i
        ]
        for (const pattern of authorPatterns) {
          const match = pattern.exec(infoText)
          if (match && match[1]) {
            const extracted = match[1].trim()
            if (extracted.length > 0 && extracted.length < 50 && extracted !== '未知作者') {
              meta.author = extracted
              break
            }
          }
        }
      }
      
      // 提取字数
      if (meta.wordCount === 0) {
        const wordCountPatterns = [
          /字数[：:]\s*([^\s，。；;|]+)/i,
          /字数[：:]\s*([^\n\r]+?)(?:\s|$)/i,
          /字数\s+([^\s，。；;|]+)/i
        ]
        for (const pattern of wordCountPatterns) {
          const match = pattern.exec(infoText)
          if (match && match[1]) {
            const count = this.parseWordCount(match[1])
            if (count > 0) {
              meta.wordCount = count
              break
            }
          }
        }
      }
    }

    return meta
  }

  /**
   * 减字重试
   */
  private async retryWithShorterKeyword(originalKeyword: string, retryCount: number): Promise<SearchResult[]> {
    // 移除最后一个字符（考虑中文字符和标点）
    let shorterKeyword = originalKeyword.slice(0, -1)
    
    // 去除末尾的标点符号
    shorterKeyword = shorterKeyword.replace(/[，。、；：！？\s]+$/, '')
    
    if (shorterKeyword.length < 2) {
      // 如果关键词太短，返回空结果
      logger.warn(`关键词 "${originalKeyword}" 缩短后太短，停止重试`)
      return []
    }
    
    logger.log(`关键词 "${originalKeyword}" 搜索结果无效，尝试使用 "${shorterKeyword}" 重新搜索`)
    return await this.searchYoushu(shorterKeyword, retryCount + 1)
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
    description?: string
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
    description?: string
  } {
    const $ = cheerio.load(html)
    const detailMeta: Partial<{ category: string; platform: string; description: string }> = {}
    const tabContent = $('.tabcontent')
    const tabValues = tabContent.find('.tabvalue').toArray()
    
    // 1. 提取简介 - 从"内容介绍"标签页（第一个 .tabvalue div）
    // 根据实际HTML结构：
    // <div class="tabcontent">
    //   <div class="tabvalue" style="height:180px;">
    //     <div style="padding: 3px; ...">简介内容在这里</div>
    //   </div>
    //   <div class="tabvalue" style="display:none;...">作品信息表格</div>
    //   ...
    // </div>
    if (tabContent.length > 0) {
      if (tabValues.length > 0) {
        // 第一个 tabvalue 是"内容介绍"标签页
        const introTabValue = $(tabValues[0])
        
        // 根据实际HTML，简介在 tabvalue 内部的第一个 div 中
        // 直接获取第一个 div 的文本内容
        const introDiv = introTabValue.find('div').first()
        if (introDiv.length > 0) {
          // 获取第一个 div 的文本（根据HTML结构，这就是简介内容）
          let description = introDiv.text().trim()
          
          // 验证：如果包含表格关键词，说明可能提取错了（可能是第二个tabvalue的内容）
          // 但根据HTML结构，第一个tabvalue应该不包含表格
          const hasTableKeywords = description.includes('作品分类') || 
                                   description.includes('首发网站') || 
                                   description.includes('全文字数') ||
                                   description.includes('作品性质') ||
                                   description.includes('授权级别') ||
                                   description.includes('连载状态') ||
                                   description.includes('最后更新') ||
                                   description.includes('章节数') ||
                                   description.includes('收藏数') ||
                                   description.includes('点击数') ||
                                   description.includes('推荐数') ||
                                   description.includes('本书尚无公告')
          
          // 如果包含表格关键词，说明提取错了，尝试获取整个 tabvalue 的文本（排除table）
          if (hasTableKeywords) {
            const allText = introTabValue.clone()
            allText.find('table').remove() // 移除表格
            description = allText.text().trim()
          }
          
          // 只要文本长度大于10，就认为是简介（第一个tabvalue的内容应该是简介）
          // 不需要太多验证，因为根据HTML结构，第一个tabvalue就是"内容介绍"
          if (description && description.length > 10) {
            // 清理文本：去除多余的空白字符
            detailMeta.description = description.replace(/\s+/g, ' ').trim()
            logger.log(`从详情页提取到简介，长度: ${detailMeta.description.length}`)
          } else {
            logger.warn(`从详情页提取简介失败，提取到的文本长度: ${description ? description.length : 0}, 内容预览: ${description ? description.substring(0, 50) : '无'}`)
          }
        } else {
          logger.warn('从详情页提取简介失败，未找到第一个 tabvalue 内部的 div')
        }
      } else {
        logger.warn('从详情页提取简介失败，未找到 tabvalue 元素')
      }
    } else {
      logger.warn('从详情页提取简介失败，未找到 tabcontent 元素')
    }
    
    // 2. 提取作品分类和首发网站 - 从"作品信息"标签页
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

    // 3. 如果还没找到分类和平台，尝试从"作品信息"标签页的表格中提取
    if ((!detailMeta.category || !detailMeta.platform) && tabValues.length > 1) {
      const infoTable = $(tabValues[1]).find('table')
      if (infoTable.length > 0) {
        infoTable.find('td').each((_idx, el) => {
          const text = $(el).text().trim()
          
          // 提取作品分类
          if (!detailMeta.category && /作品分类[：:]/.test(text)) {
            const match = text.match(/作品分类[：:]\s*([^\s，。；;|]+)/)
            if (match && match[1]) {
              detailMeta.category = match[1].trim()
            }
          }
          
          // 提取首发网站（平台）
          if (!detailMeta.platform && /首发网站[：:]/.test(text)) {
            const match = text.match(/首发网站[：:]\s*([^\s，。；;|]+)/)
            if (match && match[1]) {
              detailMeta.platform = match[1].trim()
            }
          }
        })
      }
    }

    if (!detailMeta.category || !detailMeta.platform) {
      const bodyText = $.root().text().replace(/\s+/g, ' ').trim()
      this.assignDetailValue(bodyText, detailMeta)
    }

    return detailMeta
  }

  private assignDetailValue(text: string, meta: { category?: string; platform?: string; description?: string }): void {
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
      logger.warn(`使用编码 ${candidate} 解码失败，自动回退为 utf-8`, error)
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
