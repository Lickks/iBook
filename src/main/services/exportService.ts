/**
 * 数据导出服务
 * 支持导出Excel、CSV格式的统计数据和年度报告
 */

import { app, dialog } from 'electron'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import * as XLSX from 'xlsx'
import { databaseService } from './database'
import type { Book } from '../../renderer/src/types/book'

export interface ExportOptions {
  format: 'excel' | 'csv'
  dateRange?: {
    start: string
    end: string
  }
  dataTypes?: {
    books: boolean
    statistics: boolean
    charts: boolean
  }
}

export interface ExportResult {
  filePath: string
  fileName: string
}

/**
 * 导出服务类
 */
export class ExportService {
  private userDataPath = app.getPath('userData')
  private exportDir = join(this.userDataPath, 'exports')

  constructor() {
    // 确保导出目录存在
    this.ensureExportDir()
  }

  /**
   * 导出统计数据
   */
  async exportStatistics(options: ExportOptions): Promise<ExportResult> {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const fileName = `统计导出_${timestamp}.${options.format}`
      const filePath = join(this.exportDir, fileName)

      // 获取数据
      const books = this.getBooksData(options.dateRange)
      const statistics = this.calculateStatistics(books)
      const charts = options.dataTypes?.charts ? this.prepareChartData(statistics) : null

      if (options.format === 'excel') {
        await this.exportToExcel(filePath, {
          books: options.dataTypes?.books ? books : [],
          statistics: options.dataTypes?.statistics ? statistics : null,
          charts: charts
        })
      } else {
        await this.exportToCsv(filePath, {
          books: options.dataTypes?.books ? books : [],
          statistics: options.dataTypes?.statistics ? statistics : null
        })
      }

      // 显示保存对话框
      const result = await dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [
          { name: options.format === 'excel' ? 'Excel Files' : 'CSV Files', extensions: [options.format] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        // 如果用户取消，返回临时文件路径
        return { filePath, fileName }
      }

      // 复制到用户选择的位置
      const finalPath = result.filePath.endsWith(`.${options.format}`)
        ? result.filePath
        : `${result.filePath}.${options.format}`

      await this.copyFile(filePath, finalPath)

      return { filePath: finalPath, fileName: finalPath.split('\\').pop() || fileName }
    } catch (error) {
      console.error('导出统计数据失败:', error)
      throw new Error(error instanceof Error ? error.message : '导出失败')
    }
  }

