<template>
  <div class="statistics-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>统计分析</h1>
      <p class="subtitle">查看您的阅读数据和统计信息</p>
      <div class="actions">
        <el-button @click="refreshData" :loading="loading">刷新数据</el-button>
        <el-button type="primary" @click="showExportDialog = true">导出数据</el-button>
      </div>
    </div>

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
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.totalBooks }}</div>
            <div class="stat-label">总书籍数</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">📖</div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(data.totalWordCount) }}</div>
            <div class="stat-label">总字数</div>
          </div>
        </div>

  
        <div class="stat-card info">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.finishedBooks }}</div>
            <div class="stat-label">已读完</div>
          </div>
        </div>

        <div class="stat-card primary">
          <div class="stat-icon">📖</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.readingBooks }}</div>
            <div class="stat-label">阅读中</div>
          </div>
        </div>

        <div class="stat-card secondary">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.unreadBooks }}</div>
            <div class="stat-label">未读</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <!-- 第一行图表 -->
        <div class="charts-row">
          <div class="chart-card">
            <h3>阅读状态分布</h3>
            <div ref="statusChartRef" class="chart"></div>
          </div>
          <div class="chart-card">
            <h3>类型分布</h3>
            <div ref="categoryChartRef" class="chart"></div>
          </div>
          <div class="chart-card">
            <h3>平台分布</h3>
            <div ref="platformChartRef" class="chart"></div>
          </div>
        </div>

        <!-- 第二行图表 -->
        <div class="charts-row">
          <div class="chart-card chart-full">
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

    <!-- 导出对话框 -->
    <el-dialog v-model="showExportDialog" title="导出数据" width="500px">
      <div class="export-form">
        <div class="export-section">
          <h4>导出格式</h4>
          <el-radio-group v-model="exportFormat">
            <el-radio label="excel">Excel文件 (.xlsx)</el-radio>
            <el-radio label="csv">CSV文件 (.csv)</el-radio>
          </el-radio-group>
        </div>

        <div class="export-section">
          <h4>包含数据</h4>
          <el-checkbox-group v-model="exportData">
            <el-checkbox label="books">书籍信息</el-checkbox>
            <el-checkbox label="statistics">统计数据</el-checkbox>
            <el-checkbox label="annual">年度报告</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="export-section">
          <h4>时间范围（可选）</h4>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showExportDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="exporting"
            :disabled="exportData.length === 0"
          >
            {{ exporting ? '导出中...' : '导出' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

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
const showExportDialog = ref(false)
const exporting = ref(false)
const exportFormat = ref('excel')
const exportData = ref(['books', 'statistics', 'annual'])
const dateRange = ref<[string, string] | []>([])
const data = ref<StatisticsData | null>(null)
const statusChartRef = ref<HTMLDivElement>()
const categoryChartRef = ref<HTMLDivElement>()
const platformChartRef = ref<HTMLDivElement>()
const wordCountChartRef = ref<HTMLDivElement>()
let statusChartInstance: any = null
let categoryChartInstance: any = null
let platformChartInstance: any = null
let wordCountChartInstance: any = null

// 格式化数字显示
const formatNumber = (num: number) => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 创建阅读状态饼图
const createStatusChart = () => {
  if (!statusChartRef.value || !data.value) return

  try {
    import('echarts').then(echarts => {
      if (statusChartInstance) {
        statusChartInstance.dispose()
      }

      statusChartInstance = echarts.init(statusChartRef.value)

      // 使用后端已计算的状态统计数据
      const statusData = data.value!.statusStats.map(item => ({
        name: item.name,
        value: item.value
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '阅读状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: statusData
          }
        ]
      }

      statusChartInstance.setOption(option)
    })
  } catch (error) {
    console.error('阅读状态图表创建失败:', error)
  }
}

// 创建类型分布饼图
const createCategoryChart = () => {
  if (!categoryChartRef.value || !data.value) return

  try {
    import('echarts').then(echarts => {
      if (categoryChartInstance) {
        categoryChartInstance.dispose()
      }

      categoryChartInstance = echarts.init(categoryChartRef.value)

      // 使用后端已计算的类型统计数据
      const categoryData = data.value!.categoryStats.map(item => ({
        name: item.name,
        value: item.value
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '书籍类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: categoryData
          }
        ]
      }

      categoryChartInstance.setOption(option)
    })
  } catch (error) {
    console.error('类型分布图表创建失败:', error)
  }
}

// 创建平台分布饼图
const createPlatformChart = () => {
  if (!platformChartRef.value || !data.value) return

  try {
    import('echarts').then(echarts => {
      if (platformChartInstance) {
        platformChartInstance.dispose()
      }

      platformChartInstance = echarts.init(platformChartRef.value)

      // 使用后端已计算的平台统计数据
      const platformData = data.value!.platformStats.map(item => ({
        name: item.name,
        value: item.value
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '阅读平台',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: platformData
          }
        ]
      }

      platformChartInstance.setOption(option)
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

      // 使用后端已计算的字数统计数据
      const categories = data.value!.wordCountStats.map(item => item.name)
      const values = data.value!.wordCountStats.map(item => item.value)

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
                color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]
              }
            }))
          }
        ]
      }

      wordCountChartInstance.setOption(option)
    })
  } catch (error) {
    console.error('字数分布图表创建失败:', error)
  }
}


// 获取统计数据
const fetchData = async () => {
  loading.value = true
  try {
    console.log('获取统计数据...')
    const response = await window.api.stats?.getOverview()
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
  fetchData()
  ElMessage.success('数据已刷新')
}

// 处理导出
const handleExport = async () => {
  exporting.value = true

  try {
    console.log('开始导出数据...', {
      format: exportFormat.value,
      dataTypes: exportData.value,
      dateRange: dateRange.value
    })

    const exportOptions = {
      format: exportFormat.value as 'excel' | 'csv',
      dateRange: dateRange.value.length === 2 ? {
        start: dateRange.value[0],
        end: dateRange.value[1]
      } : undefined,
      dataTypes: {
        books: exportData.value.includes('books'),
        statistics: exportData.value.includes('statistics'),
        annual: exportData.value.includes('annual')
      }
    }

    const response = await window.api.stats?.exportData(exportOptions)

    if (response && response.success) {
      ElMessage.success(`数据导出成功！文件：${response.data?.fileName || '导出文件'}`)
      showExportDialog.value = false

      // 重置表单
      exportFormat.value = 'excel'
      exportData.value = ['books', 'statistics', 'annual']
      dateRange.value = []
    } else {
      throw new Error(response?.error || '导出失败')
    }
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败，请重试')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  console.log('统计分析页面加载')
  fetchData()
})
</script>

<style scoped>
.statistics-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light, #e5e7eb);
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.subtitle {
  color: var(--el-text-color-secondary, #6b7280);
  margin: 0;
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 12px;
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
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  margin-right: 16px;
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
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart {
  width: 100%;
  height: 300px;
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
  .statistics-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
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
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>