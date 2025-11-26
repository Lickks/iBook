<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { ElMessage, ElMessageBox, ElSelect, ElOption } from 'element-plus'
import type { SearchResult, BookInput, Book } from '../types'
import { downloadCover, fetchYoushuDetail, searchYoushu } from '../api/search'
import { filterTitleForSearch, normalizeTitleForComparison } from '../utils'
import * as bookAPI from '../api/book'

// 工具函数：从文件路径提取文件名
function getFileName(filePath: string): string {
  const parts = filePath.split(/[/\\]/)
  return parts[parts.length - 1] || filePath
}

// 工具函数：从文件路径提取扩展名
function getFileExtension(filePath: string): string {
  const fileName = getFileName(filePath)
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.substring(lastDot).toLowerCase() : ''
}

const router = useRouter()
const bookStore = useBookStore()

// 导入方式
const importMode = ref<'titles' | 'files'>('titles')

// 方式1：书名列表
const titleInput = ref('')
const titles = computed(() => {
  return titleInput.value
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
})

// 方式2：文件列表
const selectedFiles = ref<string[]>([])

// 预览数据
interface PreviewItem {
  id: string
  originalTitle: string
  searchKeyword: string
  filePath?: string
  fileName?: string
  ebookCover?: string | null
  searchResult?: SearchResult
  searchError?: string
  selected: boolean
  loading?: boolean
  customSearchResult?: SearchResult | null
  coverSource?: 'auto' | 'ebook' | 'network'
}

// 全局封面选择设置（仅在文件上传模式下生效）
// 默认优先使用网络检索封面，如果没有网络封面则使用电子书封面
const globalCoverSource = ref<'network' | 'ebook'>('network')

// 确保所有预览项都有 customSearchResult 属性
function ensurePreviewItem(item: Partial<PreviewItem>): PreviewItem {
  return {
    id: item.id || '',
    originalTitle: item.originalTitle || '',
    searchKeyword: item.searchKeyword || '',
    filePath: item.filePath,
    fileName: item.fileName,
    ebookCover: item.ebookCover ?? null,
    searchResult: item.searchResult,
    searchError: item.searchError,
    selected: item.selected ?? true,
    loading: item.loading ?? false,
    customSearchResult: item.customSearchResult ?? null,
    coverSource: item.coverSource ?? 'network' // 默认为网络封面
  }
}

const previewItems = ref<PreviewItem[]>([])
const isSearching = ref(false)
const isImporting = ref(false)
const showPreview = ref(false)

// 全选状态
const isAllSelected = computed(() => {
  return previewItems.value.length > 0 && previewItems.value.every((item) => item.selected)
})

// 部分选中状态
const isIndeterminate = computed(() => {
  const selectedCount = previewItems.value.filter((item) => item.selected).length
  return selectedCount > 0 && selectedCount < previewItems.value.length
})

// 只选择检索成功的选项
const onlySelectSuccess = ref(true)

// 获取实际显示的封面URL
// 优先级：网络封面 > 电子书封面 > null（显示书名首字母）
function getDisplayCover(item: PreviewItem): string | null {
  const hasEbook = !!item.ebookCover
  const hasNetwork = !!(item.searchResult?.cover)

  if (!hasEbook && !hasNetwork) return null

  // 确定封面来源优先级
  let source: 'ebook' | 'network'

  // 单本书有明确选择时使用选择的值，否则使用全局设置（默认为 network）
  if (item.coverSource === 'ebook' || item.coverSource === 'network') {
    source = item.coverSource
  } else {
    // 使用全局设置（默认为 network，优先使用网络封面）
    source = globalCoverSource.value
  }

  // 根据用户选择的来源返回封面，如果指定来源没有则自动回退到另一个
  // 默认行为：优先使用网络封面，如果没有网络封面则使用电子书封面
  if (source === 'ebook') {
    // 用户明确选择电子书封面，但如果电子书封面不存在，回退到网络封面
    return item.ebookCover || (item.searchResult?.cover ?? null)
  } else {
    // 用户选择网络封面（或默认），优先网络封面，如果没有则回退到电子书封面
    return (item.searchResult?.cover ?? null) || item.ebookCover || null
  }
}

// 获取实际用于导入的封面URL（考虑下载的封面）
function getImportCover(item: PreviewItem, coverMap: Map<PreviewItem, string>): string | undefined {
  const hasEbook = !!item.ebookCover
  const hasNetwork = !!(item.searchResult?.cover)

  if (!hasEbook && !hasNetwork) return undefined

  // 确定封面来源优先级
  let source: 'ebook' | 'network'

  // 单本书有明确选择时使用选择的值，否则使用全局设置
  if (item.coverSource === 'ebook' || item.coverSource === 'network') {
    source = item.coverSource
  } else {
    // 使用全局设置
    source = globalCoverSource.value
  }

  // 根据来源返回封面，如果指定来源没有则使用另一个
  if (source === 'ebook') {
    return item.ebookCover || coverMap.get(item) || item.searchResult?.cover || undefined
  } else {
    // 网络封面优先使用已下载的，其次使用原始URL
    const networkCover = coverMap.get(item) || item.searchResult?.cover
    return networkCover || item.ebookCover || undefined
  }
}