  /**
   * 导出年度报告
   */
  async exportYearlyReport(year: number): Promise<ExportResult> {
    try {
      const fileName = `年度阅读报告_${year}.xlsx`
      const filePath = join(this.exportDir, fileName)

      // 获取年度数据
      const yearlyData = this.getYearlyData(year)

      // 创建年度报告
      await this.createYearlyReport(filePath, yearlyData, year)

      // 显示保存对话框
      const result = await dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return { filePath, fileName }
      }

      const finalPath = result.filePath.endsWith('.xlsx')
        ? result.filePath
        : `${result.filePath}.xlsx`

      await this.copyFile(filePath, finalPath)

      return { filePath: finalPath, fileName: finalPath.split('\\').pop() || fileName }
    } catch (error) {
      console.error('导出年度报告失败:', error)
      throw new Error(error instanceof Error ? error.message : '导出年度报告失败')
    }
  }

  /**
   * 获取书籍数据
   */
  private getBooksData(dateRange?: { start: string; end: string }) {
    let books = databaseService.getAllBooks()

    if (dateRange) {
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999)

      books = books.filter(book => {
        if (!book.createdAt) return false
        const addedDate = new Date(book.createdAt)
        return addedDate >= startDate && addedDate <= endDate
      })
    }

    return books.map(book => ({
      ID: book.id,
      书名: book.title,
      作者: book.author,
      分类: book.category || '未分类',
      平台: book.platform || '未知',
      字数: book.wordCountDisplay || 0,
      阅读状态: book.readingStatus || '未读',
      评分: book.personalRating || 0,
      添加时间: book.createdAt ? new Date(book.createdAt).toLocaleString() : '',
      简介: book.description || '',
      封面链接: book.coverUrl || ''
    }))
  }

  /**
   * 计算统计数据
   */
  private calculateStatistics(books: any[]) {
    const totalBooks = books.length
    const totalWordCount = books.reduce((sum, book) => sum + (book.wordCountDisplay || 0), 0)

    const statusStats = {
      未读: books.filter(book => !book.readingStatus || book.readingStatus === 'unread').length,
      阅读中: books.filter(book => book.readingStatus === 'reading').length,
      已读完: books.filter(book => book.readingStatus === 'finished').length,
      弃读: books.filter(book => book.readingStatus === 'dropped').length,
      待读: books.filter(book => book.readingStatus === 'to-read').length
    }

    const categoryMap = new Map<string, number>()
    books.forEach(book => {
      const category = book.category || '未分类'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const platformMap = new Map<string, number>()
    books.forEach(book => {
      const platform = book.platform || '未知平台'
      platformMap.set(platform, (platformMap.get(platform) || 0) + 1)
    })

    const booksWithRating = books.filter(book => book.personalRating && book.personalRating > 0)
    const averageRating = booksWithRating.length > 0
      ? booksWithRating.reduce((sum, book) => sum + (book.personalRating || 0), 0) / booksWithRating.length
      : 0

    return {
      总书籍数: totalBooks,
      总字数: totalWordCount,
      平均评分: Math.round(averageRating * 10) / 10,
      完成本数: statusStats.已读完,
      阅读中本数: statusStats.阅读中,
      未读本数: statusStats.未读,
      弃读本数: statusStats.弃读,
      待读本数: statusStats.待读,
      分类统计: Object.fromEntries(categoryMap),
      平台统计: Object.fromEntries(platformMap)
    }
  }

  /**
   * 准备图表数据
   */
  private prepareChartData(statistics: any) {
    return {
      阅读状态分布: statistics.状态统计,
      分类分布: statistics.分类统计,
      平台分布: statistics.平台统计
    }
  }

  /**
   * 导出到Excel
   */
  private async exportToExcel(filePath: string, data: any) {
    const workbook = XLSX.utils.book_new()

    // 书籍数据表
    if (data.books && data.books.length > 0) {
      const booksSheet = XLSX.utils.json_to_sheet(data.books)
      XLSX.utils.book_append_sheet(workbook, booksSheet, '书籍列表')
    }

    // 统计数据表
    if (data.statistics) {
      const statsArray = Object.entries(data.statistics).map(([key, value]) => ({
        统计项: key,
        数值: typeof value === 'object' ? JSON.stringify(value) : value
      }))
      const statsSheet = XLSX.utils.json_to_sheet(statsArray)
      XLSX.utils.book_append_sheet(workbook, statsSheet, '统计数据')
    }

    // 图表数据表
    if (data.charts) {
      Object.entries(data.charts).forEach(([chartName, chartData]) => {
        const dataArray = Object.entries(chartData as any).map(([key, value]) => ({
          项目: key,
          数值: value
        }))
        const chartSheet = XLSX.utils.json_to_sheet(dataArray)
        XLSX.utils.book_append_sheet(workbook, chartSheet, chartName)
      })
    }

    XLSX.writeFile(workbook, filePath)
  }

  /**
   * 导出到CSV
   */
  private async exportToCsv(filePath: string, data: any) {
    let csvContent = ''

    // 书籍数据
    if (data.books && data.books.length > 0) {
      csvContent += '# 书籍列表\n'
      const headers = Object.keys(data.books[0])
      csvContent += headers.join(',') + '\n'

      data.books.forEach((book: any) => {
        const row = headers.map(header => {
          const value = book[header]
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        })
        csvContent += row.join(',') + '\n'
      })
      csvContent += '\n'
    }

    // 统计数据
    if (data.statistics) {
      csvContent += '# 统计数据\n'
      csvContent += '统计项,数值\n'

      Object.entries(data.statistics).forEach(([key, value]) => {
        const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
        csvContent += `${key},${strValue}\n`
      })
    }

    await writeFile(filePath, csvContent, 'utf-8')
  }

  /**
   * 获取年度数据
   */
  private getYearlyData(year: number) {
    const books = databaseService.getAllBooks().filter(book => {
      if (!book.addedAt) return false
      return new Date(book.addedAt).getFullYear() === year
    })

    const monthlyData = []
    for (let month = 1; month <= 12; month++) {
      const monthBooks = books.filter(book => {
        if (!book.addedAt) return false
        return new Date(book.addedAt).getMonth() + 1 === month
      })

      monthlyData.push({
        月份: `${year}年${month}月`,
        新增书籍: monthBooks.length,
        新增字数: monthBooks.reduce((sum, book) => sum + (book.wordCount || 0), 0),
        完成书籍: monthBooks.filter(book => book.readingStatus === '已读完').length
      })
    }

    return {
      year,
      books,
      monthlyData,
      totalBooks: books.length,
      totalWords: books.reduce((sum, book) => sum + (book.wordCount || 0), 0),
      finishedBooks: books.filter(book => book.readingStatus === '已读完').length
    }
  }

  /**
   * 创建年度报告
   */
  private async createYearlyReport(filePath: string, data: any, year: number) {
    const workbook = XLSX.utils.book_new()

    // 年度概览
    const overviewData = [
      { 指标: '年度', 数值: year },
      { 指标: '新增书籍总数', 数值: data.totalBooks },
      { 指标: '新增总字数', 数值: data.totalWords },
      { 指标: '完成书籍数', 数值: data.finishedBooks },
      { 指标: '完成率', 数值: data.totalBooks > 0 ? `${((data.finishedBooks / data.totalBooks) * 100).toFixed(1)}%` : '0%' }
    ]
    const overviewSheet = XLSX.utils.json_to_sheet(overviewData)
    XLSX.utils.book_append_sheet(workbook, overviewSheet, '年度概览')

    // 月度数据
    if (data.monthlyData.length > 0) {
      const monthlySheet = XLSX.utils.json_to_sheet(data.monthlyData)
      XLSX.utils.book_append_sheet(workbook, monthlySheet, '月度统计')
    }

    // 书籍详情
    if (data.books.length > 0) {
      const booksData = data.books.map((book: any) => ({
        书名: book.title,
        作者: book.author,
        分类: book.category || '未分类',
        字数: book.wordCount || 0,
        状态: book.readingStatus || '未读',
        评分: book.rating || 0,
        添加时间: book.addedAt ? new Date(book.addedAt).toLocaleDateString() : ''
      }))
      const booksSheet = XLSX.utils.json_to_sheet(booksData)
      XLSX.utils.book_append_sheet(workbook, booksSheet, '书籍详情')
    }

    XLSX.writeFile(workbook, filePath)
  }

  /**
   * 确保导出目录存在
   */
  private async ensureExportDir() {
    try {
      await writeFile(join(this.exportDir, '.gitkeep'), '', 'utf-8')
    } catch (error) {
      // 目录已存在或其他错误，忽略
    }
  }

  /**
   * 复制文件
   */
  private async copyFile(source: string, destination: string) {
    const fs = await import('fs/promises')
    await fs.copyFile(source, destination)
  }
}