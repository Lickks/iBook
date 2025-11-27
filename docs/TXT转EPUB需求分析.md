# TXT 转 EPUB 功能需求分析文档

## 1. 功能概述

### 1.1 功能定位
在 iBook 书籍管理应用中新增一个 TXT 转 EPUB 工具，允许用户将本地 TXT 文件转换为 EPUB 格式的电子书，并支持智能章节划分、章节预览、书籍信息填写和封面上传功能。

### 1.2 用户价值
- **格式转换**：将常见的 TXT 文本文件转换为标准 EPUB 格式，便于在各类电子书阅读器中阅读
- **智能分章**：通过正则表达式自动识别章节标题，减少手动分章的工作量
- **可视化预览**：在转换前预览章节划分结果，确保转换质量
- **信息完善**：支持填写书籍元数据（标题、作者、简介等）和上传封面，生成完整的 EPUB 文件

### 1.3 功能入口
- **导航位置**：侧边栏导航菜单（与"批量导入"、"标签管理"等并列）
- **路由路径**：`/txt-to-epub`
- **图标建议**：使用 `Document` 或 `Files` 相关图标

---

## 2. 功能流程

### 2.1 整体流程图
```
用户进入 TXT 转 EPUB 页面
    ↓
选择 TXT 文件
    ↓
配置章节划分规则（简易规则/正则表达式）
    ↓
自动划分章节并进入章节编辑界面
    ↓
编辑章节（调整标题、层级、删除/添加章节等）
    ↓
保存章节编辑
    ↓
填写书籍信息（标题、作者、简介等）
    ↓
上传封面（可选）
    ↓
执行转换，生成 EPUB 文件
    ↓
保存 EPUB 文件到本地
    ↓
（可选）将 EPUB 导入到书籍库
```

### 2.2 详细步骤说明

#### 步骤 1：文件选择
- 用户点击"选择文件"按钮
- 打开文件选择对话框，仅允许选择 `.txt` 文件
- 选择后显示文件信息（文件名、大小、路径预览）

#### 步骤 2：章节划分配置
- **简易规则模式**（默认）：
  - 行首空格：是否允许章节标题前有空格
  - 序数词前缀：下拉选择（第、序、卷等）
  - 数字类型：下拉选择（阿拉伯数字、中文数字、混合型数字等）
  - 章节标识：下拉选择（章、回、卷、节、集、部等）
  - 附加规则：可输入额外的章节标识（如：序卷|序[1-9]|序曲|楔子|前言|后记|尾声|番外|最终章）
  
- **正则表达式模式**：
  - 用户可直接输入正则表达式
  - 提供常用正则表达式模板选择
  - 实时验证正则表达式有效性
  - 显示匹配示例

#### 步骤 3：章节编辑
- 自动执行章节划分，显示章节编辑界面
- 章节列表表格显示：
  - 章节序号（自动编号）
  - 章节名称（双击可编辑）
  - 行号（章节在文件中的起始行号）
- 工具栏功能：
  - 标记短章节：设置行数阈值，自动标记内容过短的章节
  - 删除章节：删除选中的章节
  - 添加章节：在指定行号位置插入新章节
- 键盘快捷键操作：
  - Tab/Shift+Tab：调整章节层级
  - Enter：删除/恢复选中章节
  - Delete/Shift+Delete：删除/彻底删除选中章节
- 保存和取消：
  - 保存修改：保存所有编辑操作
  - 取消修改：放弃未保存的修改

#### 步骤 4：书籍信息填写
- **必填项**：
  - 书名
- **选填项**：
  - 作者
  - 简介/描述
  - 出版社
  - ISBN
  - 出版日期
  - 语言（默认：中文）
  - 分类/标签

#### 步骤 5：封面上传
- 支持选择本地图片文件（JPG、PNG、WebP）
- 支持图片预览和裁剪
- 建议尺寸：600x800 像素（标准 EPUB 封面比例）
- 可选：使用默认封面模板

#### 步骤 6：转换执行
- 显示转换进度
- 后台执行 EPUB 生成
- 转换完成后提示用户保存位置