// 检索成功/失败统计
const searchStats = computed(() => {
  const total = previewItems.value.length
  const success = previewItems.value.filter((item) => item.searchResult && !item.loading).length
  const failed = previewItems.value.filter(
    (item) => !item.searchResult && !item.loading && item.searchError
  ).length
  const loading = previewItems.value.filter((item) => item.loading).length
  return { total, success, failed, loading }
})

// 监听只选择检索成功的选项变化
watch(
  onlySelectSuccess,
  (value) => {
    if (value) {
      // 只选择检索成功的
      previewItems.value.forEach((item) => {
        item.selected = !!(item.searchResult && !item.loading)
      })
    }
  },
  { immediate: true }
)

// 监听搜索结果变化，自动更新选择状态
watch(
  () =>
    previewItems.value.map((item) => ({ hasResult: !!item.searchResult, loading: item.loading })),
  () => {
    if (onlySelectSuccess.value) {
      previewItems.value.forEach((item) => {
        item.selected = !!(item.searchResult && !item.loading)
      })
    }
  },
  { deep: true }
)

// 监听预览界面显示，滚动到页面顶部
watch(
  showPreview,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
  }
)

// 选择文件
async function handleSelectFiles(): Promise<void> {
  try {
    const result = await window.api.document.selectFiles()
    if (result.success && result.data) {
      selectedFiles.value = result.data
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '选择文件失败')
  }
}

// 开始批量检索
async function handleStartSearch(): Promise<void> {
  try {
    if (importMode.value === 'titles') {
      if (titles.value.length === 0) {
        ElMessage.warning('请输入至少一个书名')
        return
      }

      // 创建预览项，立即显示预览界面
      previewItems.value = titles.value.map((title, index) => {
        const searchKeyword = filterTitleForSearch(title)
        if (!searchKeyword) {
          console.warn(`书名 "${title}" 过滤后为空，将使用原始书名进行搜索`)
        }
        return ensurePreviewItem({
          id: `title-${index}`,
          originalTitle: title,
          searchKeyword: searchKeyword || title, // 如果过滤后为空，使用原始书名
          selected: false, // 初始不选择，等待检索结果后根据 onlySelectSuccess 决定
          loading: true // 初始状态为加载中
        })
      })

      // 立即显示预览界面
      showPreview.value = true

      // 开始批量搜索（异步进行，不阻塞界面）
      performBatchSearch()
    } else {
      if (selectedFiles.value.length === 0) {
        ElMessage.warning('请选择至少一个文件')
        return
      }

      // 创建预览项，需要先提取电子书封面和书名
      previewItems.value = []
      isSearching.value = true

      // 立即显示预览界面
      showPreview.value = true

      try {
        for (let i = 0; i < selectedFiles.value.length; i++) {
          const filePath = selectedFiles.value[i]
          const fileName = getFileName(filePath)
          const ext = getFileExtension(filePath)

          // 提取书名（去除扩展名和括号）
          let bookTitle = fileName.replace(/\.[^.]+$/, '')
          const searchKeyword = filterTitleForSearch(bookTitle)

          // 先创建预览项，标记为加载中
          const previewItem = ensurePreviewItem({
            id: `file-${i}`,
            originalTitle: bookTitle,
            searchKeyword,
            filePath,
            fileName,
            ebookCover: null,
            selected: false, // 初始不选择，等待检索结果后根据 onlySelectSuccess 决定
            loading: true
          })

          previewItems.value.push(previewItem)

          // 尝试提取电子书封面（异步进行，不阻塞）
          if (['.epub', '.mobi', '.azw', '.azw3'].includes(ext)) {
            window.api.ebook
              .extractCover(filePath)
              .then((coverResult) => {
                if (coverResult && coverResult.success && coverResult.data) {
                  previewItem.ebookCover = coverResult.data
                  console.log(`成功提取电子书封面: ${fileName}`, coverResult.data)
                } else {
                  console.warn(`提取电子书封面失败（无数据）: ${fileName}`, coverResult)
                }
              })
              .catch((error) => {
                console.error(`提取电子书封面异常: ${fileName}`, error)
              })
          }
        }
      } finally {
        isSearching.value = false
      }

      // 开始批量搜索（异步进行）
      performBatchSearch()
    }
  } catch (error: any) {
    console.error('开始批量检索失败:', error)
    ElMessage.error(error?.message || '开始批量检索失败')
    isSearching.value = false
  }
}

