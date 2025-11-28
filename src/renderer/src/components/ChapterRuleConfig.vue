<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElRadioGroup, ElRadio, ElCheckbox, ElSelect, ElOption, ElInput, ElButton, ElMessage } from 'element-plus'
import { useTxtToEpubStore } from '../stores/txtToEpub'
import type { ChapterRule } from '../types/txtToEpub'

const store = useTxtToEpubStore()

// localStorage 键名
const STORAGE_KEY = 'txtToEpub_chapterRule'

// 预设的附加规则
const PRESET_ADDITIONAL_RULES = '序言|序卷|序[1-9]|序曲|楔子|前言|后记|尾声|番外|最终章|引子|引言|导言|跋|附记|补记|附录|外传|别传|前篇|后篇'

// 从 localStorage 加载规则
function loadRuleFromStorage(): ChapterRule | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as ChapterRule
    }
  } catch (error) {
    console.warn('加载保存的规则失败:', error)
  }
  return null
}

// 保存规则到 localStorage
function saveRuleToStorage(rule: ChapterRule) {
  try {
    const serializableRule: ChapterRule = {
      mode: rule.mode,
      allowLeadingSpaces: rule.allowLeadingSpaces,
      ordinalPrefix: rule.ordinalPrefix,
      numberType: rule.numberType,
      chapterMarker: rule.chapterMarker,
      additionalRules: rule.additionalRules,
      regex: rule.regex
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableRule))
  } catch (error) {
    console.warn('保存规则失败:', error)
  }
}

// 初始化规则：优先使用保存的规则，否则使用 store 中的规则
const savedRule = loadRuleFromStorage()
const initialRule = savedRule || { ...store.chapterRule }

// 如果附加规则为空（无论是从保存的规则还是 store 中加载），自动填入预设值
// 但如果用户之前保存的规则中有附加规则（不为空），则使用保存的值
if (!initialRule.additionalRules || initialRule.additionalRules.trim() === '') {
  initialRule.additionalRules = PRESET_ADDITIONAL_RULES
}

const rule = ref<ChapterRule>(initialRule)

// 正则表达式相关
const regexInput = ref(rule.value.regex || '')
const regexError = ref('')
const regexMatches = ref<string[]>([])
const showRegexTest = ref(false)

// 常用正则表达式模板
const regexTemplates = [
  { label: '中文数字章节', value: '^\\s*第[一二三四五六七八九十百千万]+章' },
  { label: '阿拉伯数字章节', value: '^\\s*第\\d+章' },
  { label: '英文章节', value: '^\\s*Chapter\\s*\\d+' },
  { label: '混合格式', value: '^\\s*第\\d+[章节回卷]' },
  { label: '无前缀章节', value: '^\\s*第\\d+[章节回卷]' }
]

// 监听规则变化，同步到 store 并保存到 localStorage
watch(
  rule,
  (newRule) => {
    // 创建一个完全干净的纯对象，确保可序列化
    const cleanRule: ChapterRule = {
      mode: newRule.mode,
      allowLeadingSpaces: newRule.allowLeadingSpaces,
      ordinalPrefix: newRule.ordinalPrefix,
      numberType: newRule.numberType,
      chapterMarker: newRule.chapterMarker,
      additionalRules: newRule.additionalRules,
      regex: newRule.regex
    }
    store.chapterRule = cleanRule
    // 保存到 localStorage
    saveRuleToStorage(cleanRule)
  },
  { deep: true }
)

// 组件挂载时，如果 store 中有规则但 localStorage 中没有，则保存当前规则
onMounted(() => {
  if (!savedRule && store.chapterRule.mode) {
    saveRuleToStorage(store.chapterRule)
  }
})

// 监听模式切换
watch(
  () => rule.value.mode,
  (newMode) => {
    if (newMode === 'regex') {
      regexInput.value = rule.value.regex || ''
    }
  }
)

