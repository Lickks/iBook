import { ipcMain, IpcMainInvokeEvent, dialog, nativeImage } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { chapterParserService } from '../services/chapterParser'
import { chapterEditorService } from '../services/chapterEditor'
import { txtToEpubService } from '../services/txtToEpubService'
import type { ChapterRule, Chapter, BookMetadata, EpubOptions, ImageProcessOptions } from '../../renderer/src/types/txtToEpub'

/**
 * TXT 转 EPUB 相关的 IPC 处理器
 */
export function setupTxtToEpubHandlers(): void {
  /**
   * 选择 TXT 文件
   */
  ipcMain.handle('txtToEpub:selectTxtFile', async (_event: IpcMainInvokeEvent) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: '文本文件', extensions: ['txt'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: '未选择文件' }
      }

      return { success: true, data: result.filePaths[0] }
    } catch (error: any) {
      console.error('选择文件失败:', error)
      return {
        success: false,
        error: error?.message || '选择文件失败'
      }
    }
  })

  /**
   * 读取文件内容
   */
  ipcMain.handle('txtToEpub:readFile', async (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      const content = await txtToEpubService.readTxtFile(filePath)
      return { success: true, data: content }
    } catch (error: any) {
      console.error('读取文件失败:', error)
      return {
        success: false,
        error: error?.message || '读取文件失败'
      }
    }
  })

  /**
   * 检测文件编码
   */
  ipcMain.handle('txtToEpub:detectEncoding', async (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      const encoding = await txtToEpubService.detectEncoding(filePath)
      return { success: true, data: encoding }
    } catch (error: any) {
      console.error('检测编码失败:', error)
      return {
        success: false,
        error: error?.message || '检测编码失败'
      }
    }
  })

  /**
   * 解析章节
   */
  ipcMain.handle(
    'txtToEpub:parseChapters',
    async (_event: IpcMainInvokeEvent, content: string, rule: any) => {
      try {
        // 确保规则对象是纯对象，不包含任何不可序列化的内容
        // 确保规则对象是纯对象，不包含任何不可序列化的内容
        const cleanRule: ChapterRule = {
          mode: rule.mode || 'simple',
          allowLeadingSpaces: rule.allowLeadingSpaces,
          ordinalPrefix: rule.ordinalPrefix,
          numberType: rule.numberType,
          chapterMarker: rule.chapterMarker,
          additionalRules: rule.additionalRules,
          regex: rule.regex
        }
        const chapters = chapterParserService.parseChapters(content, cleanRule)
        
        // 确保返回的章节数据完全可序列化（移除 selected 等临时属性）
        const serializableChapters = chapters.map((chapter) => ({
          index: chapter.index,
          title: chapter.title,
          content: chapter.content,
          lineStart: chapter.lineStart,
          lineEnd: chapter.lineEnd,
          wordCount: chapter.wordCount
        }))
        
        return { success: true, data: serializableChapters }
      } catch (error: any) {
        console.error('解析章节失败:', error)
        return {
          success: false,
          error: error?.message || '解析章节失败'
        }
      }
    }
  )

  /**
   * 验证正则表达式
   */
  ipcMain.handle('txtToEpub:validateRegex', async (_event: IpcMainInvokeEvent, regex: string) => {
    try {
      const result = chapterParserService.validateRegex(regex)
      return { success: true, data: result }
    } catch (error: any) {
      console.error('验证正则表达式失败:', error)
      return {
        success: false,
        error: error?.message || '验证正则表达式失败'
      }
    }
  })

  /**
   * 测试正则表达式
   */
  ipcMain.handle(
    'txtToEpub:testRegex',
    async (_event: IpcMainInvokeEvent, content: string, regex: string) => {
      try {
        const matches = chapterParserService.testRegex(content, regex)
        return { success: true, data: matches }
      } catch (error: any) {
        console.error('测试正则表达式失败:', error)
        return {
          success: false,
          error: error?.message || '测试正则表达式失败'
        }
      }
    }
  )

  /**
   * 选择封面图片
   */
  ipcMain.handle('txtToEpub:selectCoverImage', async (_event: IpcMainInvokeEvent) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: '未选择图片' }
      }

      return { success: true, data: result.filePaths[0] }
    } catch (error: any) {
      console.error('选择封面图片失败:', error)
      return {
        success: false,
        error: error?.message || '选择封面图片失败'
      }
    }
  })

  /**
   * 处理封面图片（压缩、裁剪等）
   * 使用 Electron 的 nativeImage API，无需额外依赖
   */
  ipcMain.handle(
    'txtToEpub:processCoverImage',
    async (
      _event: IpcMainInvokeEvent,
      imagePath: string,
      options?: ImageProcessOptions
    ) => {
      try {
        if (!fs.existsSync(imagePath)) {
          throw new Error('图片文件不存在')
        }

        // 使用 Electron 的 nativeImage 读取图片
        const image = nativeImage.createFromPath(imagePath)
        if (image.isEmpty()) {
          throw new Error('无法读取图片文件')
        }

        // 获取原始尺寸
        const originalSize = image.getSize()
        const originalWidth = originalSize.width
        const originalHeight = originalSize.height

        // 处理选项
        const targetWidth = options?.width || 600
        const targetHeight = options?.height || 800
        const maintainAspectRatio = options?.maintainAspectRatio !== false
        const quality = options?.quality || 90

        // 计算目标尺寸
        let finalWidth = targetWidth
        let finalHeight = targetHeight

        if (maintainAspectRatio) {
          // 保持宽高比，计算合适的尺寸
          const originalRatio = originalWidth / originalHeight
          const targetRatio = targetWidth / targetHeight

          if (originalRatio > targetRatio) {
            // 原图更宽，以宽度为准（可能会超出高度，但保持宽高比）
            finalWidth = targetWidth
            finalHeight = Math.round(targetWidth / originalRatio)
          } else {
            // 原图更高，以高度为准（可能会超出宽度，但保持宽高比）
            finalHeight = targetHeight
            finalWidth = Math.round(targetHeight * originalRatio)
          }
        }

        // 调整图片尺寸
        // nativeImage.resize() 接受一个对象，包含 width 和 height
        const finalImage = image.resize({
          width: finalWidth,
          height: finalHeight
        })

        // 将图片转换为 base64 数据 URL，以便在渲染进程中安全使用
        // 这样就不需要文件路径，避免了 CSP 限制
        const ext = path.extname(imagePath).toLowerCase()
        
        // nativeImage 的 toPNG() 和 toJPEG() 返回 Buffer
        let imageBuffer: Buffer
        let mimeType: string
        
        if (ext === '.png') {
          imageBuffer = finalImage.toPNG()
          mimeType = 'image/png'
        } else {
          // toJPEG() 接受质量参数（0-100）
          imageBuffer = finalImage.toJPEG(Math.round(quality))
          mimeType = 'image/jpeg'
        }

        // 转换为 base64 数据 URL
        const base64 = imageBuffer.toString('base64')
        const dataUrl = `data:${mimeType};base64,${base64}`

        // 同时保存文件到临时目录，供 EPUB 生成时使用
        const tempDir = path.join(require('os').tmpdir(), 'ibook-epub-covers')
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true })
        }
        const outputPath = path.join(tempDir, `cover_${Date.now()}${ext === '.png' ? '.png' : '.jpg'}`)
        fs.writeFileSync(outputPath, imageBuffer)

        // 返回数据 URL 和文件路径（文件路径用于 EPUB 生成）
        return { success: true, data: { dataUrl, filePath: outputPath } }
      } catch (error: any) {
        console.error('处理封面图片失败:', error)
        return {
          success: false,
          error: error?.message || '处理封面图片失败'
        }
      }
    }
  )

  /**
   * 生成 EPUB 文件
   */
  ipcMain.handle(
    'txtToEpub:generateEpub',
    async (
      _event: IpcMainInvokeEvent,
      chapters: any,
      metadata: any,
      coverImagePath?: string
    ) => {
      try {
        // 确保接收到的数据是完全可序列化的纯对象
        const cleanChapters: Chapter[] = chapters.map((chapter: any) => ({
          index: Number(chapter.index),
          title: String(chapter.title || ''),
          content: String(chapter.content || ''),
          lineStart: Number(chapter.lineStart || 1),
          lineEnd: Number(chapter.lineEnd || 1),
          wordCount: Number(chapter.wordCount || 0)
        }))

        const cleanMetadata: BookMetadata = {
          title: String(metadata.title || ''),
          author: metadata.author ? String(metadata.author) : undefined,
          description: metadata.description ? String(metadata.description) : undefined,
          publisher: metadata.publisher ? String(metadata.publisher) : undefined,
          isbn: metadata.isbn ? String(metadata.isbn) : undefined,
          publishDate: metadata.publishDate ? String(metadata.publishDate) : undefined,
          language: metadata.language ? String(metadata.language) : 'zh-CN',
          tags: metadata.tags && Array.isArray(metadata.tags)
            ? metadata.tags.map((tag: any) => String(tag))
            : undefined
        }

        // 生成临时文件路径
        const tempDir = path.join(require('os').tmpdir(), 'ibook-epub-output')
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true })
        }

        const safeTitle = cleanMetadata.title.replace(/[<>:"/\\|?*]/g, '_')
        const outputPath = path.join(tempDir, `${safeTitle}_${Date.now()}.epub`)

        const epubOptions: EpubOptions = {
          chapters: cleanChapters,
          metadata: cleanMetadata,
          coverImagePath,
          outputPath
        }

        await txtToEpubService.generateEpub(epubOptions)

        return { success: true, data: outputPath }
      } catch (error: any) {
        console.error('生成 EPUB 失败:', error)
        return {
          success: false,
          error: error?.message || '生成 EPUB 失败'
        }
      }
    }
  )

  /**
   * 保存 EPUB 文件（文件保存对话框）
   */
  ipcMain.handle(
    'txtToEpub:saveEpub',
    async (_event: IpcMainInvokeEvent, epubPath: string, defaultFileName?: string) => {
      try {
        if (!fs.existsSync(epubPath)) {
          return { success: false, error: 'EPUB 文件不存在' }
        }

        const result = await dialog.showSaveDialog({
          defaultPath: defaultFileName || path.basename(epubPath),
          filters: [
            { name: 'EPUB 文件', extensions: ['epub'] },
            { name: '所有文件', extensions: ['*'] }
          ]
        })

        if (result.canceled || !result.filePath) {
          return { success: false, error: '未选择保存位置' }
        }

        // 复制文件到目标位置
        fs.copyFileSync(epubPath, result.filePath)

        return { success: true, data: result.filePath }
      } catch (error: any) {
        console.error('保存 EPUB 失败:', error)
        return {
          success: false,
          error: error?.message || '保存 EPUB 失败'
        }
      }
    }
  )

  /**
   * 更新章节标题
   */
  ipcMain.handle(
    'txtToEpub:updateChapterTitle',
    async (_event: IpcMainInvokeEvent, chapter: any, newTitle: string) => {
      try {
        const cleanChapter: Chapter = {
          index: Number(chapter.index || 1),
          title: String(chapter.title || ''),
          content: String(chapter.content || ''),
          lineStart: Number(chapter.lineStart || 1),
          lineEnd: Number(chapter.lineEnd || 1),
          wordCount: Number(chapter.wordCount || 0),
          level: chapter.level !== undefined ? Number(chapter.level) : 0,
          deleted: Boolean(chapter.deleted),
          isShortChapter: Boolean(chapter.isShortChapter)
        }
        const updatedChapter = chapterEditorService.updateChapterTitle(cleanChapter, newTitle)
        return { success: true, data: updatedChapter }
      } catch (error: any) {
        console.error('更新章节标题失败:', error)
        return {
          success: false,
          error: error?.message || '更新章节标题失败'
        }
      }
    }
  )

  /**
   * 调整章节层级
   */
  ipcMain.handle(
    'txtToEpub:adjustChapterLevel',
    async (_event: IpcMainInvokeEvent, chapter: any, level: number) => {
      try {
        const cleanChapter: Chapter = {
          index: Number(chapter.index || 1),
          title: String(chapter.title || ''),
          content: String(chapter.content || ''),
          lineStart: Number(chapter.lineStart || 1),
          lineEnd: Number(chapter.lineEnd || 1),
          wordCount: Number(chapter.wordCount || 0),
          level: chapter.level !== undefined ? Number(chapter.level) : 0,
          deleted: Boolean(chapter.deleted),
          isShortChapter: Boolean(chapter.isShortChapter)
        }
        const updatedChapter = chapterEditorService.adjustChapterLevel(cleanChapter, level)
        return { success: true, data: updatedChapter }
      } catch (error: any) {
        console.error('调整章节层级失败:', error)
        return {
          success: false,
          error: error?.message || '调整章节层级失败'
        }
      }
    }
  )

  /**
   * 切换章节删除状态
   */
  ipcMain.handle(
    'txtToEpub:toggleChapterDeleted',
    async (_event: IpcMainInvokeEvent, chapter: any) => {
      try {
        const cleanChapter: Chapter = {
          index: Number(chapter.index || 1),
          title: String(chapter.title || ''),
          content: String(chapter.content || ''),
          lineStart: Number(chapter.lineStart || 1),
          lineEnd: Number(chapter.lineEnd || 1),
          wordCount: Number(chapter.wordCount || 0),
          level: chapter.level !== undefined ? Number(chapter.level) : 0,
          deleted: Boolean(chapter.deleted),
          isShortChapter: Boolean(chapter.isShortChapter)
        }
        const updatedChapter = chapterEditorService.toggleChapterDeleted(cleanChapter)
        return { success: true, data: updatedChapter }
      } catch (error: any) {
        console.error('切换章节删除状态失败:', error)
        return {
          success: false,
          error: error?.message || '切换章节删除状态失败'
        }
      }
    }
  )

  /**
   * 彻底删除章节
   */
  ipcMain.handle(
    'txtToEpub:deleteChapter',
    async (_event: IpcMainInvokeEvent, chapters: any[], chapterIndex: number) => {
      try {
        const cleanChapters: Chapter[] = chapters.map((chapter: any) => ({
          index: Number(chapter.index || 1),
          title: String(chapter.title || ''),
          content: String(chapter.content || ''),
          lineStart: Number(chapter.lineStart || 1),
          lineEnd: Number(chapter.lineEnd || 1),
          wordCount: Number(chapter.wordCount || 0),
          level: chapter.level !== undefined ? Number(chapter.level) : 0,
          deleted: Boolean(chapter.deleted),
          isShortChapter: Boolean(chapter.isShortChapter)
        }))
        const updatedChapters = chapterEditorService.deleteChapter(cleanChapters, chapterIndex)
        return { success: true, data: updatedChapters }
      } catch (error: any) {
        console.error('删除章节失败:', error)
        return {
          success: false,
          error: error?.message || '删除章节失败'
        }
      }
    }
  )

  /**
   * 添加新章节
   */
  ipcMain.handle(
    'txtToEpub:addChapter',
    async (_event: IpcMainInvokeEvent, chapters: any[], lineNumber: number, title?: string) => {
      try {
        const cleanChapters: Chapter[] = chapters.map((chapter: any) => ({
          index: Number(chapter.index || 1),
          title: String(chapter.title || ''),
          content: String(chapter.content || ''),
          lineStart: Number(chapter.lineStart || 1),
          lineEnd: Number(chapter.lineEnd || 1),
          wordCount: Number(chapter.wordCount || 0),
          level: chapter.level !== undefined ? Number(chapter.level) : 0,
          deleted: Boolean(chapter.deleted),
          isShortChapter: Boolean(chapter.isShortChapter)
        }))
        const updatedChapters = chapterEditorService.addChapter(cleanChapters, lineNumber, title)
        return { success: true, data: updatedChapters }
      } catch (error: any) {
        console.error('添加章节失败:', error)
        return {
          success: false,
          error: error?.message || '添加章节失败'
        }
      }
    }
  )

  /**
   * 标记短章节
   */
  ipcMain.handle(
    'txtToEpub:markShortChapters',
    async (_event: IpcMainInvokeEvent, chapters: any[], maxLines: number) => {
      try {
        const cleanChapters: Chapter[] = chapters.map((chapter: any) => ({
          index: Number(chapter.index || 1),
          title: String(chapter.title || ''),
          content: String(chapter.content || ''),
          lineStart: Number(chapter.lineStart || 1),
          lineEnd: Number(chapter.lineEnd || 1),
          wordCount: Number(chapter.wordCount || 0),
          level: chapter.level !== undefined ? Number(chapter.level) : 0,
          deleted: Boolean(chapter.deleted),
          isShortChapter: Boolean(chapter.isShortChapter)
        }))
        const updatedChapters = chapterEditorService.markShortChapters(cleanChapters, maxLines)
        return { success: true, data: updatedChapters }
      } catch (error: any) {
        console.error('标记短章节失败:', error)
        return {
          success: false,
          error: error?.message || '标记短章节失败'
        }
      }
    }
  )

  /**
   * 保存章节编辑
   */
  ipcMain.handle(
    'txtToEpub:saveChapterEdits',
    async (_event: IpcMainInvokeEvent, chapters: any[]) => {
      try {
        const cleanChapters: Chapter[] = chapters.map((chapter: any) => ({
          index: Number(chapter.index || 1),
          title: String(chapter.title || ''),
          content: String(chapter.content || ''),
          lineStart: Number(chapter.lineStart || 1),
          lineEnd: Number(chapter.lineEnd || 1),
          wordCount: Number(chapter.wordCount || 0),
          level: chapter.level !== undefined ? Number(chapter.level) : 0,
          deleted: Boolean(chapter.deleted),
          isShortChapter: Boolean(chapter.isShortChapter)
        }))
        
        // 验证章节
        const validation = chapterEditorService.validateChapters(cleanChapters)
        if (!validation.valid) {
          return {
            success: false,
            error: validation.errors?.join('; ') || '章节验证失败'
          }
        }

        // 重新计算索引
        const updatedChapters = chapterEditorService.recalculateIndices(
          cleanChapters.filter((chapter) => !chapter.deleted)
        )

        return { success: true, data: updatedChapters }
      } catch (error: any) {
        console.error('保存章节编辑失败:', error)
        return {
          success: false,
          error: error?.message || '保存章节编辑失败'
        }
      }
    }
  )
}

