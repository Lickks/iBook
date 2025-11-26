<template>
  <div class="page-container statistics-page">
    <!-- 页面标题 -->
    <header class="page-header">
      <div>
        <p class="eyebrow">数据统计</p>
        <h1>统计分析</h1>
        <p class="subtitle">查看您的阅读数据和统计信息</p>
      </div>
      <div class="header-right">
        <div class="bookshelf-filter">
          <label class="filter-label">统计范围：</label>
          <div class="bookshelf-select-wrapper">
            <select
              class="bookshelf-select"
              :value="selectedBookshelfId === null ? '' : selectedBookshelfId"
              @change="handleBookshelfChange"
              :disabled="loading"
            >
              <option value="">全部书籍</option>
              <option
                v-for="bookshelf in customBookshelves"
                :key="bookshelf.id"
                :value="bookshelf.id"
              >
                {{ bookshelf.name }}
              </option>
            </select>
          </div>
        </div>
        <button
          class="ghost-btn"
          type="button"
          @click="refreshData"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-icon">⟳</span>
          {{ loading ? '刷新中...' : '刷新数据' }}
        </button>
      </div>
    </header>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>正在加载统计数据...</p>
    </div>

    <!-- 统计数据 -->
    <div v-else-if="data" class="stats-container">
      <!-- 统计卡片网格 -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <el-icon class="stat-icon"><Collection /></el-icon>
          <div class="stat-content">
            <div class="stat-value">{{ data.totalBooks }}</div>
            <div class="stat-label">总书籍数</div>
          </div>
        </div>

        <div class="stat-card success">
          <el-icon class="stat-icon"><Files /></el-icon>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(data.totalWordCount) }}</div>
            <div class="stat-label">总字数</div>
          </div>
        </div>

  
        <div class="stat-card info">
          <el-icon class="stat-icon"><Check /></el-icon>
          <div class="stat-content">
            <div class="stat-value">{{ data.finishedBooks }}</div>
            <div class="stat-label">已读完</div>
          </div>
        </div>

        <div class="stat-card primary">
          <el-icon class="stat-icon"><Reading /></el-icon>
          <div class="stat-content">
            <div class="stat-value">{{ data.readingBooks }}</div>
            <div class="stat-label">阅读中</div>
          </div>
        </div>

        <div class="stat-card secondary">
          <el-icon class="stat-icon"><Document /></el-icon>
          <div class="stat-content">
            <div class="stat-value">{{ data.unreadBooks }}</div>
            <div class="stat-label">未读</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <!-- 阅读状态分布 -->
        <div class="charts-row">
          <div class="chart-card chart-full" data-chart-index="0">
            <h3>阅读状态分布</h3>
            <div ref="statusChartRef" class="chart"></div>
          </div>
        </div>

        <!-- 类型分布 -->
        <div class="charts-row">
          <div class="chart-card chart-full" data-chart-index="1">
            <h3>类型分布</h3>
            <div ref="categoryChartRef" class="chart"></div>
          </div>
        </div>

        <!-- 平台分布 -->
        <div class="charts-row">
          <div class="chart-card chart-full" data-chart-index="2">
            <h3>平台分布</h3>
            <div ref="platformChartRef" class="chart"></div>
          </div>
        </div>

        <!-- 字数分布 -->
        <div class="charts-row">
          <div class="chart-card chart-full" data-chart-index="3">
            <h3>字数分布</h3>
            <div ref="wordCountChartRef" class="chart"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无统计数据">
        <el-button type="primary" @click="$router.push('/add')">添加第一本书</el-button>
      </el-empty>
    </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Collection, Reading, Check, Document, Loading, Files } from '@element-plus/icons-vue'
import { READING_STATUS_LABEL } from '../constants'
import { useUIStore } from '../stores/ui'
import { useBookshelfStore } from '../stores/bookshelf'
import { statsApi } from '../api/stats'

const uiStore = useUIStore()
const bookshelfStore = useBookshelfStore()

// 书架选择状态
const selectedBookshelfId = ref<number | null>(null)
const bookshelves = ref(bookshelfStore.bookshelves)

// 过滤掉默认书架，只保留自定义书架
const customBookshelves = computed(() => {
  return bookshelves.value.filter(bs => !bs.isDefault)
})

