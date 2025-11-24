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
            @click="testAPI"
            :loading="loading"
          >
            测试API
          </el-button>
          <el-button
            @click="refreshData"
            :loading="loading"
          >
            刷新
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- API测试结果 -->
    <div class="statistics__content">
      <div v-if="loading" class="loading-section">
        <p>正在加载统计数据...</p>
      </div>

      <div v-else-if="apiError" class="error-section">
        <p>❌ API调用失败：</p>
        <pre>{{ apiError }}</pre>
      </div>

      <div v-else-if="apiData" class="success-section">
        <p>✅ API调用成功！</p>
        <div class="data-preview">
          <h3>数据预览：</h3>
          <pre>{{ JSON.stringify(apiData, null, 2) }}</pre>
        </div>
      </div>

      <div v-else class="initial-section">
        <p>点击"测试API"按钮来测试统计数据接口</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const apiData = ref<any>(null)
const apiError = ref<string>('')

// 测试API调用
const testAPI = async () => {
  loading.value = true
  apiError.value = ''
  apiData.value = null

  try {
    console.log('开始调用统计API...')

    // 检查API对象是否存在
    if (!window.api || !window.api.stats) {
      throw new Error('window.api.stats 不存在')
    }

    console.log('API对象存在，开始调用getOverview...')

    const response = await window.api.stats.getOverview()
    console.log('API响应:', response)

    if (response.success && response.data) {
      apiData.value = response.data
      ElMessage.success('统计API调用成功')
    } else {
      throw new Error(response.error || 'API返回失败')
    }
  } catch (error) {
    console.error('统计API调用失败:', error)
    apiError.value = error instanceof Error ? error.message : '未知错误'
    ElMessage.error('统计API调用失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  apiData.value = null
  apiError.value = ''
  testAPI()
}
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

.loading-section,
.error-section,
.success-section,
.initial-section {
  @apply p-4;
}

.error-section {
  @apply bg-red-50 border border-red-200 rounded;
}

.success-section {
  @apply bg-green-50 border border-green-200 rounded;
}

.data-preview {
  @apply mt-4 p-4 bg-gray-50 rounded overflow-auto max-h-96;
}

pre {
  @apply text-sm text-gray-700;
}
</style>