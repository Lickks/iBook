/**
 * 统计分析 API
 * 提供各类统计数据获取和导出功能
 */

import type { ApiResponse } from '../types/api'

// 统计数据接口
export interface StatCard {
  title: string
  value: string | number
  icon?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
  }
  subtitle?: string
}

export interface ChartData {
  name: string
  value: number
  percentage?: number
}

export interface MonthlyData {
  month: string
  bookCount: number
  wordCount: number
}

export interface StatisticsData {
  // 总体统计
  totalBooks: number
  totalWordCount: number
  averageRating: number
  finishedBooks: number
  readingBooks: number
  unreadBooks: number

  // 分类统计
  categoryStats: ChartData[]

  // 平台统计
  platformStats: ChartData[]

  // 阅读状态统计
  statusStats: ChartData[]

  // 月度统计
  monthlyStats: {
    books: MonthlyData[]
    words: MonthlyData[]
  }
}

export interface ExportOptions {
  format: 'excel' | 'csv'
  dateRange?: {
    start: string
    end: string
  }
  includeCharts?: boolean
  dataTypes?: {
    books: boolean
    documents: boolean
    statistics: boolean
  }
}

/**
 * 统计 API 类
 */
export class StatsApi {
  /**
   * 获取总体统计数据
   */
  async getOverview(): Promise<ApiResponse<StatisticsData>> {
    return await window.api.stats?.getOverview() || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取分类统计数据
   */
  async getCategoryStats(): Promise<ApiResponse<ChartData[]>> {
    return await window.api.stats?.getCategoryStats() || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取平台统计数据
   */
  async getPlatformStats(): Promise<ApiResponse<ChartData[]>> {
    return await window.api.stats?.getPlatformStats() || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取阅读状态统计数据
   */
  async getStatusStats(): Promise<ApiResponse<ChartData[]>> {
    return await window.api.stats?.getStatusStats() || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取月度统计数据
   */
  async getMonthlyStats(months: number = 12): Promise<ApiResponse<{ books: MonthlyData[], words: MonthlyData[] }>> {
    return await window.api.stats?.getMonthlyStats(months) || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 导出统计数据
   */
  async exportData(options: ExportOptions): Promise<ApiResponse<{ filePath: string, fileName: string }>> {
    return await window.api.stats?.exportData(options) || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 导出年度报告
   */
  async exportYearlyReport(year: number): Promise<ApiResponse<{ filePath: string, fileName: string }>> {
    return await window.api.stats?.exportYearlyReport(year) || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取指定年份的统计数据
   */
  async getYearlyStats(year: number): Promise<ApiResponse<StatisticsData>> {
    return await window.api.stats?.getYearlyStats(year) || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 重新计算统计数据
   */
  async recalculateStats(): Promise<ApiResponse<boolean>> {
    return await window.api.stats?.recalculateStats() || {
      success: false,
      error: '统计API不可用'
    }
  }
}

// 创建统计API实例
export const statsApi = new StatsApi()

// 导出默认实例
export default statsApi