interface Book {
  id: string
  title: string
  author: string
  category: string
  platform: string
  status: string
  rating: number
  wordCount: number
}

interface ChartData {
  name: string
  value: number
  percentage?: number
}

interface MonthlyData {
  month: string
  bookCount: number
  wordCount: number
}

interface StatisticsData {
  totalBooks: number
  totalWordCount: number
  averageRating: number
  finishedBooks: number
  readingBooks: number
  unreadBooks: number
  categoryStats: ChartData[]
  platformStats: ChartData[]
  statusStats: ChartData[]
  wordCountStats: ChartData[]
  monthlyStats: {
    books: MonthlyData[]
    words: MonthlyData[]
  }
}

const loading = ref(false)
const data = ref<StatisticsData | null>(null)
const statusChartRef = ref<HTMLDivElement>()
const categoryChartRef = ref<HTMLDivElement>()
const platformChartRef = ref<HTMLDivElement>()
const wordCountChartRef = ref<HTMLDivElement>()
let statusChartInstance: any = null
let categoryChartInstance: any = null
let platformChartInstance: any = null
let wordCountChartInstance: any = null
const chartResizeObservers: Record<'status' | 'category' | 'platform' | 'wordCount', ResizeObserver | null> = {
  status: null,
  category: null,
  platform: null,
  wordCount: null
}
const barAnimation = {
  animation: true,
  animationDuration: 600,
  animationEasing: 'cubicOut',
  animationDelay: (idx: number) => idx * 60
}

const resizeAllCharts = () => {
  statusChartInstance?.resize()
  categoryChartInstance?.resize()
  platformChartInstance?.resize()
  wordCountChartInstance?.resize()
}

const observeChartResize = (
  key: keyof typeof chartResizeObservers,
  el: HTMLDivElement | undefined,
  instance: any
) => {
  if (!el || !instance || !window.ResizeObserver) return
  chartResizeObservers[key]?.disconnect()
  const observer = new ResizeObserver(() => {
    instance.resize()
  })
  chartResizeObservers[key] = observer
  observer.observe(el)
}

// 格式化数字显示
const formatNumber = (num: number) => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 创建阅读状态横向条形图
const createStatusChart = () => {
  if (!statusChartRef.value || !data.value) return

  try {
    import('echarts').then(echarts => {
      if (statusChartInstance) {
        statusChartInstance.dispose()
      }

      statusChartInstance = echarts.init(statusChartRef.value)

      // 定义所有状态的固定顺序和颜色
      const allStatuses = [
        { key: 'unread', label: READING_STATUS_LABEL.unread, color: '#909399' },
        { key: 'reading', label: READING_STATUS_LABEL.reading, color: '#409EFF' },
        { key: 'finished', label: READING_STATUS_LABEL.finished, color: '#67C23A' },
        { key: 'dropped', label: READING_STATUS_LABEL.dropped, color: '#F56C6C' },
        { key: 'to-read', label: READING_STATUS_LABEL['to-read'], color: '#E6A23C' }
      ]

      // 将后端返回的数据转换为Map，方便查找
      const statusMap = new Map(
        data.value!.statusStats.map(item => [item.name, item.value])
      )

      // 确保所有状态都显示，缺失的状态值为0
      const statusData = allStatuses.map(status => ({
        name: status.label,
        value: statusMap.get(status.label) || 0,
        color: status.color
      }))

      const categories = statusData.map(item => item.name)
      const values = statusData.map(item => item.value)
      const colors = statusData.map(item => item.color)

      // 固定显示5个状态，计算图表高度（每项约35px，加上边距）
      const itemCount = 5
      const calculatedHeight = itemCount * 35 + 60
      if (statusChartRef.value) {
        statusChartRef.value.style.height = `${calculatedHeight}px`
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            const param = params[0]
            const total = values.reduce((sum, v) => sum + v, 0)
            const percentage = total > 0 ? ((param.value / total) * 100).toFixed(1) : 0
            return `${param.name}<br/>数量: ${param.value} (${percentage}%)`
          }
        },
        grid: {
          left: '100px',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
          }
        },
        yAxis: {
          type: 'category',
          data: categories,
          inverse: true,
          axisLabel: {
            interval: 0,
            color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
          },
          axisLine: {
            lineStyle: {
              color: uiStore.theme === 'dark' ? '#374151' : '#E5E7EB'
            }
          }
        },
        series: [
          {
            name: '阅读状态',
            type: 'bar',
            data: values.map((value, index) => ({
              value,
              itemStyle: {
                color: colors[index % colors.length],
                borderRadius: [0, 4, 4, 0]
              }
            })),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}',
              color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
            },
            ...barAnimation
          }
        ]
      }

      statusChartInstance.setOption(option)
      statusChartInstance.resize()
      observeChartResize('status', statusChartRef.value, statusChartInstance)
    })
  } catch (error) {
    console.error('阅读状态图表创建失败:', error)
  }
}