---

## 3. 详细功能需求

### 3.1 文件选择功能

#### 3.1.1 文件选择器
- **文件类型限制**：仅允许选择 `.txt` 文件
- **文件大小限制**：建议最大 50MB（可配置）
- **编码检测**：自动检测文件编码（UTF-8、GBK、GB2312 等）
- **文件信息显示**：
  - 文件名
  - 文件大小（格式化显示，如：2.5 MB）
  - 文件路径（可折叠显示）
  - 文件编码（检测结果）

#### 3.1.2 文件读取
- 使用项目现有的编码检测库（`jschardet` + `iconv-lite`）
- 支持大文件分块读取（避免内存溢出）
- 读取失败时显示错误提示

### 3.2 章节划分功能

#### 3.2.1 简易规则模式

**规则配置项：**

1. **行首空格**（复选框）
   - 选项：允许/不允许
   - 说明：是否允许章节标题前有空格
   - 示例：
     - 允许：`   第一章 开始`
     - 不允许：`第一章 开始`

2. **序数词前缀**（下拉选择）
   - 选项：`第`、`序`、`卷`、`无`、`自定义`
   - 自定义时显示输入框

3. **数字类型**（下拉选择）
   - 选项：
     - `阿拉伯数字`：1, 2, 3, ...
     - `中文数字`：一, 二, 三, ...
     - `混合型数字`：支持阿拉伯数字和中文数字混合

4. **章节标识**（下拉选择）
   - 选项：`章`、`回`、`卷`、`节`、`集`、`部`、`无`、`自定义`
   - 自定义时显示输入框

5. **附加规则**（文本输入）
   - 格式：使用 `|` 分隔多个规则
   - 示例：`序卷|序[1-9]|序曲|楔子|前言|后记|尾声|番外|最终章`
   - 支持正则表达式语法

**规则组合示例：**
- `第[一二三四五六七八九十百千万]+章`：匹配"第一章"、"第二十章"等
- `第\d+章`：匹配"第1章"、"第123章"等
- `^\s*序卷|序[1-9]|序曲`：匹配"序卷"、"序1"、"序曲"等

#### 3.2.2 正则表达式模式

**功能要求：**
- 提供正则表达式输入框
- 支持多行正则表达式
- 实时验证正则表达式语法
- 显示匹配测试结果（匹配到的前 5 个章节标题）
- 提供常用正则表达式模板：
  - `^\s*第[一二三四五六七八九十百千万]+章`（中文数字章节）
  - `^\s*第\d+章`（阿拉伯数字章节）
  - `^\s*Chapter\s*\d+`（英文章节）
  - `^\s*第\d+[章节回卷]`（混合格式）

**正则表达式验证：**
- 输入时实时检查语法
- 语法错误时显示错误提示
- 提供修复建议

#### 3.2.3 章节划分算法

**划分逻辑：**
1. 按行读取文件内容
2. 对每一行应用章节匹配规则（简易规则转换为正则表达式）
3. 匹配成功的行作为章节标题
4. 章节内容为从当前标题到下一个标题之间的所有文本
5. 第一个章节之前的内容作为"前言"或"序章"
6. 最后一个章节之后的内容作为"后记"或"尾声"

**特殊情况处理：**
- 如果未匹配到任何章节，将整个文件作为单章节处理
- 如果匹配到的章节过多（>1000），提示用户检查规则
- 如果匹配到的章节过少（<2），提示用户可能规则不正确

### 3.3 章节编辑功能

#### 3.3.1 章节编辑界面布局

**界面组成：**
- **顶部区域**：当前使用的正则表达式显示（只读）
- **工具栏区域**：
  - 短章节标记：复选框"标记不超过N行的章节" + 数字输入框（默认5行）
  - 删除操作：选中章节后点击"点击删除"按钮
  - 添加操作："新章节,行号:"标签 + 数字输入框（默认1） + "点击添加"按钮
- **主表格区域**：章节列表表格
- **底部操作区**："保存修改"和"取消修改"按钮

#### 3.3.2 章节列表表格

