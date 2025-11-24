<template>
  <div class="base-chart" :class="{ 'base-chart--loading': loading }">
    <!-- 加载状态 -->
    <div v-if="loading" class="base-chart__loading">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span class="base-chart__loading-text">加载中...</span>
    </div>

    <!-- 图表容器 -->
    <div v-show="!loading && data && data.length > 0" ref="chartRef" class="base-chart__container" :style="{ height }"></div>

    <!-- 空状态 -->
    <div v-if="!loading && (!data || data.length === 0)" class="base-chart__empty">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { useUIStore } from '@renderer/stores/ui'
import * as echarts from 'echarts'

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

interface Props {
  /** 图表数据 */
  data?: ChartData[]
  /** 图表高度 */
  height?: string
  /** 是否加载中 */
  loading?: boolean
  /** 图表标题 */
  title?: string
  /** 自定义图表选项 */
  options?: any
  /** 是否响应式调整大小 */
  responsive?: boolean
  /** 主题颜色（数组） */
  colors?: string[]
  /** 图表类型 */
  chartType?: 'pie' | 'bar'
  /** 饼图类型：normal 或 ring */
  pieType?: 'normal' | 'ring'
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 柱状图方向：horizontal 或 vertical */
  orientation?: 'horizontal' | 'vertical'
  /** 是否显示标签 */
  showLabel?: boolean
  /** Y轴名称 */
  yAxisName?: string
  /** X轴名称 */
  xAxisName?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  loading: false,
  responsive: true,
  chartType: 'pie',
  pieType: 'normal',
  showPercentage: true,
  orientation: 'vertical',
  showLabel: false,
  colors: () => [
    '#3B82F6', // 蓝色
    '#10B981', // 绿色
    '#F59E0B', // 黄色
    '#EF4444', // 红色
    '#8B5CF6', // 紫色
    '#EC4899', // 粉色
    '#14B8A6', // 青色
    '#F97316'  // 橙色
  ]
})

const emit = defineEmits<{
  chartReady: [chartInstance: echarts.ECharts]
  chartClick: [params: any]
  chartResize: []
}>()

// 响应式数据
const chartRef = ref<HTMLElement>()
const chartInstance = ref<echarts.ECharts>()
const uiStore = useUIStore()

// 获取基础图表配置
const getBaseOptions = (): echarts.EChartsOption => {
  const isDark = uiStore.theme === 'dark'

  const baseConfig = {
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#E5E7EB' : '#374151'
    },
    title: {
      text: props.title,
      textStyle: {
        color: isDark ? '#E5E7EB' : '#374151',
        fontSize: 16,
        fontWeight: 500
      },
      left: 'center',
      top: 0
    },
    tooltip: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderColor: isDark ? '#374151' : '#E5E7EB',
      textStyle: {
        color: isDark ? '#E5E7EB' : '#374151'
      },
      borderWidth: 1,
      padding: [8, 12],
      borderRadius: 6
    },
    color: props.colors
  }

  // 根据图表类型返回特定配置
  if (props.chartType === 'pie') {
    return {
      ...baseConfig,
      legend: {
        textStyle: {
          color: isDark ? '#E5E7EB' : '#374151'
        },
        orient: 'vertical',
        right: '10%',
        top: 'center'
      },
      series: getPieSeries()
    }
  } else if (props.chartType === 'bar') {
    return {
      ...baseConfig,
      legend: {
        show: false
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: props.title ? 60 : 20,
        containLabel: true
      },
      xAxis: {
        type: props.orientation === 'horizontal' ? 'value' : 'category',
        data: props.orientation === 'vertical' ? props.data?.map(item => item.name) : undefined,
        name: props.orientation === 'vertical' ? props.xAxisName : props.yAxisName,
        nameTextStyle: {
          color: isDark ? '#E5E7EB' : '#374151'
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#E5E7EB'
          }
        },
        axisTick: {
          lineStyle: {
            color: isDark ? '#374151' : '#E5E7EB'
          }
        },
        axisLabel: {
          color: isDark ? '#E5E7EB' : '#374151'
        }
      },
      yAxis: {
        type: props.orientation === 'horizontal' ? 'category' : 'value',
        data: props.orientation === 'horizontal' ? props.data?.map(item => item.name) : undefined,
        name: props.orientation === 'horizontal' ? props.xAxisName : props.yAxisName,
        nameTextStyle: {
          color: isDark ? '#E5E7EB' : '#374151'
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#E5E7EB'
          }
        },
        axisTick: {
          lineStyle: {
            color: isDark ? '#374151' : '#E5E7EB'
          }
        },
        axisLabel: {
          color: isDark ? '#E5E7EB' : '#374151'
        }
      },
      series: getBarSeries()
    }
  }

  return baseConfig
}

