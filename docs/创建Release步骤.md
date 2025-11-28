# 创建 GitHub Release 步骤

## 方式一：使用网页界面（推荐）

### 1. 访问 Release 页面
访问：https://github.com/Lickks/iBook/releases/new

### 2. 填写 Release 信息
- **Tag version**: `v1.0.0`
- **Release title**: `iBook v1.0.0 - 首次正式发布`
- **Description**: 复制 `RELEASE_NOTES_v1.0.0.md` 文件的内容

### 3. 上传文件
在 "Attach binaries" 区域，拖拽或选择以下文件：
- `dist/iBook-1.0.0-setup.exe` (Windows 安装包)
- `dist/latest.yml` (自动更新清单文件)
- `dist/iBook-1.0.0-setup.exe.blockmap` (可选，用于增量更新)

### 4. 发布
- 如果这是预发布版本，勾选 "Set as a pre-release"
- 点击 "Publish release" 按钮

## 方式二：使用 GitHub CLI

如果已安装 GitHub CLI，可以使用以下命令：

```bash
# 1. 创建 Release
gh release create v1.0.0 \
  --title "iBook v1.0.0 - 首次正式发布" \
  --notes-file RELEASE_NOTES_v1.0.0.md \
  dist/iBook-1.0.0-setup.exe \
  dist/latest.yml \
  dist/iBook-1.0.0-setup.exe.blockmap
```

## 方式三：使用 PowerShell 脚本（自动化）

已创建自动化脚本 `scripts/create-release.ps1`，可以一键创建 Release 并上传文件。

### 步骤：

1. **创建 GitHub Personal Access Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 复制生成的 token

2. **运行脚本**
   ```powershell
   # 方式1: 设置环境变量后运行
   $env:GITHUB_TOKEN = "your-token-here"
   .\scripts\create-release.ps1
   
   # 方式2: 直接传递 token 参数
   .\scripts\create-release.ps1 -Token "your-token-here"
   
   # 方式3: 指定版本号
   .\scripts\create-release.ps1 -Version "1.0.0" -Token "your-token-here"
   ```

3. **脚本会自动**：
   - 创建 Release
   - 上传 Windows 安装包
   - 上传 latest.yml（自动更新清单）
   - 上传 blockmap 文件（增量更新）

## 注意事项

1. **macOS 版本**：由于在 Windows 上无法构建 macOS 版本，需要在 macOS 系统上运行 `npm run build:mac` 后再上传
2. **自动更新**：上传 `latest.yml` 文件后，应用才能正确检测更新
3. **文件大小**：Windows 安装包约 273MB，上传可能需要一些时间

## 后续步骤

发布 Release 后：
1. 更新 README.md 中的下载链接
2. 在项目首页添加 Release 徽章
3. 推广宣传

