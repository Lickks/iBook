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


/**
 * 统计 API 类
 */
export class StatsApi {
  /**
   * 获取总体统计数据
   */
  async getOverview(bookshelfId?: number | null): Promise<ApiResponse<StatisticsData>> {
    return await window.api.stats?.getOverview(bookshelfId) || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取分类统计数据
   */
  async getCategoryStats(bookshelfId?: number | null): Promise<ApiResponse<ChartData[]>> {
    return await window.api.stats?.getCategoryStats(bookshelfId) || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取平台统计数据
   */
  async getPlatformStats(bookshelfId?: number | null): Promise<ApiResponse<ChartData[]>> {
    return await window.api.stats?.getPlatformStats(bookshelfId) || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取阅读状态统计数据
   */
  async getStatusStats(bookshelfId?: number | null): Promise<ApiResponse<ChartData[]>> {
    return await window.api.stats?.getStatusStats(bookshelfId) || {
      success: false,
      error: '统计API不可用'
    }
  }

  /**
   * 获取月度统计数据
   */
  async getMonthlyStats(months: number = 12, bookshelfId?: number | null): Promise<ApiResponse<{ books: MonthlyData[], words: MonthlyData[] }>> {
    return await window.api.stats?.getMonthlyStats(months, bookshelfId) || {
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