<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ElSteps,
  ElStep,
  ElCard,
  ElButton,
  ElProgress,
  ElMessage,
  ElMessageBox,
  ElUpload,
  ElImage
} from 'element-plus'
import { Document, Upload, Picture } from '@element-plus/icons-vue'
import { useTxtToEpubStore } from '../stores/txtToEpub'
import ChapterRuleConfig from '../components/ChapterRuleConfig.vue'
import ChapterEditor from '../components/ChapterEditor.vue'
import BookInfoForm from '../components/BookInfoForm.vue'

const store = useTxtToEpubStore()

const currentStep = ref(0)
const bookInfoFormRef = ref<InstanceType<typeof BookInfoForm> | null>(null)

// 步骤配置
const steps = [
  { title: '选择文件', description: '选择要转换的 TXT 文件' },
  { title: '配置规则', description: '配置章节划分规则' },
  { title: '编辑章节', description: '编辑章节信息' },
  { title: '书籍信息', description: '填写书籍元数据' },
  { title: '上传封面', description: '上传封面图片（可选）' }
]

// 计算属性
const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 0:
      return !!store.filePath
    case 1:
      return store.chapters.length > 0
    case 2:
      return store.chapters.length > 0
    case 3:
      return !!store.metadata.title
    case 4:
      return true
    default:
      return false
  }
})

// 选择文件
async function handleSelectFile() {
  try {
    await store.selectTxtFile()
    if (store.filePath) {
      currentStep.value = 1
    }
  } catch (error) {
    // 错误已在 store 中处理
  }
}