// 验证正则表达式
async function validateRegexInput() {
  if (!regexInput.value.trim()) {
    regexError.value = ''
    return
  }

  const result = await store.validateRegex(regexInput.value)
  if (result.valid) {
    regexError.value = ''
    rule.value.regex = regexInput.value
  } else {
    regexError.value = result.error || '正则表达式语法错误'
  }
}

// 测试正则表达式
async function testRegex() {
  if (!regexInput.value.trim()) {
    ElMessage.warning('请输入正则表达式')
    return
  }

  try {
    const matches = await store.testRegex(regexInput.value)
    regexMatches.value = matches
    showRegexTest.value = true

    if (matches.length === 0) {
      ElMessage.warning('未找到匹配的章节标题')
    } else {
      ElMessage.success(`找到 ${matches.length} 个匹配项`)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '测试失败')
  }
}

// 应用模板
function applyTemplate(template: string) {
  regexInput.value = template
  validateRegexInput()
}

// 解析章节（当规则变化时）
async function handleParse() {
  // 确保规则已同步到 store
  const cleanRule: ChapterRule = {
    mode: rule.value.mode,
    allowLeadingSpaces: rule.value.allowLeadingSpaces,
    ordinalPrefix: rule.value.ordinalPrefix,
    numberType: rule.value.numberType,
    chapterMarker: rule.value.chapterMarker,
    additionalRules: rule.value.additionalRules,
    regex: rule.value.regex
  }
  store.chapterRule = cleanRule
  saveRuleToStorage(cleanRule)
  
  // 等待下一个 tick 确保规则已同步
  await new Promise(resolve => setTimeout(resolve, 0))
  
  await store.parseChapters()
}
</script>