**表格列：**
- **序号**：自动编号（1, 2, 3, ...）
- **章节名称**：章节标题文本，支持双击编辑
- **行号**：章节在文件中的起始行号

**表格特性：**
- 支持行选择（点击行选中，高亮显示）
- 支持多选（Ctrl/Cmd + 点击）
- 选中行高亮显示（蓝色背景）

#### 3.3.3 章节编辑操作

**键盘快捷键：**
- **Tab / Shift+Tab**：调整选中章节的层级（用于支持多级目录结构）
  - Tab：增加缩进层级（降级）
  - Shift+Tab：减少缩进层级（升级）
  
- **Enter**：删除/恢复选中章节
  - 首次按 Enter：标记为删除（逻辑删除，章节变灰或添加删除标记）
  - 再次按 Enter：恢复章节（取消删除标记）
  
- **Delete / Shift+Delete**：删除选中章节
  - Delete：逻辑删除（标记为删除，可恢复）
  - Shift+Delete：彻底删除（物理删除，不可恢复）

**鼠标操作：**
- **双击章节名称**：进入编辑模式，可直接修改章节标题
- **单击行**：选中/取消选中该章节
- **Ctrl/Cmd + 点击**：多选章节

#### 3.3.4 工具栏功能

**短章节标记：**
- 复选框："标记不超过N行的章节"
- 数字输入框：设置行数阈值（默认5行）
- 功能：自动标记内容行数不超过阈值的章节（可用于识别可能的错误分割）

**删除操作：**
- 按钮："点击删除"
- 功能：删除当前选中的章节（逻辑删除，可恢复）
- 提示：删除前显示确认对话框（可选）

**添加操作：**
- 标签："新章节,行号:"
- 数字输入框：输入新章节的起始行号（默认1）
- 按钮："点击添加"
- 功能：在指定行号位置插入新章节
- 新章节标题：默认为"新章节"或"第X章"（可双击编辑）

#### 3.3.5 章节层级支持

**层级结构：**
- 支持多级章节结构（如：卷 > 章 > 节）
- 通过 Tab/Shift+Tab 调整层级关系
- 表格中通过缩进显示层级关系
- 层级信息保存到 EPUB 的目录结构中

**层级显示：**
- 一级章节：无缩进
- 二级章节：缩进 2 个字符宽度
- 三级章节：缩进 4 个字符宽度
- 以此类推

#### 3.3.6 保存和取消

**保存修改：**
- 按钮："保存修改"
- 功能：保存所有章节编辑操作（删除、添加、修改标题、调整层级等）
- 验证：保存前检查是否有未保存的修改
- 提示：保存成功后显示提示信息

**取消修改：**
- 按钮："取消修改"
- 功能：放弃所有未保存的修改，恢复到上次保存的状态
- 确认：如果有未保存的修改，显示确认对话框

#### 3.3.7 章节编辑状态管理

**编辑状态：**
- 未保存状态：有修改但未保存时，按钮或标题栏显示提示
- 已保存状态：所有修改已保存
- 删除状态：章节被标记为删除（显示为灰色或带删除线）

**状态恢复：**
- 支持撤销操作（可选功能）
- 取消修改时恢复到初始状态

### 3.4 书籍信息填写功能

#### 3.4.1 信息表单

**必填字段：**
- **书名**（文本输入）
  - 默认值：从文件名提取（去除扩展名和路径）
  - 最大长度：200 字符
  - 验证：非空

**选填字段：**
- **作者**（文本输入）
  - 最大长度：100 字符
  - 支持多个作者（逗号分隔）

- **简介/描述**（多行文本）
  - 最大长度：5000 字符
  - 支持换行

- **出版社**（文本输入）
  - 最大长度：100 字符

- **ISBN**（文本输入）
  - 格式验证：ISBN-10 或 ISBN-13

- **出版日期**（日期选择器）
  - 格式：YYYY-MM-DD

- **语言**（下拉选择）
  - 默认：中文（zh-CN）
  - 选项：中文、英文、日文等

- **分类/标签**（标签输入）
  - 支持输入多个标签
  - 可从现有标签库选择