// 下一步
async function handleNext() {
  // 从步骤1（配置规则）进入步骤2（编辑章节）时，自动解析章节
  if (currentStep.value === 1) {
    try {
      // 确保规则已从 localStorage 加载（如果用户修改了规则但还没保存）
      const savedRule = localStorage.getItem('txtToEpub_chapterRule')
      if (savedRule) {
        try {
          const rule = JSON.parse(savedRule) as any
          if (rule.additionalRules && rule.additionalRules.trim() === '') {
            rule.additionalRules = '序言|序卷|序[1-9]|序曲|楔子|前言|后记|尾声|番外|最终章'
          }
          store.chapterRule = rule
        } catch (error) {
          console.warn('加载规则失败:', error)
        }
      }
      
      // 等待规则同步完成
      await new Promise(resolve => setTimeout(resolve, 0))
      
      await store.parseChapters()
      if (store.chapters.length === 0) {
        ElMessage.warning('未找到匹配的章节，请检查规则配置')
        return
      }
    } catch (error) {
      // 错误已在 store 中处理
      return
    }
  }

  if (currentStep.value === 3) {
    // 验证表单
    if (bookInfoFormRef.value) {
      const isValid = bookInfoFormRef.value.validate()
      if (!isValid) {
        ElMessage.warning('请填写完整的书籍信息')
        return
      }
    }
  }

  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

// 上一步
function handlePrev() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 跳转到指定步骤
function goToStep(step: number) {
  if (step <= currentStep.value || canAccessStep(step)) {
    currentStep.value = step
  }
}

// 判断是否可以访问指定步骤
function canAccessStep(step: number): boolean {
  switch (step) {
    case 0:
      return true
    case 1:
      return !!store.filePath
    case 2:
      return store.chapters.length > 0
    case 3:
      return store.chapters.length > 0
    case 4:
      return !!store.metadata.title
    default:
      return false
  }
}

// 选择封面
async function handleSelectCover() {
  try {
    await store.selectCoverImage()
  } catch (error) {
    // 错误已在 store 中处理
  }
}

// 开始转换
async function handleConvert() {
  try {
    // 验证表单
    if (bookInfoFormRef.value) {
      const isValid = bookInfoFormRef.value.validate()
      if (!isValid) {
        ElMessage.warning('请填写完整的书籍信息')
        return
      }
    }

    // 生成 EPUB
    const epubPath = await store.generateEpub()

    // 保存 EPUB
    await store.saveEpub(epubPath)

    ElMessageBox.confirm('EPUB 文件已生成并保存，是否重新开始？', '转换完成', {
      type: 'success',
      confirmButtonText: '重新开始',
      cancelButtonText: '关闭'
    })
      .then(() => {
        handleReset()
      })
      .catch(() => {
        // 用户选择关闭
      })
  } catch (error: any) {
    if (error.message !== '未选择保存位置') {
      ElMessage.error(error.message || '转换失败')
    }
  }
}

// 重置
function handleReset() {
  store.reset()
  currentStep.value = 0
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<template>
  <div class="txt-to-epub">
    <div class="page-header">
      <h1>TXT 转 EPUB</h1>
      <p class="subtitle">将 TXT 文件转换为 EPUB 格式电子书</p>
    </div>

    <!-- 步骤指示器 -->
    <el-card class="steps-card">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step
          v-for="(step, index) in steps"
          :key="index"
          :title="step.title"
          :description="step.description"
          @click="goToStep(index)"
          style="cursor: pointer"
        />
      </el-steps>
    </el-card>

    <!-- 步骤内容 -->
    <el-card class="content-card">
      <!-- 步骤 1: 选择文件 -->
      <div v-if="currentStep === 0" class="step-content">
        <div class="file-selector">
          <el-button type="primary" size="large" :icon="Upload" @click="handleSelectFile">
            选择 TXT 文件
          </el-button>
          <div v-if="store.filePath" class="file-info">
            <div class="info-item">
              <span class="label">文件名：</span>
              <span class="value">{{ store.fileName }}</span>
            </div>
            <div class="info-item">
              <span class="label">文件编码：</span>
              <span class="value">{{ store.fileEncoding }}</span>
            </div>
            <div class="info-item">
              <span class="label">文件路径：</span>
              <span class="value path">{{ store.filePath }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 2: 配置规则 -->
      <div v-if="currentStep === 1" class="step-content">
        <ChapterRuleConfig />
      </div>

      <!-- 步骤 3: 编辑章节 -->
      <div v-if="currentStep === 2" class="step-content">
        <ChapterEditor />
      </div>

      <!-- 步骤 4: 书籍信息 -->
      <div v-if="currentStep === 3" class="step-content">
        <BookInfoForm ref="bookInfoFormRef" />
      </div>

      <!-- 步骤 5: 上传封面 -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="cover-upload">
          <el-button type="primary" :icon="Picture" @click="handleSelectCover">
            选择封面图片
          </el-button>
          <div v-if="store.coverDataUrl" class="cover-preview">
            <el-image :src="store.coverDataUrl" fit="contain" style="max-width: 300px; max-height: 400px" />
          </div>
          <div class="cover-hint">
            <p>建议尺寸：600x800 像素（3:4 比例）</p>
            <p>支持格式：JPG、PNG、WebP</p>
            <p>如果不上传封面，将使用默认封面</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button v-if="currentStep > 0" @click="handlePrev">上一步</el-button>
      <el-button
        v-if="currentStep < steps.length - 1"
        type="primary"
        :disabled="!canGoNext"
        @click="handleNext"
      >
        下一步
      </el-button>
      <el-button
        v-if="currentStep === steps.length - 1"
        type="primary"
        :loading="store.isConverting"
        :disabled="!canGoNext || store.isConverting"
        @click="handleConvert"
      >
        {{ store.isConverting ? '转换中...' : '开始转换' }}
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 转换进度 -->
    <el-card v-if="store.isConverting && store.conversionProgress" class="progress-card">
      <div class="progress-info">
        <div class="progress-message">{{ store.conversionProgress.message }}</div>
        <el-progress :percentage="store.conversionProgress.progress" :status="undefined" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.txt-to-epub {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.steps-card {
  margin-bottom: 24px;
}

.content-card {
  margin-bottom: 24px;
  min-height: 400px;
}

.step-content {
  padding: 20px;
}

.file-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.file-info {
  width: 100%;
  max-width: 600px;
  padding: 16px;
  background: var(--color-bg-soft);
  border-radius: 8px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 100px;
}

.info-item .value {
  color: var(--color-text-primary);
  word-break: break-all;
}

.info-item .value.path {
  font-family: monospace;
  font-size: 12px;
}

.cover-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.cover-preview {
  margin: 20px 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 8px;
  background: var(--color-bg-soft);
}

.cover-hint {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.cover-hint p {
  margin: 4px 0;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.progress-card {
  margin-top: 24px;
}

.progress-info {
  padding: 16px;
}

.progress-message {
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
}
</style>

