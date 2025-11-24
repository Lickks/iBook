import { ElectronAPI } from '@electron-toolkit/preload'
import type { BookInput, DocumentInput, SearchResult } from '../renderer/src/types/book'
import type { ApiResponse } from '../renderer/src/types/api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      book: {
        create: (input: BookInput) => Promise<ApiResponse>
        update: (id: number, input: Partial<BookInput>) => Promise<ApiResponse>
        delete: (id: number) => Promise<ApiResponse>
        getById: (id: number) => Promise<ApiResponse>
        getAll: () => Promise<ApiResponse>
        search: (keyword: string) => Promise<ApiResponse>
      }
      document: {
        upload: (input: DocumentInput) => Promise<ApiResponse>
        delete: (id: number) => Promise<ApiResponse>
        open: (filePath: string) => Promise<ApiResponse>
        countWords: (filePath: string) => Promise<ApiResponse>
        getByBookId: (bookId: number) => Promise<ApiResponse>
        update: (id: number, input: Partial<DocumentInput>) => Promise<ApiResponse>
      }
      search: {
        youshu: (keyword: string) => Promise<ApiResponse<SearchResult[]>>
      }
    }
  }
}