#### 3.4.2 表单验证
- 实时验证必填字段
- 提交前统一验证
- 验证失败时高亮显示错误字段

### 3.5 封面上传功能

#### 3.5.1 封面选择
- **文件选择**：
  - 支持格式：JPG、PNG、WebP
  - 文件大小限制：5MB
  - 建议尺寸：600x800 像素（3:4 比例）

- **图片预览**：
  - 实时预览选择的图片
  - 显示图片尺寸和文件大小

#### 3.5.2 图片处理
- **自动调整**：
  - 如果图片尺寸不符合建议比例，提示用户
  - 可选：自动裁剪到合适比例

- **图片压缩**：
  - 如果图片过大，自动压缩
  - 保持图片质量的同时减小文件大小

#### 3.5.3 默认封面
- 如果用户不上传封面，使用默认封面模板
- 默认封面显示书名和作者（如果提供）

### 3.6 EPUB 转换功能

#### 3.6.1 EPUB 生成

**EPUB 结构：**
- 遵循 EPUB 2.0 或 3.0 标准
- 包含以下文件：
  - `mimetype`：EPUB 媒体类型声明
  - `META-INF/container.xml`：容器文件
  - `OEBPS/content.opf`：内容清单和元数据
  - `OEBPS/toc.ncx`：导航控制文件（EPUB 2.0）
  - `OEBPS/nav.xhtml`：导航文档（EPUB 3.0）
  - `OEBPS/*.xhtml`：章节内容文件（每个章节一个文件）
  - `OEBPS/cover.jpg`：封面图片（如果提供）

**章节文件生成：**
- 每个章节生成独立的 XHTML 文件
- 文件命名：`chapter-001.xhtml`、`chapter-002.xhtml` 等
- 内容格式：标准的 XHTML 格式，包含适当的 CSS 样式

**元数据生成：**
- 从用户填写的书籍信息生成 OPF 文件
- 包含 DC 元数据（Dublin Core）
- 包含 EPUB 特定元数据

#### 3.6.2 转换进度
- 显示转换进度条
- 显示当前处理步骤（如："正在生成章节文件..."）
- 支持取消转换（可选）

#### 3.6.3 文件保存
- 转换完成后，弹出文件保存对话框
- 默认文件名：`{书名}.epub`
- 用户选择保存位置
- 保存成功后提示用户

---

## 4. 技术实现方案

### 4.1 技术栈

**前端（渲染进程）：**
- Vue 3 Composition API
- Element Plus UI 组件库
- TypeScript

**后端（主进程）：**
- Node.js
- 文件系统操作（`fs`）
- 编码检测（`jschardet` + `iconv-lite`）
- EPUB 生成库（需要选择，见下文）

**EPUB 生成库选择：**
- **选项 1**：`epub-gen`（推荐）
  - 优点：API 简单，支持 EPUB 2.0 和 3.0
  - 缺点：需要验证是否支持自定义章节 HTML
- **选项 2**：`epub`（已安装，但主要用于读取）
  - 需要确认是否支持生成 EPUB
- **选项 3**：手动构建 EPUB（使用 `adm-zip` 打包）
  - 优点：完全控制 EPUB 结构
  - 缺点：实现复杂度较高

### 4.2 文件结构

```
src/
├── main/
│   ├── ipc/
│   │   └── txtToEpubHandler.ts      # IPC 处理器
│   └── services/
│       ├── txtToEpubService.ts      # TXT 转 EPUB 核心服务
│       ├── chapterParser.ts         # 章节解析服务
│       └── chapterEditor.ts         # 章节编辑服务
├── renderer/
│   ├── views/
│   │   └── TxtToEpub.vue            # 主页面组件
│   ├── components/
│   │   ├── ChapterEditor.vue        # 章节编辑组件
│   │   ├── ChapterRuleConfig.vue    # 章节规则配置组件
│   │   └── BookInfoForm.vue         # 书籍信息表单组件
│   ├── stores/
│   │   └── txtToEpub.ts             # 状态管理 Store
│   ├── api/
│   │   └── txtToEpub.ts             # API 调用封装
│   └── types/
│       └── txtToEpub.ts             # 类型定义
└── preload/
    └── index.ts                      # 添加 API 暴露
```