// 执行批量搜索（实时更新）
async function performBatchSearch(): Promise<void> {
  isSearching.value = true

  try {
    const items = previewItems.value.filter((item) => item.searchKeyword)

    // 检查是否有有效的搜索关键词
    if (items.length === 0) {
      ElMessage.warning('没有有效的搜索关键词')
      // 标记所有项为失败
      previewItems.value.forEach((item) => {
        item.loading = false
        item.searchError = '没有有效的搜索关键词'
      })
      return
    }

    // 初始化所有项为加载状态
    items.forEach((item) => {
      item.loading = true
      item.searchResult = undefined
      item.searchError = undefined
    })

    // 并发控制：同时最多8个请求，在速度和避免429之间平衡
    const concurrency = 8
    // 请求间隔：启动新请求前延迟300ms，控制请求频率
    const requestDelay = 300
    const executing: Promise<void>[] = []
    let lastRequestTime = 0

    // 为每个预览项创建搜索任务
    for (const item of items) {
      const task = async () => {
        try {
          const keyword = item.searchKeyword
          if (!keyword || !keyword.trim()) {
            item.loading = false
            item.searchError = '搜索关键词为空'
            return
          }

          const results = await searchYoushu(keyword.trim())

          // 实时更新预览项（立即更新，不等待其他任务）
          if (results && results.length > 0) {
            item.searchResult = results[0] // 取第一个结果
            item.searchError = undefined
          } else {
            item.searchResult = undefined
            item.searchError = '未找到搜索结果'
          }
          item.loading = false
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : '搜索失败'
          item.loading = false
          item.searchResult = undefined
          // 检查是否是429错误
          if (message.includes('429') || message.includes('Too Many Requests')) {
            item.searchError = '请求过于频繁，请稍后重试'
          } else {
            item.searchError = message
          }
        }
      }

      // 控制请求频率：确保相邻请求之间至少有requestDelay间隔
      const now = Date.now()
      const timeSinceLastRequest = now - lastRequestTime
      if (timeSinceLastRequest < requestDelay) {
        await new Promise<void>((resolve) => setTimeout(resolve, requestDelay - timeSinceLastRequest))
      }
      lastRequestTime = Date.now()

      // 创建 Promise，并在完成后从执行队列中移除
      const promise = task().finally(() => {
        const index = executing.indexOf(promise)
        if (index > -1) {
          executing.splice(index, 1)
        }
      })

      executing.push(promise)

      // 如果达到并发限制，等待一个任务完成
      if (executing.length >= concurrency) {
        await Promise.race(executing)
      }
    }

    // 等待所有剩余任务完成
    await Promise.all(executing)

    // 所有任务完成后，检查是否还有未处理的项
    previewItems.value.forEach((item) => {
      if (item.loading) {
        item.loading = false
        if (!item.searchResult) {
          item.searchError = item.searchError || '搜索超时'
        }
      }
    })
  } catch (error: any) {
    console.error('批量搜索错误:', error)
    ElMessage.error(error?.message || '批量搜索失败')
    // 标记所有项为失败
    previewItems.value.forEach((item) => {
      item.loading = false
      if (!item.searchResult) {
        item.searchError = error?.message || '搜索失败'
      }
    })
  } finally {
    isSearching.value = false
  }
}

// 重新搜索对话框相关状态
const reSearchDialog = ref<{
  visible: boolean
  item: PreviewItem | null
  searchKeyword: string
  loading: boolean
  results: SearchResult[]
  error: string
}>({
  visible: false,
  item: null,
  searchKeyword: '',
  loading: false,
  results: [],
  error: ''
})

// 打开重新搜索对话框
function openReSearchDialog(item: PreviewItem): void {
  reSearchDialog.value = {
    visible: true,
    item,
    searchKeyword: item.searchKeyword,
    loading: false,
    results: [],
    error: ''
  }
  // 自动执行一次搜索
  performReSearch()
}

// 执行重新搜索
async function performReSearch(): Promise<void> {
  if (!reSearchDialog.value.searchKeyword.trim() || reSearchDialog.value.loading) return

  reSearchDialog.value.loading = true
  reSearchDialog.value.error = ''
  reSearchDialog.value.results = []

  try {
    const data = await searchYoushu(reSearchDialog.value.searchKeyword.trim())
    reSearchDialog.value.results = data
  } catch (error: any) {
    reSearchDialog.value.error = error?.message || '搜索失败，请稍后重试'
    reSearchDialog.value.results = []
  } finally {
    reSearchDialog.value.loading = false
  }
}

// 关闭重新搜索对话框
function closeReSearchDialog(): void {
  reSearchDialog.value.visible = false
  reSearchDialog.value.item = null
  reSearchDialog.value.searchKeyword = ''
  reSearchDialog.value.results = []
  reSearchDialog.value.error = ''
}

// 选择搜索结果
function handleSelectSearchResult(result: SearchResult): void {
  if (!reSearchDialog.value.item) return

  reSearchDialog.value.item.searchResult = result
  reSearchDialog.value.item.searchError = undefined
  closeReSearchDialog()
  ElMessage.success('已选择搜索结果')
}

