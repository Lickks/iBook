# iBook - 网络小说阅读管理工具

<div align="center">
  <p>一个专为网络小说阅读爱好者打造的本地化管理工具</p>
  <p>记录、管理、统计你的阅读历程</p>
</div>

---

## ✨ 特性

- 📚 **智能检索**: 从youshu.me自动检索小说信息，快速添加
- 📝 **手动管理**: 支持完全自定义的手动录入方式
- 📄 **文档管理**: 上传并管理小说文档（TXT, EPUB, PDF, MOBI, DOCX等）
- 🔢 **字数统计**: 自动计算文档字数，多数据源灵活选择
- 📊 **阅读追踪**: 记录阅读进度、状态、评分和笔记
- 📈 **数据分析**: 可视化展示阅读习惯和统计数据
- 🎨 **现代界面**: 简洁美观的用户界面，支持明暗主题
- 💾 **本地存储**: 所有数据本地存储，隐私安全可控
- 🔒 **数据备份**: 支持数据导出和备份，防止数据丢失

---

## 📖 文档

本项目提供了完整的文档，帮助你快速了解和开发：

- **[需求分析文档](docs/需求分析文档.md)**: 详细的功能需求和产品设计
- **[技术选型与架构设计](docs/技术选型与架构设计.md)**: 技术栈选择和系统架构说明
- **[快速启动指南](docs/快速启动指南.md)**: 从零开始搭建开发环境

---

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- npm 9.0+ 或 pnpm 8.0+

### 安装步骤

```bash
# 1. 克隆项目（如果你是从模板创建的，跳过这步）
git clone https://github.com/yourusername/book-store.git
cd book-store

# 2. 安装依赖
npm install
# 或使用pnpm（推荐）
pnpm install

# 3. 启动开发服务器
npm run dev
# 或
pnpm dev
```

### 打包应用

```bash
# 构建Windows安装包
npm run build
# 或
pnpm build

# 生成的安装包在 release 目录下
```

---

## 🛠️ 技术栈

- **框架**: Electron + Vue 3 + TypeScript
- **UI**: Element Plus + Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **数据库**: SQLite (better-sqlite3)
- **构建工具**: Vite
- **打包工具**: Electron Builder

---

## 📂 项目结构

```
book-store/
├── electron/           # Electron主进程代码
│   ├── main.ts        # 主进程入口
│   ├── preload.ts     # 预加载脚本
│   ├── ipc/           # IPC通信处理
│   └── services/      # 业务服务（数据库、爬虫、文件管理）
├── src/               # Vue渲染进程代码
│   ├── views/         # 页面组件
│   ├── components/    # 通用组件
│   ├── stores/        # Pinia状态管理
│   ├── api/           # API接口层
│   ├── types/         # TypeScript类型定义
│   └── utils/         # 工具函数
├── database/          # 数据库结构和迁移脚本
├── docs/              # 项目文档
└── public/            # 静态资源
```

---

## 🎯 开发路线图

### ✅ 第一阶段：核心功能（MVP）
- [ ] 项目框架搭建
- [ ] 数据库设计与初始化
- [ ] 小说信息手动录入
- [ ] 小说列表展示（网格/列表视图）
- [ ] 基本的增删改查

### 🔄 第二阶段：检索与文档
- [ ] 集成 youshu.me 检索功能
- [ ] 文档上传功能
- [ ] TXT文件字数统计
- [ ] 多格式文档支持（EPUB, PDF, DOCX）
- [ ] 字数数据源选择

### 📅 第三阶段：高级功能
- [ ] 阅读进度管理
- [ ] 评分与笔记功能
- [ ] 标签系统
- [ ] 高级筛选与排序
- [ ] 统计分析与可视化

### 🎨 第四阶段：优化与扩展
- [ ] 主题定制（明暗主题）
- [ ] 数据备份与恢复
- [ ] 批量操作
- [ ] 性能优化
- [ ] 自动更新功能

---

## 💡 核心功能预览

### 1. 智能检索

从youshu.me平台搜索小说信息，自动填充书名、作者、封面、字数等信息。

```typescript
// 示例：搜索《诡秘之主》
const results = await window.electronAPI.search.youshu('诡秘之主')
// 返回多个匹配结果，用户选择后一键导入
```

### 2. 文档管理

支持多种电子书格式，自动计算字数。

```typescript
// 上传文档并统计字数
const wordCount = await window.electronAPI.document.countWords(filePath)
// 支持：TXT, EPUB, PDF, MOBI, AZW, DOCX
```

### 3. 阅读追踪

记录阅读状态、进度、评分和个人笔记。

```typescript
// 更新阅读进度
await window.electronAPI.book.update(bookId, {
  readingStatus: 'reading',
  progressPercentage: 45.5
})
```

### 4. 统计分析

可视化展示你的阅读习惯。

- 总阅读量（本数、字数）
- 按类型统计
- 按月份统计
- 平台分布
- 年度阅读报告

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范

- 遵循 ESLint 和 Prettier 配置
- 提交前运行 `npm run lint` 检查代码
- Commit 信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)

### 提交流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 开发注意事项

### 为什么选择Electron？

1. **跨平台能力**: 未来可扩展到 macOS、Linux
2. **开发效率**: 利用前端技术栈，快速开发
3. **生态丰富**: npm 生态提供丰富的文档解析库
4. **易于学习**: 前端同学友好，学习曲线平缓

### 为什么使用本地数据库？

1. **隐私安全**: 所有数据存储在本地，不上传云端
2. **离线可用**: 无需网络即可使用
3. **性能优秀**: 本地数据库查询速度快
4. **数据自主**: 用户完全掌控自己的数据

### 边界场景考虑

- **重复添加**: 自动检测重复书籍（基于书名+作者）
- **网络超时**: 检索时设置合理的超时和重试机制
- **文档损坏**: 上传时进行完整性校验
- **大文件处理**: 限制文件大小或实现分块上传
- **封面失效**: 下载网络封面到本地，提供默认封面兜底

---

## 📄 许可证

[MIT License](LICENSE)

---

## 🙏 致谢

- [youshu.me](https://www.youshu.me/) - 小说信息数据源
- [Element Plus](https://element-plus.org/) - UI组件库
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架

---

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- Issue: [GitHub Issues](https://github.com/yourusername/book-store/issues)
- Email: your.email@example.com

---

<div align="center">
  <p>⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！</p>
  <p>Made with ❤️ by [Your Name]</p>
</div>