### 4.3 核心服务设计

#### 4.3.1 章节解析服务（`chapterParser.ts`）

```typescript
interface ChapterRule {
  mode: 'simple' | 'regex'
  // 简易规则
  allowLeadingSpaces?: boolean
  ordinalPrefix?: string
  numberType?: 'arabic' | 'chinese' | 'mixed'
  chapterMarker?: string
  additionalRules?: string
  // 正则表达式
  regex?: string
}

interface Chapter {
  index: number
  title: string
  content: string
  lineStart: number
  lineEnd: number
  wordCount: number
}

class ChapterParser {
  /**
   * 解析章节
   */
  parseChapters(content: string, rule: ChapterRule): Chapter[]
  
  /**
   * 将简易规则转换为正则表达式
   */
  private buildRegex(rule: ChapterRule): RegExp
  
  /**
   * 验证正则表达式
   */
  validateRegex(regex: string): { valid: boolean; error?: string }
  
  /**
   * 测试正则表达式匹配
   */
  testRegex(content: string, regex: string): string[]
}
```

#### 4.3.2 章节编辑服务（`chapterEditor.ts`）

```typescript
class ChapterEditor {
  /**
   * 更新章节标题
   */
  updateChapterTitle(chapter: Chapter, newTitle: string): Chapter
  
  /**
   * 调整章节层级
   */
  adjustChapterLevel(chapter: Chapter, level: number): Chapter
  
  /**
   * 切换章节删除状态
   */
  toggleChapterDeleted(chapter: Chapter): Chapter
  
  /**
   * 彻底删除章节
   */
  deleteChapter(chapters: Chapter[], chapterIndex: number): Chapter[]
  
  /**
   * 添加新章节
   */
  addChapter(chapters: Chapter[], lineNumber: number, title?: string): Chapter[]
  
  /**
   * 标记短章节
   */
  markShortChapters(chapters: Chapter[], maxLines: number): Chapter[]
  
  /**
   * 重新计算章节索引
   */
  recalculateIndices(chapters: Chapter[]): Chapter[]
  
  /**
   * 验证章节编辑结果
   */
  validateChapters(chapters: Chapter[]): { valid: boolean; errors?: string[] }
}
```

#### 4.3.3 TXT 转 EPUB 服务（`txtToEpubService.ts`）

```typescript
interface BookMetadata {
  title: string
  author?: string
  description?: string
  publisher?: string
  isbn?: string
  publishDate?: string
  language?: string
  tags?: string[]
}

interface EpubOptions {
  chapters: Chapter[]
  metadata: BookMetadata
  coverImagePath?: string
  outputPath: string
}

class TxtToEpubService {
  /**
   * 读取 TXT 文件
   */
  readTxtFile(filePath: string): Promise<string>
  
  /**
   * 检测文件编码
   */
  detectEncoding(filePath: string): Promise<string>
  
  /**
   * 生成 EPUB 文件
   */
  generateEpub(options: EpubOptions): Promise<string>
  
  /**
   * 生成章节 HTML
   */
  private generateChapterHtml(chapter: Chapter): string
  
  /**
   * 生成 OPF 文件
   */
  private generateOpf(metadata: BookMetadata, chapters: Chapter[]): string
  
  /**
   * 生成 NCX 文件（目录）
   */
  private generateNcx(metadata: BookMetadata, chapters: Chapter[]): string
}
```

### 4.4 IPC 接口设计

