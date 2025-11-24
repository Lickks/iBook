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
}