// 创建类型分布横向条形图
const createCategoryChart = () => {
  if (!categoryChartRef.value || !data.value) return

  try {
    import('echarts').then(echarts => {
      if (categoryChartInstance) {
        categoryChartInstance.dispose()
      }

      categoryChartInstance = echarts.init(categoryChartRef.value)

      // 使用后端已计算的类型统计数据，按值降序排序
      const categoryData = [...data.value!.categoryStats]
        .map(item => ({
          name: item.name,
          value: item.value
        }))
        .sort((a, b) => {
          // 确保降序排序：数值大的在前
          return b.value - a.value
        })

      const categories = categoryData.map(item => item.name)
      const values = categoryData.map(item => item.value)
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

      // 根据数据项数量动态计算图表高度（每项约35px，最小300px，最大500px）
      const itemCount = categories.length
      const calculatedHeight = Math.max(300, Math.min(500, itemCount * 35 + 60))
      if (categoryChartRef.value) {
        categoryChartRef.value.style.height = `${calculatedHeight}px`
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            const param = params[0]
            const total = values.reduce((sum, v) => sum + v, 0)
            const percentage = total > 0 ? ((param.value / total) * 100).toFixed(1) : 0
            return `${param.name}<br/>数量: ${param.value} (${percentage}%)`
          }
        },
        grid: {
          left: '100px',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
          }
        },
        yAxis: {
          type: 'category',
          data: categories,
          inverse: true,
          axisLabel: {
            interval: 0,
            color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
          },
          axisLine: {
            lineStyle: {
              color: uiStore.theme === 'dark' ? '#374151' : '#E5E7EB'
            }
          }
        },
        series: [
          {
            name: '书籍类型',
            type: 'bar',
            data: values.map((value, index) => ({
              value,
              itemStyle: {
                color: colors[index % colors.length],
                borderRadius: [0, 4, 4, 0]
              }
            })),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}',
              color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
            },
            ...barAnimation
          }
        ]
      }

      categoryChartInstance.setOption(option)
      categoryChartInstance.resize()
      observeChartResize('category', categoryChartRef.value, categoryChartInstance)
    })
  } catch (error) {
    console.error('类型分布图表创建失败:', error)
  }
}

// 创建平台分布横向条形图
const createPlatformChart = () => {
  if (!platformChartRef.value || !data.value) return

  try {
    import('echarts').then(echarts => {
      if (platformChartInstance) {
        platformChartInstance.dispose()
      }

      platformChartInstance = echarts.init(platformChartRef.value)

      // 使用后端已计算的平台统计数据，按值降序排序
      const platformData = [...data.value!.platformStats]
        .map(item => ({
          name: item.name,
          value: item.value
        }))
        .sort((a, b) => {
          // 确保降序排序：数值大的在前
          return b.value - a.value
        })

      const categories = platformData.map(item => item.name)
      const values = platformData.map(item => item.value)
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

      // 根据数据项数量动态计算图表高度（每项约35px，最小300px，最大500px）
      const itemCount = categories.length
      const calculatedHeight = Math.max(300, Math.min(500, itemCount * 35 + 60))
      if (platformChartRef.value) {
        platformChartRef.value.style.height = `${calculatedHeight}px`
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            const param = params[0]
            const total = values.reduce((sum, v) => sum + v, 0)
            const percentage = total > 0 ? ((param.value / total) * 100).toFixed(1) : 0
            return `${param.name}<br/>数量: ${param.value} (${percentage}%)`
          }
        },
        grid: {
          left: '100px',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
          }
        },
        yAxis: {
          type: 'category',
          data: categories,
          inverse: true,
          axisLabel: {
            interval: 0,
            color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
          },
          axisLine: {
            lineStyle: {
              color: uiStore.theme === 'dark' ? '#374151' : '#E5E7EB'
            }
          }
        },
        series: [
          {
            name: '阅读平台',
            type: 'bar',
            data: values.map((value, index) => ({
              value,
              itemStyle: {
                color: colors[index % colors.length],
                borderRadius: [0, 4, 4, 0]
              }
            })),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}',
              color: uiStore.theme === 'dark' ? '#E5E7EB' : '#374151'
            },
            ...barAnimation
          }
        ]
      }

      platformChartInstance.setOption(option)
      platformChartInstance.resize()
      observeChartResize('platform', platformChartRef.value, platformChartInstance)
    })
  } catch (error) {
    console.error('平台分布图表创建失败:', error)
  }
}