```typescript
// preload/index.ts
api.txtToEpub = {
  // 选择 TXT 文件
  selectTxtFile: (): Promise<ApiResponse<string>>
  
  // 读取文件内容
  readFile: (filePath: string): Promise<ApiResponse<string>>
  
  // 解析章节
  parseChapters: (content: string, rule: ChapterRule): Promise<ApiResponse<Chapter[]>>
  
  // 验证正则表达式
  validateRegex: (regex: string): Promise<ApiResponse<{ valid: boolean; error?: string }>>
  
  // 测试正则表达式
  testRegex: (content: string, regex: string): Promise<ApiResponse<string[]>>
  
  // 章节编辑操作
  // 更新章节标题
  updateChapterTitle: (chapterIndex: number, newTitle: string): Promise<ApiResponse<Chapter>>
  
  // 调整章节层级
  adjustChapterLevel: (chapterIndex: number, level: number): Promise<ApiResponse<Chapter>>
  
  // 删除/恢复章节
  toggleChapterDeleted: (chapterIndex: number): Promise<ApiResponse<Chapter>>
  
  // 彻底删除章节
  deleteChapter: (chapterIndex: number): Promise<ApiResponse<boolean>>
  
  // 添加新章节
  addChapter: (lineNumber: number, title?: string): Promise<ApiResponse<Chapter>>
  
  // 标记短章节
  markShortChapters: (chapters: Chapter[], maxLines: number): Promise<ApiResponse<Chapter[]>>
  
  // 保存章节编辑
  saveChapterEdits: (chapters: Chapter[]): Promise<ApiResponse<Chapter[]>>
  
  // 生成 EPUB
  generateEpub: (options: EpubOptions): Promise<ApiResponse<string>>
  
  // 选择封面图片
  selectCoverImage: (): Promise<ApiResponse<string>>
  
  // 处理封面图片（压缩、裁剪等）
  processCoverImage: (imagePath: string, options?: ImageProcessOptions): Promise<ApiResponse<string>>
}
```

---

## 5. UI/UX 设计

### 5.1 页面布局

```
┌─────────────────────────────────────────┐
│  TXT 转 EPUB                              │
│  将 TXT 文件转换为 EPUB 格式电子书        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  步骤 1：选择文件                        │
│  [选择 TXT 文件]                         │
│  文件名：xxx.txt                         │
│  文件大小：2.5 MB                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  步骤 2：配置章节划分规则                │
│  ○ 简易规则  ● 正则表达式                │
│  ┌─────────────────────────────────┐   │
│  │ 行首空格 [✓]                     │   │
│  │ 第 [第 ▼] 混合型数字 [混合型数字▼] │   │
│  │ [章回卷节集部 ▼]                 │   │
│  │ 附加规则：序卷|序[1-9]|...       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  步骤 3：章节编辑                       │
│  ┌─────────────────────────────────┐   │
│  │ 当前正则表达式:                  │   │
│  │ ^\s*第\s*[0123456789...]+\s*章  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 分割结果:                        │   │
│  │ [✓] 标记不超过 [5 ▼] 行的章节   │   │
│  │ [点击删除]                       │   │
│  │ 新章节,行号: [1 ▼] [点击添加]   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Tab/Shift+Tab 调整层级;         │   │
│  │ Enter:删除/恢复选中目录;         │   │
│  │ Delete/Shift+Delete:删除/彻底删除│   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 序号 │ 章节名称(双击编辑) │ 行号 │   │
│  ├─────────────────────────────────┤   │
│  │  1   │ 序                │  1   │   │
│  │  2   │ 第一卷 引泉篇     │  69  │   │
│  │  3   │ 第一章 雨台山     │  71  │   │
│  │  4   │ 第二章 天上掉下...│ 126  │   │
│  │  5   │ 第三章 她是你的...│ 186  │ ←选中│
│  │  6   │ 第四章 师兄,她... │ 251  │   │
│  │ ...  │ ...              │ ...  │   │
│  └─────────────────────────────────┘   │
│  [保存修改] [取消修改]                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  步骤 4：填写书籍信息                    │
│  书名 *：[________________]             │
│  作者  ：[________________]             │
│  简介  ：[________________]             │
│         [多行文本区域]                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  步骤 5：上传封面（可选）                │
│  [选择封面图片] 或 [使用默认封面]         │
│  [封面预览区域]                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  [开始转换]                             │
│  转换进度：[████████░░] 80%            │
└─────────────────────────────────────────┘
```

### 5.2 交互设计