// 全选/取消全选
function toggleSelectAll(): void {
  const shouldSelect = !isAllSelected.value
  previewItems.value.forEach((item) => {
    item.selected = shouldSelect
  })
}

// 切换单个选择
function toggleItemSelection(item: PreviewItem): void {
  item.selected = !item.selected
}

// 批量导入
async function handleBatchImport(): Promise<void> {
  const selectedItems = previewItems.value.filter((item) => item.selected)
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要导入的书籍')
    return
  }

  // 确认导入
  try {
    await ElMessageBox.confirm(`确定要导入 ${selectedItems.length} 本书籍吗？`, '确认导入', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
  } catch {
    return
  }

  isImporting.value = true
  let successCount = 0
  let failCount = 0
  let skipCount = 0

  try {
    // 获取所有现有书籍，用于检查重复
    const existingBooks = await bookAPI.getAllBooks()
    const existingBooksMap = new Map<string, Book>()
    existingBooks.forEach((book) => {
      const normalizedTitle = normalizeTitleForComparison(book.title)
      if (normalizedTitle) {
        // 如果已存在相同规范化书名的书籍，保留第一个（或更新为最新的）
        if (!existingBooksMap.has(normalizedTitle)) {
          existingBooksMap.set(normalizedTitle, book)
        }
      }
    })

    // 并行获取所有书籍的详情页信息（提高速度）
    const detailPromises = selectedItems
      .filter((item) => item.searchResult?.sourceUrl)
      .map(async (item) => {
        try {
          const detail = await fetchYoushuDetail(item.searchResult!.sourceUrl!)
          return { item, detail }
        } catch (error) {
          console.warn(`获取作品详情信息失败: ${item.originalTitle}`, error)
          return { item, detail: null }
        }
      })

    // 等待所有详情页获取完成
    const detailResults = await Promise.all(detailPromises)
    const detailMap = new Map<PreviewItem, any>()
    detailResults.forEach(({ item, detail }) => {
      if (detail) {
        detailMap.set(item, detail)
      }
    })

    // 并行下载所有封面（提高速度）
    // 根据用户选择决定需要下载的封面
    const coverPromises = selectedItems
      .filter((item) => {
        if (!item.searchResult?.cover) return false
        // 判断用户选择的封面来源
        let source: 'ebook' | 'network'
        if (item.coverSource && item.coverSource !== 'auto') {
          source = item.coverSource
        } else {
          source = globalCoverSource.value
        }
        // 如果选择网络封面且没有电子书封面，需要下载
        // 或者如果选择电子书但电子书封面不存在，且有网络封面，也下载网络封面作为备选
        return source === 'network' || !item.ebookCover
      })
      .map(async (item) => {
        try {
          const coverUrl = await downloadCover(item.searchResult!.cover!, item.searchResult!.title)
          return { item, coverUrl }
        } catch (error) {
          console.warn('封面下载失败，使用原始链接', error)
          return { item, coverUrl: item.searchResult!.cover }
        }
      })

    // 等待所有封面下载完成
    const coverResults = await Promise.all(coverPromises)
    const coverMap = new Map<PreviewItem, string>()
    coverResults.forEach(({ item, coverUrl }) => {
      coverMap.set(item, coverUrl)
    })

    // 创建书籍（串行，因为需要确保数据库操作的顺序，并且需要用户交互）
    for (const item of selectedItems) {
      try {
        // 检查是否存在同名书籍（使用规范化书名）
        const normalizedTitle = normalizeTitleForComparison(item.originalTitle)
        const existingBook = normalizedTitle ? existingBooksMap.get(normalizedTitle) : null

        if (existingBook) {
          // 存在同名书籍，让用户选择跳过或覆盖
          try {
            const result = await ElMessageBox.confirm(
              `书籍 "${item.originalTitle}" 与已存在的书籍 "${existingBook.title}" 可能是同一本书（已过滤括号内容）。\n\n请选择操作：`,
              '发现重复书籍',
              {
                confirmButtonText: '覆盖',
                cancelButtonText: '跳过',
                distinguishCancelAndClose: true,
                type: 'warning'
              }
            )

            // 用户选择覆盖
            if (result === 'confirm') {
              // 准备书籍数据
              const searchResult = item.searchResult

              let bookInput: BookInput

              if (!searchResult) {
                // 网络检索失败，只使用书名创建书籍
                bookInput = {
                  title: item.originalTitle, // 使用原始书名
                  readingStatus: 'unread'
                }
              } else {
                // 根据用户选择的封面来源获取封面
                const coverUrl = getImportCover(item, coverMap)

                // 获取详细信息（包括完整的简介）
                let platform = searchResult.platform
                let category = searchResult.category
                let description = searchResult.description // 默认使用列表页的简介

                // 使用已获取的详情页信息
                const detail = detailMap.get(item)
                if (detail) {
                  platform = detail.platform || platform
                  category = category || detail.category
                  // 优先使用详情页的完整简介（从"内容介绍"标签页提取）
                  // 只要详情页有简介，就使用详情页的简介（即使列表页也有简介）
                  if (detail.description && detail.description.trim().length > 10) {
                    description = detail.description
                    console.log(
                      `书籍 "${item.originalTitle}" 使用详情页简介，长度: ${description.length}`
                    )
                  } else {
                    console.warn(
                      `书籍 "${item.originalTitle}" 详情页没有提取到简介，使用列表页简介`
                    )
                  }
                }

                // 更新书籍（有完整信息）
                bookInput = {
                  title: item.originalTitle, // 使用原始书名
                  author: searchResult.author,
                  coverUrl,
                  platform,
                  category,
                  description,
                  wordCountDisplay: searchResult.wordCount
                    ? Math.round(searchResult.wordCount / 1000) * 1000
                    : undefined,
                  wordCountSearch: searchResult.wordCount,
                  wordCountSource: 'search',
                  sourceUrl: searchResult.sourceUrl,
                  readingStatus: existingBook.readingStatus || 'unread' // 保留原有阅读状态
                }
              }

              // 更新现有书籍
              try {
                const updatedBook = await bookStore.updateBook(existingBook.id, bookInput)

                // 如果是文件上传方式，上传文件
                if (item.filePath && updatedBook) {
                  try {
                    await window.api.document.upload(item.filePath, updatedBook.id)
                  } catch (error) {
                    console.warn('文件上传失败:', error)
                  }
                }
                successCount++
              } catch (error) {
                console.error(`更新书籍失败: ${item.originalTitle}`, error)
                failCount++
              }
            } else {
              // 用户选择跳过
              skipCount++
            }
          } catch {
            // 用户取消对话框，跳过此书籍
            skipCount++
          }
        } else {
          // 不存在同名书籍，正常创建
          // 准备书籍数据
          const searchResult = item.searchResult

          let bookInput: BookInput

          if (!searchResult) {
            // 网络检索失败，只使用书名创建书籍
            bookInput = {
              title: item.originalTitle, // 使用原始书名
              readingStatus: 'unread'
            }
          } else {
            // 根据用户选择的封面来源获取封面
            const coverUrl = getImportCover(item, coverMap)

            // 获取详细信息（包括完整的简介）
            let platform = searchResult.platform
            let category = searchResult.category
            let description = searchResult.description // 默认使用列表页的简介

            // 使用已获取的详情页信息
            const detail = detailMap.get(item)
            if (detail) {
              platform = detail.platform || platform
              category = category || detail.category
              // 优先使用详情页的完整简介（从"内容介绍"标签页提取）
              // 只要详情页有简介，就使用详情页的简介（即使列表页也有简介）
              if (detail.description && detail.description.trim().length > 10) {
                description = detail.description
                console.log(
                  `书籍 "${item.originalTitle}" 使用详情页简介，长度: ${description.length}`
                )
              } else {
                console.warn(`书籍 "${item.originalTitle}" 详情页没有提取到简介，使用列表页简介`)
              }
            }

            // 创建书籍（有完整信息）
            bookInput = {
              title: item.originalTitle, // 使用原始书名
              author: searchResult.author,
              coverUrl,
              platform,
              category,
              description,
              wordCountDisplay: searchResult.wordCount
                ? Math.round(searchResult.wordCount / 1000) * 1000
                : undefined,
              wordCountSearch: searchResult.wordCount,
              wordCountSource: 'search',
              sourceUrl: searchResult.sourceUrl,
              readingStatus: 'unread'
            }
          }

          try {
            const createdBook = await bookStore.createBook(bookInput)

            // 如果是文件上传方式，上传文件
            if (item.filePath && createdBook) {
              try {
                await window.api.document.upload(item.filePath, createdBook.id)
              } catch (error) {
                console.warn('文件上传失败:', error)
              }
            }

            successCount++
            // 更新已存在书籍映射，避免后续重复检查
            const normalizedTitle = normalizeTitleForComparison(item.originalTitle)
            if (normalizedTitle && createdBook) {
              existingBooksMap.set(normalizedTitle, createdBook)
            }
          } catch (error) {
            console.error(`创建书籍失败: ${item.originalTitle}`, error)
            failCount++
          }
        }
      } catch (error: any) {
        console.error(`导入书籍失败: ${item.originalTitle}`, error)
        failCount++
      }
    }

    // 显示结果
    if (successCount > 0 || skipCount > 0) {
      const messages: string[] = []
      if (successCount > 0) {
        messages.push(`成功导入 ${successCount} 本`)
      }
      if (skipCount > 0) {
        messages.push(`跳过 ${skipCount} 本`)
      }
      if (failCount > 0) {
        messages.push(`失败 ${failCount} 本`)
      }
      ElMessage.success(messages.join('，'))
      // 刷新书籍列表
      await bookStore.fetchBooks()
      // 返回首页
      router.push('/')
    } else {
      ElMessage.error('导入失败，请检查网络连接或重试')
    }
  } finally {
    isImporting.value = false
  }
}