<template>
  <div class="chapter-rule-config">
    <div class="mode-selector">
      <el-radio-group v-model="rule.mode">
        <el-radio label="simple">简易规则</el-radio>
        <el-radio label="regex">正则表达式</el-radio>
      </el-radio-group>
    </div>

    <!-- 简易规则模式 -->
    <div v-if="rule.mode === 'simple'" class="simple-rule">
      <div class="rule-item">
        <el-checkbox v-model="rule.allowLeadingSpaces">允许行首空格</el-checkbox>
      </div>

      <div class="rule-item">
        <label>序数词前缀：</label>
        <el-select v-model="rule.ordinalPrefix" style="width: 200px">
          <el-option label="第" value="第" />
          <el-option label="序" value="序" />
          <el-option label="卷" value="卷" />
          <el-option label="无" value="" />
          <el-option label="自定义" value="custom" />
        </el-select>
        <el-input
          v-if="rule.ordinalPrefix === 'custom'"
          v-model="rule.ordinalPrefix"
          placeholder="请输入序数词前缀"
          style="width: 200px; margin-left: 10px"
        />
      </div>

      <div class="rule-item">
        <label>数字类型：</label>
        <el-select v-model="rule.numberType" style="width: 200px">
          <el-option label="阿拉伯数字" value="arabic" />
          <el-option label="中文数字" value="chinese" />
          <el-option label="混合型数字" value="mixed" />
        </el-select>
      </div>

      <div class="rule-item">
        <label>章节标识：</label>
        <el-select v-model="rule.chapterMarker" style="width: 200px">
          <el-option label="章" value="章" />
          <el-option label="回" value="回" />
          <el-option label="卷" value="卷" />
          <el-option label="节" value="节" />
          <el-option label="集" value="集" />
          <el-option label="部" value="部" />
          <el-option label="章回卷节集部" value="章回卷节集部" />
          <el-option label="无" value="" />
          <el-option label="自定义" value="custom" />
        </el-select>
        <el-input
          v-if="rule.chapterMarker === 'custom'"
          v-model="rule.chapterMarker"
          placeholder="请输入章节标识"
          style="width: 200px; margin-left: 10px"
        />
      </div>

      <div class="rule-item">
        <label>附加规则：</label>
        <el-input
          v-model="rule.additionalRules"
          placeholder="例如：序卷|序[1-9]|序曲|楔子|前言|后记|尾声|番外|最终章"
          style="width: 100%"
        />
        <div class="rule-hint">使用 | 分隔多个规则，支持正则表达式语法</div>
      </div>

      <div class="rule-actions">
        <el-button type="primary" @click="handleParse">解析章节</el-button>
      </div>
    </div>

    <!-- 正则表达式模式 -->
    <div v-if="rule.mode === 'regex'" class="regex-rule">
      <div class="rule-item">
        <label>正则表达式：</label>
        <el-input
          v-model="regexInput"
          type="textarea"
          :rows="3"
          placeholder="请输入正则表达式，例如：^\\s*第\\d+章"
          @blur="validateRegexInput"
        />
        <div v-if="regexError" class="error-message">{{ regexError }}</div>
        <div v-else-if="regexInput && !regexError" class="success-message">正则表达式格式正确</div>
      </div>

      <div class="rule-item">
        <label>常用模板：</label>
        <div class="template-buttons">
          <el-button
            v-for="template in regexTemplates"
            :key="template.value"
            size="small"
            @click="applyTemplate(template.value)"
          >
            {{ template.label }}
          </el-button>
        </div>
      </div>

      <div class="rule-actions">
        <el-button type="primary" @click="testRegex">测试匹配</el-button>
        <el-button type="primary" @click="handleParse">解析章节</el-button>
      </div>

      <!-- 测试结果 -->
      <div v-if="showRegexTest && regexMatches.length > 0" class="test-results">
        <div class="test-title">匹配示例（前 5 个）：</div>
        <ul class="match-list">
          <li v-for="(match, index) in regexMatches" :key="index">{{ match }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chapter-rule-config {
  padding: 0;
  background: transparent;
}

.mode-selector {
  margin-bottom: 28px;
  padding: 16px 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.dark .mode-selector {
  background: var(--color-surface);
  border-color: var(--color-border);
}

:deep(.mode-selector .el-radio-group) {
  display: flex;
  gap: 16px;
}

:deep(.mode-selector .el-radio) {
  margin-right: 0;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.mode-selector .el-radio:hover) {
  background: var(--el-fill-color);
}

:deep(.mode-selector .el-radio.is-checked) {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.simple-rule,
.regex-rule {
  padding: 0;
}

.rule-item {
  margin-bottom: 20px;
}

.rule-item label {
  display: inline-block;
  width: 120px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 14px;
  margin-right: 12px;
}

.rule-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  opacity: 0.8;
  line-height: 1.6;
}

.error-message {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-color-error);
  padding: 6px 10px;
  background: var(--el-color-error-light-9);
  border-radius: 4px;
  border-left: 3px solid var(--el-color-error);
}

.success-message {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-color-success);
  padding: 6px 10px;
  background: var(--el-color-success-light-9);
  border-radius: 4px;
  border-left: 3px solid var(--el-color-success);
}

.template-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.template-buttons :deep(.el-button) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.template-buttons :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rule-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.rule-actions :deep(.el-button) {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.rule-actions :deep(.el-button--primary:hover) {
  transform: translateY(-1px);
}

.test-results {
  margin-top: 24px;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.dark .test-results {
  background: var(--color-surface);
  border-color: var(--color-border);
}

.test-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.match-list {
  margin: 0;
  padding-left: 24px;
  color: var(--el-text-color-regular);
  line-height: 2;
}

.match-list li {
  margin-bottom: 6px;
  font-size: 13px;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-textarea) {
  border-radius: 6px;
}

:deep(.el-checkbox) {
  font-size: 14px;
}

/* 规则项进入动画 */
.simple-rule,
.regex-rule {
  animation: fadeInUp 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 测试结果显示动画 */
.test-results {
  animation: slideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 按钮点击波纹效果 */
.rule-actions :deep(.el-button),
.template-buttons :deep(.el-button) {
  position: relative;
  overflow: hidden;
}

.rule-actions :deep(.el-button::before),
.template-buttons :deep(.el-button::before) {
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

.rule-actions :deep(.el-button:active::before),
.template-buttons :deep(.el-button:active::before) {
  width: 300px;
  height: 300px;
}
</style>

