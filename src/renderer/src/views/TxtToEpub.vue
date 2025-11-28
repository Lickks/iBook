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
      // 确保文件内容已加载
      if (!store.fileContent) {
        if (store.filePath) {
          ElMessage.info('正在加载文件内容，请稍候...')
          // 等待文件内容加载完成（最多等待5秒）
          let waitCount = 0
          while (!store.fileContent && waitCount < 50) {
            await new Promise(resolve => setTimeout(resolve, 100))
            waitCount++
          }
          if (!store.fileContent) {
            ElMessage.warning('文件加载超时，请重试')
            return
          }
        } else {
          ElMessage.warning('请先选择文件')
          return
        }
      }

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

    ElMessage.success('EPUB 文件已生成并保存')
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
      <h1>格式转换</h1>
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
          class="step-item"
        />
      </el-steps>
    </el-card>

    <!-- 步骤内容 -->
    <el-card class="content-card">
      <transition name="fade-slide" mode="out-in">
        <!-- 步骤 1: 选择文件 -->
        <div v-if="currentStep === 0" key="step-0" class="step-content">
          <div class="file-selector">
            <el-button type="primary" size="large" :icon="Upload" @click="handleSelectFile">
              选择 TXT 文件
            </el-button>
            <transition name="slide-up">
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
            </transition>
          </div>
        </div>

        <!-- 步骤 2: 配置规则 -->
        <div v-else-if="currentStep === 1" key="step-1" class="step-content">
          <ChapterRuleConfig />
        </div>

        <!-- 步骤 3: 编辑章节 -->
        <div v-else-if="currentStep === 2" key="step-2" class="step-content">
          <ChapterEditor />
        </div>

        <!-- 步骤 4: 书籍信息 -->
        <div v-else-if="currentStep === 3" key="step-3" class="step-content">
          <BookInfoForm ref="bookInfoFormRef" />
        </div>

        <!-- 步骤 5: 上传封面 -->
        <div v-else-if="currentStep === 4" key="step-4" class="step-content">
          <div class="cover-upload">
            <el-button type="primary" :icon="Picture" @click="handleSelectCover">
              选择封面图片
            </el-button>
            <transition name="scale-fade">
              <div v-if="store.coverDataUrl" class="cover-preview">
                <el-image :src="store.coverDataUrl" fit="contain" style="max-width: 300px; max-height: 400px" />
              </div>
            </transition>
            <div class="cover-hint">
              <p>建议尺寸：600x800 像素（3:4 比例）</p>
              <p>支持格式：JPG、PNG、WebP</p>
              <p>如果不上传封面，将使用默认封面</p>
            </div>
          </div>
        </div>
      </transition>
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
  padding: 32px 24px;
  background: transparent;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
  padding: 24px 0;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 15px;
  color: var(--el-text-color-secondary);
  margin: 0;
  opacity: 0.8;
}

.steps-card {
  margin-bottom: 24px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

.dark .steps-card {
  background: var(--color-bg-soft);
  border-color: var(--color-border);
}

:deep(.steps-card .el-card__body) {
  padding: 24px;
}

:deep(.el-steps) {
  padding: 0;
}

:deep(.el-step__head) {
  transition: all 0.3s ease;
}

:deep(.step-item) {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
}

:deep(.step-item:hover) {
  background: var(--el-fill-color-lighter);
}

.dark :deep(.step-item:hover) {
  background: rgba(64, 158, 255, 0.1);
}

:deep(.el-step__head.is-process) {
  color: var(--el-color-primary);
}

:deep(.el-step__head.is-process .el-step__icon) {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
  box-shadow: 0 0 0 4px var(--el-color-primary-light-9);
}

:deep(.el-step__head.is-finish .el-step__icon) {
  border-color: var(--el-color-success);
  background: var(--el-color-success);
}

:deep(.el-step__head.is-finish .el-step__icon-inner) {
  color: #fff;
}

:deep(.el-step__title) {
  font-weight: 500;
  font-size: 14px;
  transition: color 0.3s ease;
}

:deep(.el-step__title.is-process) {
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.el-step__description) {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

:deep(.el-step__description.is-process) {
  opacity: 1;
  color: var(--el-text-color-regular);
}

.content-card {
  margin-bottom: 24px;
  min-height: 400px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color-page);
  transition: box-shadow 0.3s ease;
}

.dark .content-card {
  background: var(--color-bg-soft);
  border-color: var(--color-border);
}

.content-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

:deep(.content-card .el-card__body) {
  padding: 0;
}

.step-content {
  padding: 32px;
}

.file-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 20px 0;
}

.file-selector :deep(.el-button) {
  padding: 14px 32px;
  font-size: 15px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.file-selector :deep(.el-button:hover) {
  transform: translateY(-1px);
}

.file-info {
  width: 100%;
  max-width: 600px;
  padding: 20px 24px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.dark .file-info {
  background: var(--color-surface);
  border-color: var(--color-border);
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.info-item .label {
  font-weight: 500;
  color: var(--el-text-color-regular);
  min-width: 100px;
  font-size: 14px;
}

.info-item .value {
  color: var(--el-text-color-primary);
  word-break: break-all;
  font-size: 14px;
  flex: 1;
}

.info-item .value.path {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  padding: 4px 8px;
  border-radius: 4px;
}

.cover-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px 0;
}

.cover-upload :deep(.el-button) {
  padding: 14px 32px;
  font-size: 15px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.cover-upload :deep(.el-button:hover) {
  transform: translateY(-1px);
}

.cover-preview {
  margin: 20px 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 12px;
  background: var(--el-bg-color-page);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.dark .cover-preview {
  background: var(--color-surface);
  border-color: var(--color-border);
}

.cover-preview:hover {
  border-color: var(--el-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.cover-hint {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.8;
  opacity: 0.8;
}

.cover-hint p {
  margin: 6px 0;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 20px 0;
}

.action-bar :deep(.el-button) {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-bar :deep(.el-button--primary:hover:not(:disabled)) {
  transform: translateY(-1px);
}

.progress-card {
  margin-top: 24px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: var(--el-bg-color-page);
}

.dark .progress-card {
  background: var(--color-bg-soft);
  border-color: var(--color-border);
}

:deep(.progress-card .el-card__body) {
  padding: 24px;
}

.progress-info {
  padding: 0;
}

.progress-message {
  margin-bottom: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

:deep(.el-progress-bar__outer) {
  border-radius: 10px;
  background-color: var(--el-fill-color);
}

:deep(.el-progress-bar__inner) {
  border-radius: 10px;
}

/* 步骤切换动画 */
.fade-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.55, 0.2);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 文件信息显示动画 */
.slide-up-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* 封面预览动画 */
.scale-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.scale-fade-enter-to {
  opacity: 1;
  transform: scale(1);
}

/* 卡片进入动画 */
.steps-card,
.content-card {
  animation: cardFadeIn 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮点击动画 */
.action-bar :deep(.el-button),
.file-selector :deep(.el-button),
.cover-upload :deep(.el-button) {
  position: relative;
  overflow: hidden;
}

.action-bar :deep(.el-button::after),
.file-selector :deep(.el-button::after),
.cover-upload :deep(.el-button::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-bar :deep(.el-button:active::after),
.file-selector :deep(.el-button:active::after),
.cover-upload :deep(.el-button:active::after) {
  width: 300px;
  height: 300px;
}

/* 进度条动画 */
.progress-card {
  animation: slideDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