#### 5.2.1 步骤导航
- 使用步骤指示器（Step Indicator）显示当前步骤
- 已完成步骤可点击返回编辑
- 当前步骤高亮显示

#### 5.2.2 实时反馈
- 文件选择后立即显示文件信息
- 规则配置后实时预览匹配结果
- 章节划分后立即显示预览列表
- 表单验证实时提示

#### 5.2.3 错误处理
- 文件读取失败：显示错误提示，允许重新选择
- 章节划分失败：显示错误原因，提供修复建议
- 转换失败：显示详细错误信息，允许重试

### 5.3 响应式设计
- 支持桌面端和移动端（如果 Electron 支持）
- 大文件处理时显示加载状态
- 章节列表支持虚拟滚动（如果章节数量很多）

---

## 6. 数据结构

### 6.1 类型定义

```typescript
// src/renderer/src/types/txtToEpub.ts

/**
 * 章节划分规则
 */
export interface ChapterRule {
  mode: 'simple' | 'regex'
  // 简易规则
  allowLeadingSpaces?: boolean
  ordinalPrefix?: string
  numberType?: 'arabic' | 'chinese' | 'mixed'
  chapterMarker?: string
  additionalRules?: string
  // 正则表达式
  regex?: string
}

/**
 * 章节信息
 */
export interface Chapter {
  index: number
  title: string
  content: string
  lineStart: number
  lineEnd: number
  wordCount: number
  selected?: boolean      // 用于多选操作
  level?: number          // 层级（0为顶级，1为二级，以此类推）
  deleted?: boolean       // 是否已删除（逻辑删除）
  isShortChapter?: boolean // 是否为短章节（行数不超过阈值）
}

/**
 * 书籍元数据
 */
export interface BookMetadata {
  title: string
  author?: string
  description?: string
  publisher?: string
  isbn?: string
  publishDate?: string
  language?: string
  tags?: string[]
}

/**
 * EPUB 生成选项
 */
export interface EpubOptions {
  chapters: Chapter[]
  metadata: BookMetadata
  coverImagePath?: string
  outputPath: string
}

/**
 * 转换进度
 */
export interface ConversionProgress {
  step: 'reading' | 'parsing' | 'generating' | 'packaging' | 'complete'
  progress: number  // 0-100
  message: string
}
```

### 6.2 Store 状态

```typescript
// src/renderer/src/stores/txtToEpub.ts

export const useTxtToEpubStore = defineStore('txtToEpub', () => {
  // 文件相关
  const filePath = ref<string | null>(null)
  const fileContent = ref<string>('')
  const fileEncoding = ref<string>('utf-8')
  
  // 章节规则
  const chapterRule = ref<ChapterRule>({
    mode: 'simple',
    allowLeadingSpaces: true,
    ordinalPrefix: '第',
    numberType: 'mixed',
    chapterMarker: '章'
  })
  
  // 章节列表
  const chapters = ref<Chapter[]>([])
  
  // 书籍信息
  const metadata = ref<BookMetadata>({
    title: '',
    language: 'zh-CN'
  })
  
  // 封面
  const coverImagePath = ref<string | null>(null)
  
  // 转换状态
  const isConverting = ref(false)
  const conversionProgress = ref<ConversionProgress | null>(null)
  
  // Actions
  // ...
})
```

---

## 7. 异常处理

### 7.1 文件读取异常
- **文件不存在**：提示"文件不存在，请重新选择"
- **文件过大**：提示"文件过大，建议使用小于 50MB 的文件"
- **编码检测失败**：使用 UTF-8 作为默认编码，提示用户
- **读取权限不足**：提示"没有权限读取该文件"

### 7.2 章节划分异常
- **未匹配到章节**：提示"未找到匹配的章节，请检查规则配置"
- **匹配结果异常**：提示"匹配结果异常，请检查规则是否正确"
- **正则表达式错误**：实时提示语法错误，提供修复建议

### 7.3 转换异常
- **EPUB 生成失败**：显示详细错误信息，允许重试
- **文件保存失败**：提示"保存失败，请检查保存路径和权限"
- **封面处理失败**：提示"封面处理失败，将使用默认封面"

