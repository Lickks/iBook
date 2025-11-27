<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElRadioGroup, ElRadio, ElCheckbox, ElSelect, ElOption, ElInput, ElButton, ElMessage } from 'element-plus'
import { useTxtToEpubStore } from '../stores/txtToEpub'
import type { ChapterRule } from '../types/txtToEpub'

const store = useTxtToEpubStore()

const rule = ref<ChapterRule>({ ...store.chapterRule })

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

// 监听规则变化，同步到 store
watch(
  rule,
  (newRule) => {
    // 创建一个完全干净的纯对象，确保可序列化
    store.chapterRule = {
      mode: newRule.mode,
      allowLeadingSpaces: newRule.allowLeadingSpaces,
      ordinalPrefix: newRule.ordinalPrefix,
      numberType: newRule.numberType,
      chapterMarker: newRule.chapterMarker,
      additionalRules: newRule.additionalRules,
      regex: newRule.regex
    }
  },
  { deep: true }
)

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
  padding: 20px;
  background: var(--color-bg);
  border-radius: 8px;
}

.mode-selector {
  margin-bottom: 20px;
}

.rule-item {
  margin-bottom: 16px;
}

.rule-item label {
  display: inline-block;
  width: 120px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.rule-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-error);
}

.success-message {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-success);
}

.template-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.rule-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.test-results {
  margin-top: 20px;
  padding: 12px;
  background: var(--color-bg-soft);
  border-radius: 4px;
}

.test-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.match-list {
  margin: 0;
  padding-left: 20px;
  color: var(--color-text-secondary);
}

.match-list li {
  margin-bottom: 4px;
}
</style>