// 获取饼图系列配置
const getPieSeries = () => {
  if (!props.data || props.data.length === 0) return []

  const series: any = {
    type: 'pie',
    radius: props.pieType === 'ring' ? ['40%', '70%'] : '70%',
    center: ['35%', '50%'],
    data: props.data,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    label: {
      show: true,
      position: 'outside' as const,
      formatter: (params: any) => {
        const { name, percent } = params
        if (props.showPercentage) {
          return `${name}: ${percent}%`
        }
        return name
      },
      color: () => {
        const isDark = uiStore.theme === 'dark'
        return isDark ? '#E5E7EB' : '#374151'
      }
    },
    labelLine: {
      show: true,
      lineStyle: {
        color: () => {
          const isDark = uiStore.theme === 'dark'
          return isDark ? '#374151' : '#E5E7EB'
        }
      }
    }
  }

  return [series]
}

// 获取柱状图系列配置
const getBarSeries = () => {
  if (!props.data || props.data.length === 0) return []

  const series: any = {
    type: 'bar',
    data: props.data,
    barWidth: '60%',
    itemStyle: {
      borderRadius: props.orientation === 'horizontal' ? [0, 4, 4, 0] : [4, 4, 0, 0],
      color: (params: any) => {
        return props.colors[params.dataIndex % props.colors.length]
      }
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      }
    },
    label: {
      show: props.showLabel,
      position: props.orientation === 'horizontal' ? 'right' : 'top',
      color: () => {
        const isDark = uiStore.theme === 'dark'
        return isDark ? '#E5E7EB' : '#374151'
      },
      formatter: (params: any) => {
        return params.value
      }
    }
  }

  return [series]
}

// 初始化图表
const initChart = async () => {
  if (!chartRef.value) return

  await nextTick()

  // 销毁已存在的图表实例
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  // 创建新的图表实例
  chartInstance.value = echarts.init(chartRef.value)

  // 设置图表配置
  const options = getBaseOptions()
  chartInstance.value.setOption(options)

  // 绑定事件
  chartInstance.value.on('click', (params) => {
    emit('chartClick', params)
  })

  // 发出图表就绪事件
  emit('chartReady', chartInstance.value)
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance.value) return

  const options = getBaseOptions()
  chartInstance.value.setOption(options, true) // true 表示不合并，完全替换
}

// 调整图表大小
const resizeChart = () => {
  if (chartInstance.value && props.responsive) {
    chartInstance.value.resize()
    emit('chartResize')
  }
}

// 设置图表主题
const setChartTheme = () => {
  if (chartInstance.value) {
    const baseOptions = getBaseOptions()
    chartInstance.value.setOption(baseOptions)
  }
}

// 监听数据变化
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

// 监听选项变化
watch(() => props.options, () => {
  updateChart()
}, { deep: true })

// 监听主题变化
watch(() => uiStore.theme, () => {
  setChartTheme()
})

// 监听加载状态
watch(() => props.loading, (loading) => {
  if (!loading && chartRef.value) {
    initChart()
  }
})

// 窗口大小变化监听
let resizeObserver: ResizeObserver | null = null

// 生命周期
onMounted(async () => {
  await initChart()

  // 监听容器大小变化
  if (props.responsive && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(resizeChart)
    if (chartRef.value) {
      resizeObserver.observe(chartRef.value)
    }
  }

  // 监听窗口大小变化
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  // 清理图表实例
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = undefined
  }

  // 清理监听器
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  window.removeEventListener('resize', resizeChart)
})

// 暴露方法给父组件
defineExpose({
  getChartInstance: () => chartInstance.value,
  resize: resizeChart,
  update: updateChart
})
</script>

<style scoped>
.base-chart {
  @apply relative w-full;
}

.base-chart--loading {
  @apply min-h-[200px] flex items-center justify-center;
}

.base-chart__loading {
  @apply flex flex-col items-center justify-center space-y-2 text-gray-500;
}

.base-chart__loading-text {
  @apply text-sm;
}

.base-chart__container {
  @apply w-full;
}

.base-chart__empty {
  @apply flex items-center justify-center min-h-[200px];
}

/* 主题相关样式 */
:deep(.el-icon) {
  @apply text-2xl;
}

:deep(.el-empty) {
  @apply py-8;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .base-chart__container {
    @apply min-h-[250px];
  }
}
</style>