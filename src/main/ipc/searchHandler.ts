import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { spiderService } from '../services/spider'
import { coverService } from '../services/cover'

/**
 * 搜索与爬虫相关的 IPC 处理器
 */
export function setupSearchHandlers(): void {
  /**
   * 从 youshu.me 搜索书籍
   */
  ipcMain.handle('search:youshu', async (_event: IpcMainInvokeEvent, keyword: string) => {
    try {
      if (!keyword || keyword.trim().length === 0) {
        return {
          success: false,
          error: '搜索关键词不能为空'
        }
      }

      const results = await spiderService.searchYoushu(keyword.trim())
      return {
        success: true,
        data: results
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '搜索书籍失败'
      console.error('搜索书籍失败:', error)
      return {
        success: false,
        error: message
      }
    }
  })

  /**
   * 获取 youshu 作品详情补充信息
   */
  ipcMain.handle(
    'search:youshuDetail',
    async (_event: IpcMainInvokeEvent, sourceUrl: string | undefined) => {
      try {
        if (!sourceUrl || !sourceUrl.trim()) {
          return { success: false, error: '作品链接不能为空' }
        }
        const detail = await spiderService.fetchDetailInfo(sourceUrl)
        return {
          success: true,
          data: detail
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '获取作品详情失败'
        console.error('获取 youshu 作品详情失败:', error)
        return {
          success: false,
          error: message
        }
      }
    }
  )

  /**
   * 下载并处理封面
   */
  ipcMain.handle(
    'search:downloadCover',
    async (_event: IpcMainInvokeEvent, payload: { url: string; title?: string }) => {
      try {
        if (!payload?.url) {
          return {
            success: false,
            error: '封面地址不能为空'
          }
        }
        const fileUrl = await coverService.download(payload.url, {
          title: payload.title
        })
        return {
          success: true,
          data: fileUrl
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '下载封面失败'
        console.error('下载封面失败:', error)
        return {
          success: false,
          error: message
        }
      }
    }
  )

  /**
   * 批量搜索书籍（取每个关键词的第一个结果）
   */
  ipcMain.handle(
    'search:batchSearch',
    async (_event: IpcMainInvokeEvent, keywords: string[]) => {
      try {
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          return {
            success: false,
            error: '搜索关键词列表不能为空'
          }
        }

        const results: Array<{
          keyword: string
          success: boolean
          data?: any
          error?: string
        }> = []

        // 串行处理，避免过多并发请求
        for (const keyword of keywords) {
          try {
            const trimmedKeyword = keyword.trim()
            if (!trimmedKeyword) {
              results.push({
                keyword,
                success: false,
                error: '关键词为空'
              })
              continue
            }

            const searchResults = await spiderService.searchYoushu(trimmedKeyword)
            if (searchResults && searchResults.length > 0) {
              results.push({
                keyword,
                success: true,
                data: searchResults[0] // 取第一个结果
              })
            } else {
              results.push({
                keyword,
                success: false,
                error: '未找到搜索结果'
              })
            }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : '搜索失败'
            results.push({
              keyword,
              success: false,
              error: message
            })
          }
        }

        return {
          success: true,
          data: results
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '批量搜索失败'
        console.error('批量搜索失败:', error)
        return {
          success: false,
          error: message
        }
      }
    }
  )

  /**
   * 从电子书文件中提取封面
   */
  ipcMain.handle(
    'ebook:extractCover',
    async (_event: IpcMainInvokeEvent, filePath: string) => {
      try {
        if (!filePath) {
          return {
            success: false,
            error: '文件路径不能为空'
          }
        }
        const coverUrl = await coverService.extractFromEbook(filePath)
        return {
          success: true,
          data: coverUrl
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '提取封面失败'
        console.error('提取电子书封面失败:', error)
        return {
          success: false,
          error: message
        }
      }
    }
  )
}
