<template>
  <div class="statistics">
    <!-- 页面标题和操作区 -->
    <div class="statistics__header">
      <div class="statistics__title">
        <h1>统计分析</h1>
        <p class="statistics__subtitle">查看您的阅读数据和统计信息</p>
      </div>
      <div class="statistics__actions">
        <el-button-group>
          <el-button
            type="primary"
            :icon="Download"
            @click="showExportDialog = true"
          >
            导出数据
          </el-button>
          <el-button
            :icon="Refresh"
            @click="refreshData"
            :loading="loading"
          >
            刷新
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="statistics__loading">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 统计内容 -->
    <div v-else-if="statisticsData" class="statistics__content">
      <!-- 总体统计卡片 -->
      <div class="statistics__overview">
        <div class="stat-card">
          <h3>总书籍数</h3>
          <div class="value">{{ statisticsData.totalBooks }}</div>
          <div class="unit">本</div>
        </div>
        <div class="stat-card">
          <h3>总字数</h3>
          <div class="value">{{ formatWordCount(statisticsData.totalWordCount) }}</div>
          <div class="unit">字</div>
        </div>
        <div class="stat-card">
          <h3>平均评分</h3>
          <div class="value">{{ statisticsData.averageRating }}</div>
          <div class="unit">分</div>
        </div>
        <div class="stat-card">
          <h3>已读完</h3>
          <div class="value">{{ statisticsData.finishedBooks }}</div>
          <div class="unit">本</div>
        </div>
        <div class="stat-card">
          <h3>阅读中</h3>
          <div class="value">{{ statisticsData.readingBooks }}</div>
          <div class="unit">本</div>
        </div>
        <div class="stat-card">
          <h3>未读</h3>
          <div class="value">{{ statisticsData.unreadBooks }}</div>
          <div class="unit">本</div>
        </div>
      </div>

      <!-- 简单图表区域 -->
      <div class="statistics__charts">
        <div class="chart-container">
          <h3>阅读状态分布</h3>
          <div ref="statusChartRef" style="width: 100%; height: 300px;"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="statistics__empty">
      <el-empty
        description="暂无统计数据"
        :image-size="200"
      >
        <template #description>
          <p>您还没有添加任何书籍</p>
          <p class="statistics__empty-tip">添加书籍后即可查看详细的统计信息</p>
        </template>
        <el-button type="primary" @click="$router.push('/add')">
          添加书籍
        </el-button>
      </el-empty>
    </div>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="showExportDialog"
      title="导出数据"
      width="500px"
    >
      <div class="export-dialog__content">
        <p>导出功能开发中...</p>
      </div>
      <template #footer>
        <div class="export-dialog__footer">
          <el-button @click="showExportDialog = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'
import statsApi from '@/api/stats'
import type { StatisticsData } from '@/api/stats'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const showExportDialog = ref(false)
const statisticsData = ref<StatisticsData>()
const statusChartRef = ref<HTMLDivElement>()
let statusChart: echarts.ECharts | null = null

// 格式化字数显示
const formatWordCount = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

// 初始化状态图表
const initStatusChart = () => {
  if (!statusChartRef.value || !statisticsData.value) return

  try {
    statusChart = echarts.init(statusChartRef.value)

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
          data: [
            { value: statisticsData.value.finishedBooks, name: '已读完' },
            { value: statisticsData.value.readingBooks, name: '阅读中' },
            { value: statisticsData.value.unreadBooks, name: '未读' }
          ]
        }
      ]
    }

    statusChart.setOption(option)
  } catch (error) {
    console.error('状态图表初始化失败:', error)
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  loading.value = true
  try {
    console.log('开始获取统计数据...')
    const response = await statsApi.getOverview()
    console.log('统计数据响应:', response)

    if (response.success && response.data) {
      statisticsData.value = response.data
      console.log('统计数据获取成功:', statisticsData.value)

      // 等待DOM更新后初始化图表
      await nextTick()
      setTimeout(() => {
        initStatusChart()
      }, 100)
    } else {
      ElMessage.error(response.error || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  await fetchStatistics()
  ElMessage.success('数据已刷新')
}

// 生命周期
onMounted(() => {
  console.log('Statistics组件已挂载')
  fetchStatistics()
})
</script>

<style scoped>
.statistics {
  @apply p-6 space-y-6 max-w-7xl mx-auto;
}

/* 页面头部 */
.statistics__header {
  @apply flex items-center justify-between mb-8;
}

.statistics__title h1 {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.statistics__subtitle {
  @apply text-gray-600 text-lg;
}

/* 总体统计卡片区域 */
.statistics__overview {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8;
}

.stat-card {
  @apply bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow;
}

.stat-card h3 {
  @apply text-sm font-medium text-gray-600 mb-2;
}

.stat-card .value {
  @apply text-2xl font-bold text-gray-900 mb-1;
}

.stat-card .unit {
  @apply text-xs text-gray-500;
}

/* 图表区域 */
.statistics__charts {
  @apply space-y-8;
}

.chart-container {
  @apply bg-white rounded-lg shadow-sm border border-gray-100 p-6;
}

.chart-container h3 {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

/* 加载状态 */
.statistics__loading {
  @apply bg-white rounded-lg shadow-sm border border-gray-100 p-6;
}

/* 空状态 */
.statistics__empty {
  @apply flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border border-gray-100;
}

.statistics__empty-tip {
  @apply text-sm text-gray-500 mt-2;
}

/* 导出对话框 */
.export-dialog__content {
  @apply space-y-4;
}

.export-dialog__footer {
  @apply flex justify-end space-x-3;
}
</style>