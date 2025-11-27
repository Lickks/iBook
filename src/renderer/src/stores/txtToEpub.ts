import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { ChapterRule, Chapter, BookMetadata, ConversionProgress } from '../types/txtToEpub'
import * as txtToEpubApi from '../api/txtToEpub'

/**
 * TXT 转 EPUB Store
 */
export const useTxtToEpubStore = defineStore('txtToEpub', () => {
  // 文件相关
  const filePath = ref<string | null>(null)
  const fileContent = ref<string>('')
  const fileEncoding = ref<string>('utf-8')
  const fileName = ref<string>('')

  // 从 localStorage 加载规则
  function loadChapterRuleFromStorage(): ChapterRule {
    try {
      const saved = localStorage.getItem('txtToEpub_chapterRule')
      if (saved) {
        const rule = JSON.parse(saved) as ChapterRule
        // 如果附加规则为空，自动填入预设值
        if (!rule.additionalRules || rule.additionalRules.trim() === '') {
          rule.additionalRules = '序言|序卷|序[1-9]|序曲|楔子|前言|后记|尾声|番外|最终章'
        }
        return rule
      }
    } catch (error) {
      console.warn('加载保存的规则失败:', error)
    }
    // 默认规则
    return {
      mode: 'simple',
      allowLeadingSpaces: true,
      ordinalPrefix: '第',
      numberType: 'mixed',
      chapterMarker: '章',
      additionalRules: '序言|序卷|序[1-9]|序曲|楔子|前言|后记|尾声|番外|最终章'
    }
  }

  // 章节规则（从 localStorage 加载或使用默认值）
  const chapterRule = ref<ChapterRule>(loadChapterRuleFromStorage())

  // 章节列表
  const chapters = ref<Chapter[]>([])

  // 书籍信息
  const metadata = ref<BookMetadata>({
    title: '',
    language: 'zh-CN'
  })

  // 封面
  const coverImagePath = ref<string | null>(null)
  const processedCoverImagePath = ref<string | null>(null)
  const coverDataUrl = ref<string | null>(null)

  // 转换状态
  const isConverting = ref(false)
  const conversionProgress = ref<ConversionProgress | null>(null)

  // 计算属性
  const totalChapters = computed(() => chapters.value.length)
  const totalWordCount = computed(() => chapters.value.reduce((sum, ch) => sum + ch.wordCount, 0))
  const averageWordCount = computed(() =>
    chapters.value.length > 0 ? Math.round(totalWordCount.value / chapters.value.length) : 0
  )
  const maxWordCount = computed(() =>
    chapters.value.length > 0 ? Math.max(...chapters.value.map((ch) => ch.wordCount)) : 0
  )
  const minWordCount = computed(() =>
    chapters.value.length > 0 ? Math.min(...chapters.value.map((ch) => ch.wordCount)) : 0
  )

  /**
   * 选择 TXT 文件
   */
  async function selectTxtFile(): Promise<void> {
    try {
      const path = await txtToEpubApi.selectTxtFile()
      filePath.value = path

      // 提取文件名
      const pathParts = path.split(/[/\\]/)
      fileName.value = pathParts[pathParts.length - 1] || ''

      // 检测编码
      fileEncoding.value = await txtToEpubApi.detectEncoding(path)

      // 读取文件内容
      fileContent.value = await txtToEpubApi.readFile(path)

      // 自动填充书名（从文件名提取）
      if (!metadata.value.title) {
        const nameWithoutExt = fileName.value.replace(/\.txt$/i, '')
        metadata.value.title = nameWithoutExt
      }

      ElMessage.success('文件加载成功')
    } catch (error: any) {
      ElMessage.error(error.message || '选择文件失败')
      throw error
    }
  }

  /**
   * 解析章节
   */
  async function parseChapters(): Promise<void> {
    if (!fileContent.value) {
      ElMessage.warning('请先选择文件')
      return
    }

    try {
      chapters.value = await txtToEpubApi.parseChapters(fileContent.value, chapterRule.value)
      ElMessage.success(`成功解析 ${chapters.value.length} 个章节`)
    } catch (error: any) {
      ElMessage.error(error.message || '解析章节失败')
      throw error
    }
  }

  /**
   * 验证正则表达式
   */
  async function validateRegex(regex: string): Promise<{ valid: boolean; error?: string }> {
    try {
      return await txtToEpubApi.validateRegex(regex)
    } catch (error: any) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * 测试正则表达式
   */
  async function testRegex(regex: string): Promise<string[]> {
    if (!fileContent.value) {
      return []
    }
    try {
      return await txtToEpubApi.testRegex(fileContent.value, regex)
    } catch (error: any) {
      ElMessage.error(error.message || '测试正则表达式失败')
      return []
    }
  }

  /**
   * 选择封面图片
   */
  async function selectCoverImage(): Promise<void> {
    try {
      const path = await txtToEpubApi.selectCoverImage()
      coverImagePath.value = path

      // 自动处理封面
      await processCoverImage()
    } catch (error: any) {
      if (error.message !== '未选择图片') {
        ElMessage.error(error.message || '选择封面图片失败')
      }
    }
  }

  /**
   * 处理封面图片
   */
  async function processCoverImage(): Promise<void> {
    if (!coverImagePath.value) {
      return
    }

    try {
      const result = await txtToEpubApi.processCoverImage(coverImagePath.value, {
        width: 600,
        height: 800,
        maintainAspectRatio: true,
        quality: 90
      })
      processedCoverImagePath.value = result.filePath
      coverDataUrl.value = result.dataUrl
    } catch (error: any) {
      ElMessage.error(error.message || '处理封面图片失败')
      throw error
    }
  }

  /**
   * 生成 EPUB
   */
  async function generateEpub(): Promise<string> {
    // 过滤掉已删除的章节
    const activeChapters = chapters.value.filter((chapter) => !chapter.deleted)
    
    if (activeChapters.length === 0) {
      throw new Error('请先解析章节')
    }

    if (!metadata.value.title) {
      throw new Error('请填写书名')
    }

    try {
      isConverting.value = true
      conversionProgress.value = {
        step: 'generating',
        progress: 0,
        message: '正在生成 EPUB...'
      }

      const epubPath = await txtToEpubApi.generateEpub(
        activeChapters,
        metadata.value,
        processedCoverImagePath.value || undefined
      )

      conversionProgress.value = {
        step: 'complete',
        progress: 100,
        message: 'EPUB 生成完成'
      }

      return epubPath
    } catch (error: any) {
      ElMessage.error(error.message || '生成 EPUB 失败')
      throw error
    } finally {
      isConverting.value = false
    }
  }

  /**
   * 保存 EPUB 文件
   */
  async function saveEpub(epubPath: string): Promise<string> {
    try {
      const defaultFileName = metadata.value.title
        ? `${metadata.value.title.replace(/[<>:"/\\|?*]/g, '_')}.epub`
        : undefined
      const savedPath = await txtToEpubApi.saveEpub(epubPath, defaultFileName)
      ElMessage.success('EPUB 文件保存成功')
      return savedPath
    } catch (error: any) {
      if (error.message !== '未选择保存位置') {
        ElMessage.error(error.message || '保存 EPUB 失败')
      }
      throw error
    }
  }

  /**
   * 合并章节
   */
  function mergeChapters(selectedIndices: number[]): void {
    if (selectedIndices.length < 2) {
      ElMessage.warning('请至少选择两个章节进行合并')
      return
    }

    const sortedIndices = [...selectedIndices].sort((a, b) => a - b)
    const firstIndex = sortedIndices[0]
    const firstChapter = chapters.value[firstIndex]

    // 合并内容
    const mergedContent = sortedIndices
      .map((idx) => chapters.value[idx].content)
      .join('\n\n')

    // 计算合并后的字数
    const mergedWordCount = sortedIndices.reduce((sum, idx) => sum + chapters.value[idx].wordCount, 0)

    // 更新第一个章节
    firstChapter.content = mergedContent
    firstChapter.wordCount = mergedWordCount
    firstChapter.lineEnd = chapters.value[sortedIndices[sortedIndices.length - 1]].lineEnd

    // 删除其他章节
    for (let i = sortedIndices.length - 1; i > 0; i--) {
      chapters.value.splice(sortedIndices[i], 1)
    }

    // 重新编号
    reindexChapters()

    ElMessage.success('章节合并成功')
  }

  /**
   * 拆分章节
   */
  function splitChapter(chapterIndex: number, splitPosition: number, newTitle: string): void {
    const chapter = chapters.value[chapterIndex]
    const lines = chapter.content.split(/\r?\n/)

    if (splitPosition < 0 || splitPosition >= lines.length) {
      ElMessage.error('分割位置无效')
      return
    }

    // 分割内容
    const firstPart = lines.slice(0, splitPosition).join('\n')
    const secondPart = lines.slice(splitPosition).join('\n')

    // 更新原章节
    chapter.content = firstPart
    chapter.wordCount = countWords(firstPart)

    // 创建新章节
    const newChapter: Chapter = {
      index: chapterIndex + 2,
      title: newTitle || `第 ${chapterIndex + 2} 章`,
      content: secondPart,
      lineStart: chapter.lineStart + splitPosition,
      lineEnd: chapter.lineEnd,
      wordCount: countWords(secondPart)
    }

    // 插入新章节
    chapters.value.splice(chapterIndex + 1, 0, newChapter)

    // 重新编号
    reindexChapters()

    ElMessage.success('章节拆分成功')
  }

  /**
   * 删除章节
   */
  function deleteChapter(chapterIndex: number): void {
    if (chapters.value.length <= 1) {
      ElMessage.warning('至少需要保留一个章节')
      return
    }

    chapters.value.splice(chapterIndex, 1)
    reindexChapters()

    ElMessage.success('章节删除成功')
  }

  /**
   * 编辑章节标题
   */
  function updateChapterTitle(chapterIndex: number, newTitle: string): void {
    if (chapterIndex >= 0 && chapterIndex < chapters.value.length) {
      chapters.value[chapterIndex].title = newTitle
    }
  }

  /**
   * 上移章节
   */
  function moveChapterUp(chapterIndex: number): void {
    if (chapterIndex > 0) {
      const temp = chapters.value[chapterIndex]
      chapters.value[chapterIndex] = chapters.value[chapterIndex - 1]
      chapters.value[chapterIndex - 1] = temp
      reindexChapters()
    }
  }

  /**
   * 下移章节
   */
  function moveChapterDown(chapterIndex: number): void {
    if (chapterIndex < chapters.value.length - 1) {
      const temp = chapters.value[chapterIndex]
      chapters.value[chapterIndex] = chapters.value[chapterIndex + 1]
      chapters.value[chapterIndex + 1] = temp
      reindexChapters()
    }
  }

  /**
   * 重新编号章节
   */
  function reindexChapters(): void {
    chapters.value.forEach((chapter, index) => {
      chapter.index = index + 1
    })
  }

  /**
   * 统计字数（中文字符数）
   */
  function countWords(text: string): number {
    return text.replace(/\s/g, '').replace(/[^\u4e00-\u9fa5]/g, '').length
  }

  /**
   * 更新章节标题（通过 API）
   */
  async function updateChapterTitleApi(chapter: Chapter, newTitle: string): Promise<void> {
    try {
      const updatedChapter = await txtToEpubApi.updateChapterTitle(chapter, newTitle)
      const index = chapters.value.findIndex((ch) => ch.index === chapter.index)
      if (index >= 0) {
        chapters.value[index] = updatedChapter
      }
    } catch (error: any) {
      ElMessage.error(error.message || '更新章节标题失败')
      throw error
    }
  }

  /**
   * 调整章节层级
   */
  async function adjustChapterLevelApi(chapter: Chapter, level: number): Promise<void> {
    try {
      const updatedChapter = await txtToEpubApi.adjustChapterLevel(chapter, level)
      const index = chapters.value.findIndex((ch) => ch.index === chapter.index)
      if (index >= 0) {
        chapters.value[index] = updatedChapter
      }
    } catch (error: any) {
      ElMessage.error(error.message || '调整章节层级失败')
      throw error
    }
  }

  /**
   * 切换章节删除状态
   */
  async function toggleChapterDeletedApi(chapter: Chapter): Promise<void> {
    try {
      const updatedChapter = await txtToEpubApi.toggleChapterDeleted(chapter)
      const index = chapters.value.findIndex((ch) => ch.index === chapter.index)
      if (index >= 0) {
        chapters.value[index] = updatedChapter
      }
    } catch (error: any) {
      ElMessage.error(error.message || '切换章节删除状态失败')
      throw error
    }
  }

  /**
   * 彻底删除章节
   */
  async function deleteChapterApi(chapterIndex: number): Promise<void> {
    try {
      chapters.value = await txtToEpubApi.deleteChapter(chapters.value, chapterIndex)
      ElMessage.success('章节删除成功')
    } catch (error: any) {
      ElMessage.error(error.message || '删除章节失败')
      throw error
    }
  }

  /**
   * 添加新章节
   */
  async function addChapterApi(lineNumber: number, title?: string): Promise<void> {
    try {
      chapters.value = await txtToEpubApi.addChapter(chapters.value, lineNumber, title)
      ElMessage.success('章节添加成功')
    } catch (error: any) {
      ElMessage.error(error.message || '添加章节失败')
      throw error
    }
  }

  /**
   * 标记短章节
   */
  async function markShortChaptersApi(maxLines: number): Promise<void> {
    try {
      chapters.value = await txtToEpubApi.markShortChapters(chapters.value, maxLines)
    } catch (error: any) {
      ElMessage.error(error.message || '标记短章节失败')
      throw error
    }
  }

  /**
   * 保存章节编辑
   */
  async function saveChapterEditsApi(): Promise<void> {
    try {
      chapters.value = await txtToEpubApi.saveChapterEdits(chapters.value)
      ElMessage.success('章节编辑保存成功')
    } catch (error: any) {
      ElMessage.error(error.message || '保存章节编辑失败')
      throw error
    }
  }

  /**
   * 重置状态
   */
  function reset(): void {
    filePath.value = null
    fileContent.value = ''
    fileEncoding.value = 'utf-8'
    fileName.value = ''
    chapters.value = []
    metadata.value = {
      title: '',
      language: 'zh-CN'
    }
    coverImagePath.value = null
    processedCoverImagePath.value = null
    coverDataUrl.value = null
    isConverting.value = false
    conversionProgress.value = null
  }

  return {
    // State
    filePath,
    fileContent,
    fileEncoding,
    fileName,
    chapterRule,
    chapters,
    metadata,
    coverImagePath,
    processedCoverImagePath,
    coverDataUrl,
    isConverting,
    conversionProgress,
    // Computed
    totalChapters,
    totalWordCount,
    averageWordCount,
    maxWordCount,
    minWordCount,
    // Actions
    selectTxtFile,
    parseChapters,
    validateRegex,
    testRegex,
    selectCoverImage,
    processCoverImage,
    generateEpub,
    saveEpub,
    mergeChapters,
    splitChapter,
    deleteChapter,
    updateChapterTitle,
    moveChapterUp,
    moveChapterDown,
    updateChapterTitleApi,
    adjustChapterLevelApi,
    toggleChapterDeletedApi,
    deleteChapterApi,
    addChapterApi,
    markShortChaptersApi,
    saveChapterEditsApi,
    reset
  }
})