// 创建字数分布柱状图
const createWordCountChart = () => {
  if (!wordCountChartRef.value || !data.value) return

  try {
    import('echarts').then(echarts => {
      if (wordCountChartInstance) {
        wordCountChartInstance.dispose()
      }

      wordCountChartInstance = echarts.init(wordCountChartRef.value)

      // 定义所有字数范围的固定顺序
      const allWordCountRanges = [
        { name: '0-50万', color: '#3b82f6' },
        { name: '50-100万', color: '#10b981' },
        { name: '100-300万', color: '#f59e0b' },
        { name: '300-500万', color: '#ef4444' },
        { name: '500-1000万', color: '#8b5cf6' },
        { name: '1000万以上', color: '#ec4899' }
      ]

      // 将后端返回的数据转换为Map，方便查找
      const wordCountMap = new Map(
        data.value!.wordCountStats.map(item => [item.name, item.value])
      )

      // 确保所有范围都显示，缺失的范围值为0
      const wordCountData = allWordCountRanges.map(range => ({
        name: range.name,
        value: wordCountMap.get(range.name) || 0,
        color: range.color
      }))

      const categories = wordCountData.map(item => item.name)
      const values = wordCountData.map(item => item.value)
      const colors = wordCountData.map(item => item.color)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '书籍数量',
            type: 'bar',
            barWidth: '60%',
            data: values.map((value, index) => ({
              value,
              itemStyle: {
                color: colors[index]
              }
            })),
            ...barAnimation
          }
        ]
      }

      wordCountChartInstance.setOption(option)
      wordCountChartInstance.resize()
      observeChartResize('wordCount', wordCountChartRef.value, wordCountChartInstance)
    })
  } catch (error) {
    console.error('字数分布图表创建失败:', error)
  }
}


// 处理书架选择变化
const handleBookshelfChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  selectedBookshelfId.value = target.value === '' ? null : Number(target.value)
  fetchData()
}

// 获取统计数据
const fetchData = async () => {
  loading.value = true
  try {
    console.log('获取统计数据...', selectedBookshelfId.value)
    const response = await statsApi.getOverview(selectedBookshelfId.value)
    console.log('统计响应:', response)

    if (response && response.success && response.data) {
      data.value = response.data
      console.log('数据加载成功:', data.value)

      // 延迟创建图表，确保DOM已渲染
      setTimeout(() => {
        createStatusChart()
        createCategoryChart()
        createPlatformChart()
        createWordCountChart()
      }, 100)
    } else {
      throw new Error(response?.error || '获取数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  // 销毁所有图表实例
  if (statusChartInstance) {
    statusChartInstance.dispose()
    statusChartInstance = null
  }
  if (categoryChartInstance) {
    categoryChartInstance.dispose()
    categoryChartInstance = null
  }
  if (platformChartInstance) {
    platformChartInstance.dispose()
    platformChartInstance = null
  }
  if (wordCountChartInstance) {
    wordCountChartInstance.dispose()
    wordCountChartInstance = null
  }
  Object.keys(chartResizeObservers).forEach((key) => {
    const observer = chartResizeObservers[key as keyof typeof chartResizeObservers]
    observer?.disconnect()
    chartResizeObservers[key as keyof typeof chartResizeObservers] = null
  })
  fetchData()
  ElMessage.success('数据已刷新')
}


// 监听书架列表变化
watch(() => bookshelfStore.bookshelves, (newBookshelves) => {
  bookshelves.value = newBookshelves
}, { deep: true })

// 监听主题变化，更新图表主题
watch(() => uiStore.theme, () => {
  if (data.value) {
    setTimeout(() => {
      createStatusChart()
      createCategoryChart()
      createPlatformChart()
    }, 100)
  }
})

onMounted(async () => {
  console.log('统计分析页面加载')
  window.addEventListener('resize', resizeAllCharts)
  // 获取书架列表
  try {
    await bookshelfStore.fetchBookshelves()
    bookshelves.value = bookshelfStore.bookshelves
  } catch (error) {
    console.error('获取书架列表失败:', error)
  }
  // 默认选择"全部书籍"（selectedBookshelfId 已经是 null）
  fetchData()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeAllCharts)
  Object.keys(chartResizeObservers).forEach((key) => {
    const observer = chartResizeObservers[key as keyof typeof chartResizeObservers]
    observer?.disconnect()
    chartResizeObservers[key as keyof typeof chartResizeObservers] = null
  })
})
</script>

<style scoped>
.statistics-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bookshelf-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.bookshelf-select-wrapper {
  position: relative;
  display: inline-block;
}

.bookshelf-select {
  appearance: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 36px 8px 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
  font-weight: 500;
}

.bookshelf-select:hover {
  border-color: var(--color-accent);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bookshelf-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-soft);
}

.bookshelf-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bookshelf-select-wrapper::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid var(--color-text-secondary);
  color: var(--color-text-secondary);
  pointer-events: none;
  transition: all 0.2s ease;
}