### 7.4 用户操作异常
- **未选择文件**：禁用后续步骤，提示"请先选择文件"
- **未配置规则**：提示"请配置章节划分规则"
- **未填写必填信息**：表单验证时提示

---

## 8. 性能优化

### 8.1 大文件处理
- 使用流式读取，避免一次性加载整个文件到内存
- 章节预览使用虚拟滚动，只渲染可见章节
- 转换过程使用进度回调，避免界面卡顿

### 8.2 章节划分优化
- 使用正则表达式预编译，提高匹配速度
- 大文件分块处理，避免长时间阻塞

### 8.3 图片处理优化
- 封面图片异步加载和压缩
- 使用 Web Worker 处理图片（如果可能）

---

## 9. 测试要点

### 9.1 功能测试
- [ ] 文件选择功能正常
- [ ] 编码检测准确
- [ ] 简易规则模式章节划分正确
- [ ] 正则表达式模式章节划分正确
- [ ] 章节列表表格显示正确（序号、名称、行号）
- [ ] 双击编辑章节标题功能正常
- [ ] Tab/Shift+Tab 调整层级功能正常
- [ ] Enter 删除/恢复章节功能正常
- [ ] Delete/Shift+Delete 删除/彻底删除功能正常
- [ ] 短章节标记功能正常
- [ ] 添加新章节功能正常
- [ ] 保存修改和取消修改功能正常
- [ ] 书籍信息表单验证正确
- [ ] 封面上传和处理正常
- [ ] EPUB 生成成功
- [ ] 生成的 EPUB 文件可在阅读器中正常打开

### 9.2 边界测试
- [ ] 超大文件（>50MB）处理
- [ ] 空文件处理
- [ ] 无章节标识的文件处理
- [ ] 章节数量极多（>1000）的情况
- [ ] 章节数量极少（<2）的情况
- [ ] 特殊字符和编码处理
- [ ] 超长书名和作者名处理

### 9.3 异常测试
- [ ] 文件读取失败处理
- [ ] 正则表达式错误处理
- [ ] 转换失败处理
- [ ] 文件保存失败处理

### 9.4 用户体验测试
- [ ] 操作流程顺畅
- [ ] 错误提示清晰
- [ ] 加载状态明确
- [ ] 响应速度合理

---

## 10. 后续优化方向

### 10.1 功能增强
- 支持批量转换多个 TXT 文件
- 支持自定义 EPUB 样式（CSS）
- 支持添加目录页
- 支持添加版权页
- 支持章节内插图
- 支持自动提取书名和作者（从文件内容）

### 10.2 用户体验优化
- 保存常用章节规则配置
- 支持规则模板
- 支持转换历史记录
- 支持直接导入到书籍库
- 支持转换后自动打开 EPUB 文件

### 10.3 技术优化
- 使用 Web Worker 处理大文件
- 优化 EPUB 生成性能
- 支持 EPUB 3.0 高级特性
- 支持其他格式转换（如 MOBI、AZW3）

---

## 11. 开发优先级

### Phase 1：核心功能（MVP）
1. 文件选择功能
2. 简易规则模式章节划分
3. 章节预览（只读）
4. 基本书籍信息填写
5. EPUB 生成和保存

### Phase 2：增强功能
1. 正则表达式模式
2. 章节编辑功能（合并、拆分、删除）
3. 封面上传和处理
4. 完整的书籍信息表单

### Phase 3：优化和完善
1. 性能优化
2. 用户体验优化
3. 错误处理完善
4. 测试和修复

---

## 12. 参考资料

- EPUB 2.0 规范：https://idpf.org/epub/20/spec/OPS_2.0.1_draft.htm
- EPUB 3.0 规范：https://www.w3.org/publishing/epub3/
- 正则表达式参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions
- 项目现有代码规范：参考 `.cursor/rules/` 目录下的规范文档

---

**文档版本**：v1.0  
**创建日期**：2024-12-19  
**最后更新**：2024-12-19

