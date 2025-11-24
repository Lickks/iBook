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
          <el-button type="primary">导出数据</el-button>
          <el-button>刷新</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 测试ECharts -->
    <div class="statistics__content">
      <p>测试ECharts图表组件：</p>
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  console.log('初始化ECharts图表')

  try {
    chartInstance = echarts.init(chartRef.value)

    const option = {
      title: {
        text: '测试图表'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '测试数据',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: '测试项1' },
            { value: 735, name: '测试项2' },
            { value: 580, name: '测试项3' },
            { value: 484, name: '测试项4' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }

    chartInstance.setOption(option)
    console.log('ECharts图表初始化成功')
  } catch (error) {
    console.error('ECharts初始化失败:', error)
  }
}

onMounted(() => {
  // 延迟初始化，确保DOM已渲染
  setTimeout(() => {
    initChart()
  }, 100)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
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

/* 内容区域 */
.statistics__content {
  @apply bg-white rounded-lg shadow-sm border border-gray-100 p-6;
}
</style>