// 格式化字数
function formatWordCount(wordCount?: number): string {
  if (!wordCount) return '未知字数'
  return wordCount >= 10000
    ? `${(wordCount / 10000).toFixed(1)} 万字`
    : `${wordCount.toLocaleString()} 字`
}

// 移除文件
function removeFile(index: number): void {
  selectedFiles.value.splice(index, 1)
}

// 清空
function handleClear(): void {
  titleInput.value = ''
  selectedFiles.value = []
  previewItems.value = []
  showPreview.value = false
}
</script>

<template>
  <section class="page-container batch-import">
    <header class="page-header">
      <div>
        <p class="eyebrow">批量导入</p>
        <h1>批量导入书籍</h1>
        <p class="subtitle">支持通过书名列表或文件上传的方式批量导入书籍</p>
      </div>
    </header>

    <!-- 导入方式切换 -->
    <div class="tab-switcher">
      <button
        type="button"
        :class="['tab-btn', { active: importMode === 'titles' }]"
        @click="importMode = 'titles'"
      >
        书名列表
      </button>
      <button
        type="button"
        :class="['tab-btn', { active: importMode === 'files' }]"
        @click="importMode = 'files'"
      >
        文件上传
      </button>
    </div>

    <!-- 方式1：书名列表 -->
    <div v-if="importMode === 'titles' && !showPreview" class="import-section">
      <div class="input-section">
        <label class="input-label">
          <span>输入书名列表（每行一个书名）</span>
          <small>系统会自动过滤书名中的括号内容用于网络检索</small>
        </label>
        <textarea
          v-model="titleInput"
          class="title-input"
          placeholder="例如：&#10;诡秘之主&#10;斗破苍穹&#10;你好（111）.epub"
          rows="10"
        />
        <div class="input-footer">
          <span class="count">已输入 {{ titles.length }} 个书名</span>
          <button
            type="button"
            class="primary-btn"
            :disabled="titles.length === 0 || isSearching"
            @click="handleStartSearch"
          >
            {{ isSearching ? '检索中...' : '开始检索' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 方式2：文件上传 -->
    <div v-if="importMode === 'files' && !showPreview" class="import-section">
      <div class="file-section">
        <div class="file-upload-area">
          <button type="button" class="upload-btn" @click="handleSelectFiles">选择文件</button>
          <p class="upload-hint">支持 TXT、EPUB、PDF、MOBI、AZW、AZW3、DOC、DOCX 格式</p>
        </div>

        <!-- 操作栏移到上方 -->
        <div v-if="selectedFiles.length > 0" class="file-action-bar">
          <span class="count">已选择 {{ selectedFiles.length }} 个文件</span>
          <button
            type="button"
            class="primary-btn"
            :disabled="selectedFiles.length === 0 || isSearching"
            @click="handleStartSearch"
          >
            {{ isSearching ? '处理中...' : '开始处理' }}
          </button>
        </div>

        <div v-if="selectedFiles.length > 0" class="file-list">
          <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
            <span class="file-name">{{ getFileName(file) }}</span>
            <button type="button" class="remove-btn" @click="removeFile(index)">移除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览界面 -->
    <div v-if="showPreview" class="preview-section">
      <div class="preview-header">
        <h3>预览导入列表</h3>
        <div class="preview-actions">
          <button type="button" class="ghost-btn" @click="handleClear">重新开始</button>
          <button
            type="button"
            class="primary-btn"
            :disabled="isImporting || previewItems.filter((i) => i.selected).length === 0"
            @click="handleBatchImport"
          >
            {{
              isImporting
                ? '导入中...'
                : `确认导入 (${previewItems.filter((i) => i.selected).length})`
            }}
          </button>
        </div>
      </div>

      <div class="preview-controls">
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="toggleSelectAll"
            />
            <span>全选</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="onlySelectSuccess" />
            <span>只选择检索成功</span>
          </label>
          <!-- 全局封面选择（仅文件上传模式） -->
          <div v-if="importMode === 'files'" class="cover-select-wrapper">
            <span class="cover-select-label">全局封面：</span>
            <ElSelect v-model="globalCoverSource" class="cover-select" size="small">
              <ElOption label="优先使用网络检索封面（无网络封面时使用电子书封面）" value="network" />
              <ElOption label="优先使用电子书封面（无电子书封面时使用网络封面）" value="ebook" />
            </ElSelect>
          </div>
        </div>
        <span class="stats">
          共 {{ searchStats.total }} 项，
          <span v-if="searchStats.loading > 0"> 检索中 {{ searchStats.loading }}， </span>
          <span class="success-count">成功 {{ searchStats.success }}</span
          >， <span class="failed-count">失败 {{ searchStats.failed }}</span
          >， 已选择 {{ previewItems.filter((i) => i.selected).length }} 项
        </span>
      </div>

      <div class="preview-list">
        <div
          v-for="item in previewItems"
          :key="item.id"
          class="preview-item"
          :class="{ selected: item.selected }"
        >
          <div class="item-checkbox">
            <input type="checkbox" :checked="item.selected" @change="toggleItemSelection(item)" />
          </div>

          <div class="item-cover-wrapper">
            <div class="item-cover">
              <img
                v-if="getDisplayCover(item)"
                :src="getDisplayCover(item) || ''"
                :alt="item.originalTitle"
              />
              <span v-else>{{ item.originalTitle.slice(0, 1).toUpperCase() }}</span>
            </div>
            <!-- 封面选择器（同时有电子书封面和网络封面时显示） -->
            <div
              v-if="item.ebookCover && item.searchResult?.cover"
              class="cover-selector-btn-wrapper"
            >
              <ElSelect
                v-model="item.coverSource"
                class="item-cover-select-btn"
                size="small"
                placeholder="选择封面"
                @change="() => {}"
              >
                <ElOption label="网络封面" value="network" />
                <ElOption label="电子书封面" value="ebook" />
              </ElSelect>
            </div>
          </div>

          <div class="item-content">
            <div class="item-header">
              <h4>{{ item.originalTitle }}</h4>
              <span v-if="item.fileName" class="file-badge">{{ item.fileName }}</span>
              <span v-if="item.loading" class="loading-badge">
                <span class="loading-dot"></span>
                检索中...
              </span>
            </div>

            <div v-if="item.loading" class="item-loading">
              <p class="loading-text">正在搜索 "{{ item.searchKeyword }}"...</p>
            </div>

            <div v-else-if="item.searchResult" class="item-info">
              <p class="meta">
                <span>{{ item.searchResult.author || '未知作者' }}</span>
                <span class="dot">•</span>
                <span>{{ item.searchResult.category || '未知类型' }}</span>
                <span class="dot">•</span>
                <span>{{ formatWordCount(item.searchResult.wordCount) }}</span>
              </p>
              <p class="desc">{{ item.searchResult.description || '暂无简介' }}</p>
            </div>

            <div v-else-if="item.searchError" class="item-error">
              <p class="error-text">{{ item.searchError }}</p>
            </div>

            <div v-else class="item-empty">
              <p>未找到搜索结果</p>
            </div>
          </div>

          <div class="item-actions">
            <button
              type="button"
              class="action-btn"
              :disabled="item.loading"
              @click="openReSearchDialog(item)"
            >
              {{ item.loading ? '搜索中...' : '重新搜索' }}
            </button>
          </div>

          <!-- 进度指示器 -->
          <div v-if="item.loading" class="item-progress">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
        </div>

        <!-- 重新搜索对话框 -->
        <div v-if="reSearchDialog.visible" class="search-dialog">
          <div class="dialog-backdrop" @click="closeReSearchDialog" />
          <div class="dialog-content large">
            <div class="dialog-header">
              <h4>重新搜索 - {{ reSearchDialog.item?.originalTitle }}</h4>
              <button type="button" class="close-btn" @click="closeReSearchDialog">×</button>
            </div>

            <div class="dialog-search-section">
              <div class="search-input-wrapper">
                <input
                  v-model="reSearchDialog.searchKeyword"
                  type="text"
                  placeholder="输入书名或作者进行搜索"
                  class="search-input"
                  @keyup.enter.prevent="performReSearch"
                />
                <button
                  type="button"
                  class="search-btn"
                  :disabled="reSearchDialog.loading || !reSearchDialog.searchKeyword.trim()"
                  @click="performReSearch"
                >
                  {{ reSearchDialog.loading ? '搜索中...' : '搜索' }}
                </button>
              </div>
            </div>

            <div v-if="reSearchDialog.loading" class="dialog-loading">
              <div class="loader" />
              <p>正在搜索...</p>
            </div>

            <div v-else-if="reSearchDialog.error" class="dialog-error">
              <p>{{ reSearchDialog.error }}</p>
            </div>

            <div
              v-else-if="reSearchDialog.results.length === 0 && reSearchDialog.searchKeyword"
              class="dialog-empty"
            >
              <p>未找到搜索结果，请尝试更换关键词</p>
            </div>

            <div v-else-if="reSearchDialog.results.length > 0" class="dialog-results">
              <p class="results-count">找到 {{ reSearchDialog.results.length }} 个结果，请选择：</p>
              <div class="results-list">
                <div
                  v-for="(result, index) in reSearchDialog.results"
                  :key="index"
                  class="result-item"
                  @click="handleSelectSearchResult(result)"
                >
                  <div class="result-cover">
                    <img
                      v-if="result.cover"
                      :src="result.cover"
                      :alt="result.title"
                      @error="result.cover = ''"
                    />
                    <span v-else>{{ result.title.slice(0, 1).toUpperCase() }}</span>
                  </div>
                  <div class="result-info">
                    <h5>{{ result.title }}</h5>
                    <p class="result-meta">
                      <span>{{ result.author || '未知作者' }}</span>
                      <span class="dot">•</span>
                      <span>{{ result.category || '未知类型' }}</span>
                      <span class="dot">•</span>
                      <span>{{ formatWordCount(result.wordCount) }}</span>
                    </p>
                    <p class="result-desc">{{ result.description || '暂无简介' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="dialog-footer">
              <button type="button" class="ghost-btn" @click="closeReSearchDialog">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.batch-import {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tab-switcher {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 4px;
  background: var(--color-bg-soft);
  gap: 6px;
}

.tab-btn {
  border: none;
  border-radius: 999px;
  padding: 8px 20px;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.tab-btn.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.import-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 45px var(--color-card-shadow);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label span {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

.input-label small {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.title-input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-soft);
  font-family: inherit;
  resize: vertical;
}

.title-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.primary-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover:not(:disabled) {
  background: #0b88e3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-upload-area {
  text-align: center;
  padding: 40px;
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-soft);
}

.upload-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: #0b88e3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.upload-hint {
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-soft);
  border-radius: 8px;
}

.file-name {
  flex: 1;
  color: var(--color-text-primary);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  border: none;
  background: transparent;
  color: var(--color-danger);
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
}

.remove-btn:hover {
  text-decoration: underline;
}

.file-footer,
.file-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-action-bar {
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.preview-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 45px var(--color-card-shadow);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-primary);
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.ghost-btn {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 10px 18px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-weight: 500;
}

.ghost-btn:hover {
  background: var(--color-bg-soft);
}

.preview-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.checkbox-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.stats {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.success-count {
  color: var(--color-success, #10b981);
  font-weight: 500;
}

.failed-count {
  color: var(--color-danger);
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
}

.loader {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-soft);
  transition: all 0.2s ease;
  overflow: hidden;
}

.preview-item.selected {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.item-checkbox {
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
}

.item-cover-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.item-cover {
  width: 80px;
  height: 106px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--color-accent);
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-selector-btn-wrapper {
  width: 80px;
}

.item-cover-select-btn {
  width: 100%;
}

.item-cover-select-btn :deep(.el-select__wrapper) {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 6px;
  padding: 4px 8px;
  min-height: 28px;
}

.item-cover-select-btn :deep(.el-select__wrapper:hover) {
  border-color: var(--color-accent) !important;
}

.item-cover-select-btn :deep(.el-select__placeholder),
.item-cover-select-btn :deep(.el-select__selected-item) {
  color: var(--color-text-secondary) !important;
  font-size: 11px;
  line-height: 1.2;
}

.cover-select-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cover-select-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.cover-select {
  min-width: 160px;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-header h4 {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-badge {
  padding: 2px 8px;
  background: var(--color-bg-muted);
  border-radius: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.loading-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  background: var(--color-accent-soft);
  border-radius: 4px;
  font-size: 11px;
  color: var(--color-accent);
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.item-loading {
  padding: 12px 0;
}

.loading-text {
  color: var(--color-text-secondary);
  font-size: 13px;
  margin: 0;
}

.item-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-bg-soft);
  overflow: hidden;
}

.progress-bar {
  width: 100%;
  height: 100%;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
    transform: translateX(0);
  }
  50% {
    width: 70%;
    transform: translateX(0);
  }
  100% {
    width: 100%;
    transform: translateX(100%);
  }
}

.item-info .meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.dot {
  opacity: 0.6;
}

.desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  max-height: 3em;
  overflow: hidden;
}

.item-error .error-text {
  color: var(--color-danger);
  font-size: 13px;
}

.item-empty {
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.item-actions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.action-btn {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 14px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-dialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.dialog-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  min-width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.dialog-content.large {
  min-width: 600px;
  max-width: 90vw;
  max-height: 85vh;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.dialog-header h4 {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-primary);
}

.close-btn {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-bg-soft);
  color: var(--color-text-primary);
}

.dialog-search-section {
  margin-bottom: 20px;
}

.search-input-wrapper {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-soft);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: #0b88e3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dialog-loading,
.dialog-error,
.dialog-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.dialog-error {
  color: var(--color-danger);
}

.dialog-results {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.results-count {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-bg-soft);
}

.result-item:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.result-cover {
  width: 60px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-accent);
}

.result-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.result-info h5 {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}

.result-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.result-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  border-color: var(--color-accent);
  background: var(--color-bg-soft);
}

.result-cover {
  width: 60px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-accent);
}

.result-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-info h5 {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-primary);
}

.result-info p {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .preview-item {
    flex-direction: column;
  }

  .item-cover {
    width: 100%;
    height: 200px;
  }

  .dialog-content {
    min-width: 90vw;
    padding: 16px;
  }
}
</style>

