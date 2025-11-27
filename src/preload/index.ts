import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { BookInput, DocumentInput, SearchDetail, SearchResult, TagInput } from '../renderer/src/types/book'
import type { BookshelfInput } from '../renderer/src/types/bookshelf'
import type { ApiResponse } from '../renderer/src/types/api'
import type { ChapterRule, Chapter, BookMetadata, ImageProcessOptions } from '../renderer/src/types/txtToEpub'

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
    search: (keyword: string): Promise<ApiResponse> => ipcRenderer.invoke('book:search', keyword),
    getPaginated: (
      page: number,
      pageSize: number,
      filters?: any,
      sort?: any
    ): Promise<ApiResponse> =>
      ipcRenderer.invoke('book:getPaginated', page, pageSize, filters, sort)
  },

  // 文档操作
  document: {
    selectFile: (): Promise<ApiResponse<string>> => ipcRenderer.invoke('document:selectFile'),
    selectFiles: (): Promise<ApiResponse<string[]>> => ipcRenderer.invoke('document:selectFiles'),
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
      ipcRenderer.invoke('search:downloadCover', { url, title }),
    batchSearch: (keywords: string[]): Promise<ApiResponse> =>
      ipcRenderer.invoke('search:batchSearch', keywords)
  },
  // 电子书操作
  ebook: {
    extractCover: (filePath: string): Promise<ApiResponse<string | null>> =>
      ipcRenderer.invoke('ebook:extractCover', filePath)
  },

  // 统计分析操作
  stats: {
    // 获取总体统计数据
    getOverview: (bookshelfId?: number | null): Promise<ApiResponse> => ipcRenderer.invoke('stats:getOverview', bookshelfId),
    // 获取分类统计数据
    getCategoryStats: (bookshelfId?: number | null): Promise<ApiResponse> => ipcRenderer.invoke('stats:getCategoryStats', bookshelfId),
    // 获取平台统计数据
    getPlatformStats: (bookshelfId?: number | null): Promise<ApiResponse> => ipcRenderer.invoke('stats:getPlatformStats', bookshelfId),
    // 获取阅读状态统计数据
    getStatusStats: (bookshelfId?: number | null): Promise<ApiResponse> => ipcRenderer.invoke('stats:getStatusStats', bookshelfId),
    // 获取月度统计数据
    getMonthlyStats: (months?: number, bookshelfId?: number | null): Promise<ApiResponse> =>
      ipcRenderer.invoke('stats:getMonthlyStats', months, bookshelfId),
      // 获取指定年份的统计数据
    getYearlyStats: (year: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('stats:getYearlyStats', year),
    // 重新计算统计数据
    recalculateStats: (): Promise<ApiResponse> =>
      ipcRenderer.invoke('stats:recalculateStats')
  },

  // 标签操作
  tag: {
    create: (input: TagInput): Promise<ApiResponse> => ipcRenderer.invoke('tag:create', input),
    update: (id: number, input: Partial<TagInput>): Promise<ApiResponse> =>
      ipcRenderer.invoke('tag:update', id, input),
    delete: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('tag:delete', id),
    getAll: (): Promise<ApiResponse> => ipcRenderer.invoke('tag:getAll'),
    getById: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('tag:getById', id),
    addToBook: (bookId: number, tagId: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('tag:addToBook', bookId, tagId),
    removeFromBook: (bookId: number, tagId: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('tag:removeFromBook', bookId, tagId),
    getByBookId: (bookId: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('tag:getByBookId', bookId),
    batchAddToBooks: (bookIds: number[], tagId: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('tag:batchAddToBooks', bookIds, tagId),
    getUsageCount: (tagId: number): Promise<ApiResponse<number>> =>
      ipcRenderer.invoke('tag:getUsageCount', tagId)
  },

  // 书架操作
  bookshelf: {
    create: (name: string, description?: string): Promise<ApiResponse> =>
      ipcRenderer.invoke('bookshelf:create', name, description),
    update: (id: number, input: Partial<BookshelfInput>): Promise<ApiResponse> =>
      ipcRenderer.invoke('bookshelf:update', id, input),
    delete: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('bookshelf:delete', id),
    getAll: (): Promise<ApiResponse> => ipcRenderer.invoke('bookshelf:getAll'),
    getById: (id: number): Promise<ApiResponse> => ipcRenderer.invoke('bookshelf:getById', id),
    addBooks: (bookshelfId: number, bookIds: number[]): Promise<ApiResponse> =>
      ipcRenderer.invoke('bookshelf:addBooks', bookshelfId, bookIds),
    removeBooks: (bookshelfId: number, bookIds: number[]): Promise<ApiResponse> =>
      ipcRenderer.invoke('bookshelf:removeBooks', bookshelfId, bookIds),
    getBooks: (bookshelfId: number | null, filters?: any): Promise<ApiResponse> =>
      ipcRenderer.invoke('bookshelf:getBooks', bookshelfId, filters),
    getStats: (bookshelfId: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('bookshelf:getStats', bookshelfId),
    getByBookId: (bookId: number): Promise<ApiResponse> =>
      ipcRenderer.invoke('bookshelf:getByBookId', bookId)
  },

  // 备份操作
  backup: {
    create: (savePath?: string): Promise<ApiResponse<{ path?: string }>> =>
      ipcRenderer.invoke('backup:create', savePath),
    restore: (backupPath?: string): Promise<ApiResponse> =>
      ipcRenderer.invoke('backup:restore', backupPath),
    validate: (backupPath: string): Promise<ApiResponse<{ valid: boolean; metadata?: any; error?: string }>> =>
      ipcRenderer.invoke('backup:validate', backupPath),
    getInfo: (backupPath: string): Promise<ApiResponse> =>
      ipcRenderer.invoke('backup:getInfo', backupPath),
    onProgress: (callback: (progress: any) => void): (() => void) => {
      const handler = (_event: any, progress: any) => callback(progress)
      ipcRenderer.on('backup:progress', handler)
      return () => ipcRenderer.removeListener('backup:progress', handler)
    },
    onRestoreProgress: (callback: (progress: any) => void): (() => void) => {
      const handler = (_event: any, progress: any) => callback(progress)
      ipcRenderer.on('backup:restore-progress', handler)
      return () => ipcRenderer.removeListener('backup:restore-progress', handler)
    },
    onRestoreComplete: (callback: () => void): (() => void) => {
      const handler = () => callback()
      ipcRenderer.on('backup:restore-complete', handler)
      return () => ipcRenderer.removeListener('backup:restore-complete', handler)
    }
  },

  // TXT 转 EPUB 操作
  txtToEpub: {
    selectTxtFile: (): Promise<ApiResponse<string>> => ipcRenderer.invoke('txtToEpub:selectTxtFile'),
    readFile: (filePath: string): Promise<ApiResponse<string>> =>
      ipcRenderer.invoke('txtToEpub:readFile', filePath),
    detectEncoding: (filePath: string): Promise<ApiResponse<string>> =>
      ipcRenderer.invoke('txtToEpub:detectEncoding', filePath),
    parseChapters: (content: string, rule: ChapterRule): Promise<ApiResponse<Chapter[]>> =>
      ipcRenderer.invoke('txtToEpub:parseChapters', content, rule),
    validateRegex: (regex: string): Promise<ApiResponse<{ valid: boolean; error?: string }>> =>
      ipcRenderer.invoke('txtToEpub:validateRegex', regex),
    testRegex: (content: string, regex: string): Promise<ApiResponse<string[]>> =>
      ipcRenderer.invoke('txtToEpub:testRegex', content, regex),
    selectCoverImage: (): Promise<ApiResponse<string>> => ipcRenderer.invoke('txtToEpub:selectCoverImage'),
    processCoverImage: (
      imagePath: string,
      options?: ImageProcessOptions
    ): Promise<ApiResponse<string>> => ipcRenderer.invoke('txtToEpub:processCoverImage', imagePath, options),
    generateEpub: (
      chapters: Chapter[],
      metadata: BookMetadata,
      coverImagePath?: string
    ): Promise<ApiResponse<string>> =>
      ipcRenderer.invoke('txtToEpub:generateEpub', chapters, metadata, coverImagePath),
    saveEpub: (epubPath: string, defaultFileName?: string): Promise<ApiResponse<string>> =>
      ipcRenderer.invoke('txtToEpub:saveEpub', epubPath, defaultFileName),
    // 章节编辑操作
    updateChapterTitle: (chapter: Chapter, newTitle: string): Promise<ApiResponse<Chapter>> =>
      ipcRenderer.invoke('txtToEpub:updateChapterTitle', chapter, newTitle),
    adjustChapterLevel: (chapter: Chapter, level: number): Promise<ApiResponse<Chapter>> =>
      ipcRenderer.invoke('txtToEpub:adjustChapterLevel', chapter, level),
    toggleChapterDeleted: (chapter: Chapter): Promise<ApiResponse<Chapter>> =>
      ipcRenderer.invoke('txtToEpub:toggleChapterDeleted', chapter),
    deleteChapter: (chapters: Chapter[], chapterIndex: number): Promise<ApiResponse<Chapter[]>> =>
      ipcRenderer.invoke('txtToEpub:deleteChapter', chapters, chapterIndex),
    addChapter: (chapters: Chapter[], lineNumber: number, title?: string): Promise<ApiResponse<Chapter[]>> =>
      ipcRenderer.invoke('txtToEpub:addChapter', chapters, lineNumber, title),
    markShortChapters: (chapters: Chapter[], maxLines: number): Promise<ApiResponse<Chapter[]>> =>
      ipcRenderer.invoke('txtToEpub:markShortChapters', chapters, maxLines),
    saveChapterEdits: (chapters: Chapter[]): Promise<ApiResponse<Chapter[]>> =>
      ipcRenderer.invoke('txtToEpub:saveChapterEdits', chapters)
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
