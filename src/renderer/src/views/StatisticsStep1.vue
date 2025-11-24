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

    <!-- 简单的统计内容 -->
    <div class="statistics__content">
      <p>如果您能看到这些按钮，说明Element Plus组件正常工作</p>

      <!-- 空状态 -->
      <div v-if="!hasData" class="statistics__empty">
        <el-empty description="暂无统计数据" :image-size="200">
          <template #description>
            <p>您还没有添加任何书籍</p>
            <p class="statistics__empty-tip">添加书籍后即可查看详细的统计信息</p>
          </template>
          <el-button type="primary">添加书籍</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const hasData = ref(false)

console.log('Statistics组件已加载')
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

/* 空状态 */
.statistics__empty {
  @apply flex items-center justify-center min-h-[400px];
}

.statistics__empty-tip {
  @apply text-sm text-gray-500 mt-2;
}
</style>