.bookshelf-select-wrapper:hover::after {
  color: var(--color-accent);
}

.actions {
  display: flex;
  gap: 12px;
}

.loading-icon {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--el-text-color-secondary, #6b7280);
}

.loading-container .el-icon {
  font-size: 32px;
  margin-bottom: 16px;
  color: #3b82f6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  background: var(--color-surface);
  box-shadow: 0 1px 3px 0 var(--color-card-shadow);
  border: 1px solid var(--color-border);
  transition: all 0.2s;
  animation: stat-card-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(10px);
}

.stat-card:nth-child(1) {
  animation-delay: 0.05s;
}

.stat-card:nth-child(2) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.15s;
}

.stat-card:nth-child(4) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(5) {
  animation-delay: 0.25s;
}

@keyframes stat-card-fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  margin-right: 16px;
  display: flex;
  align-items: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.charts-section {
  margin-top: 40px;
}

.chart-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 var(--color-card-shadow);
  border: 1px solid var(--color-border);
  animation: chart-card-expand 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chart-card[data-chart-index="0"] {
  animation-delay: 0.1s;
}

.chart-card[data-chart-index="1"] {
  animation-delay: 0.2s;
}

.chart-card[data-chart-index="2"] {
  animation-delay: 0.3s;
}

.chart-card[data-chart-index="3"] {
  animation-delay: 0.4s;
}

@keyframes chart-card-expand {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart {
  width: 100%;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  animation: chart-expand 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: top;
  opacity: 0;
}

.chart::-webkit-scrollbar {
  width: 6px;
}

.chart::-webkit-scrollbar-track {
  background: var(--color-bg-soft, #f3f4f6);
  border-radius: 3px;
}

.chart::-webkit-scrollbar-thumb {
  background: var(--color-border, #d1d5db);
  border-radius: 3px;
}

.chart::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary, #9ca3af);
}

@keyframes chart-expand {
  0% {
    opacity: 0;
    transform: scaleY(0.85);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

/* 图表卡片动画延迟继承 */
.chart-card[data-chart-index="0"] .chart {
  animation-delay: 0.3s;
}

.chart-card[data-chart-index="1"] .chart {
  animation-delay: 0.4s;
}

.chart-card[data-chart-index="2"] .chart {
  animation-delay: 0.5s;
}

.chart-card[data-chart-index="3"] .chart {
  animation-delay: 0.6s;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-full {
  grid-column: 1 / -1;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* 导出表单样式 */
.export-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.export-section .el-radio-group,
.export-section .el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-right {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 12px;
  }

  .bookshelf-filter {
    width: 100%;
  }

  .bookshelf-select-wrapper {
    width: 100%;
  }

  .bookshelf-select {
    width: 100%;
  }

  .actions {
    align-self: stretch;
    justify-content: flex-end;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    font-size: 24px;
    margin-right: 12px;
    display: flex;
    align-items: center;
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>
