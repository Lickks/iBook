import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { BookInput, DocumentInput, SearchDetail, SearchResult } from '../renderer/src/types/book'
import type { ApiResponse } from '../renderer/src/types/api'

// Custom APIs for renderer
const api = {
  // 书籍操作
  book: {
    create: (input: BookInput): Promise<ApiResponse> => ipcRenderer.invoke('book:create', input),
    update: (id: number, input: Partial<BookInput>): Promise<ApiResponse> =>
      ipcRenderer.invoke('book:update', id, input),
    delete: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('book:delete', id),
    deleteBatch: (ids: number[]): Promise<ApiResponse> =>
      ipcRenderer.invoke('book:deleteBatch', ids),
    getById: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('book:getById', id),
    getAll: (): Promise<ApiResponse> => ipcRenderer.invoke('book:getAll'),
    search: (keyword: string): Promise<ApiResponse> => ipcRenderer.invoke('book:search', keyword)
  },

  // 文档操作
  document: {
    selectFile: (): Promise<ApiResponse<string>> => ipcRenderer.invoke('document:selectFile'),
    upload: (filePath: string, bookId: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('document:upload', filePath, bookId),
    delete: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('document:delete', id),
    open: (fileName: string): Promise<ApiResponse> => ipcRenderer.invoke('document:open', fileName),
    countWords: (fileName: string): Promise<ApiResponse<number>> =>
      ipcRenderer.invoke('document:countWords', fileName),
    getByBookId: (bookId: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('document:getByBookId', bookId),
    update: (id: number, input: Partial<DocumentInput>): Promise<ApiResponse> =>
      ipcRenderer.invoke('document:update', id, input)
  },

  // 搜索操作
  search: {
    youshu: (keyword: string): Promise<ApiResponse<SearchResult[]>> =>
      ipcRenderer.invoke('search:youshu', keyword),
    detail: (sourceUrl: string): Promise<ApiResponse<SearchDetail>> =>
      ipcRenderer.invoke('search:youshuDetail', sourceUrl),
    downloadCover: (url: string, title?: string): Promise<ApiResponse<string>> =>
      ipcRenderer.invoke('search:downloadCover', { url, title })
  },

  // 统计分析操作
  stats: {
    // 获取总体统计数据
    getOverview: (): Promise<ApiResponse> => ipcRenderer.invoke('stats:getOverview'),
    // 获取分类统计数据
    getCategoryStats: (): Promise<ApiResponse> => ipcRenderer.invoke('stats:getCategoryStats'),
    // 获取平台统计数据
    getPlatformStats: (): Promise<ApiResponse> => ipcRenderer.invoke('stats:getPlatformStats'),
    // 获取阅读状态统计数据
    getStatusStats: (): Promise<ApiResponse> => ipcRenderer.invoke('stats:getStatusStats'),
    // 获取月度统计数据
    getMonthlyStats: (months?: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('stats:getMonthlyStats', months),
      // 获取指定年份的统计数据
    getYearlyStats: (year: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('stats:getYearlyStats', year),
    // 重新计算统计数据
    recalculateStats: (): Promise<ApiResponse> =>
      ipcRenderer.invoke('stats:recalculateStats')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
