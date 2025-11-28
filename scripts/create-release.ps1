# 创建 GitHub Release 脚本
# 使用方法：
# 1. 设置 GitHub Token: $env:GITHUB_TOKEN = "your-token-here"
# 2. 运行脚本: .\scripts\create-release.ps1

param(
    [string]$Version = "1.0.0",
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    Write-Host "错误: 未设置 GitHub Token" -ForegroundColor Red
    Write-Host "请设置环境变量: `$env:GITHUB_TOKEN = 'your-token-here'" -ForegroundColor Yellow
    Write-Host "或运行: .\scripts\create-release.ps1 -Token 'your-token-here'" -ForegroundColor Yellow
    exit 1
}

$owner = "Lickks"
$repo = "iBook"
$tagName = "v$Version"
$releaseName = "iBook v$Version - 首次正式发布"

# 读取 Release 说明
$releaseNotesPath = "RELEASE_NOTES_v1.0.0.md"
if (-not (Test-Path $releaseNotesPath)) {
    Write-Host "错误: 找不到 Release 说明文件: $releaseNotesPath" -ForegroundColor Red
    exit 1
}

$releaseNotes = Get-Content $releaseNotesPath -Raw -Encoding UTF8

# 设置请求头
$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "iBook-Release-Script"
}

# 创建 Release 的 JSON 数据
$releaseData = @{
    tag_name = $tagName
    name = $releaseName
    body = $releaseNotes
    draft = $false
    prerelease = $false
} | ConvertTo-Json -Depth 10

Write-Host "正在创建 Release: $tagName..." -ForegroundColor Cyan

try {
    # 创建 Release
    $createUrl = "https://api.github.com/repos/$owner/$repo/releases"
    $response = Invoke-RestMethod -Uri $createUrl -Method Post -Headers $headers -Body $releaseData -ContentType "application/json"
    
    $releaseId = $response.id
    Write-Host "Release 创建成功! ID: $releaseId" -ForegroundColor Green
    
    # 上传文件
    $files = @(
        "dist\iBook-$Version-setup.exe",
        "dist\latest.yml",
        "dist\iBook-$Version-setup.exe.blockmap"
    )
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            $fileName = Split-Path $file -Leaf
            Write-Host "正在上传: $fileName..." -ForegroundColor Cyan
            
            $uploadUrl = "https://uploads.github.com/repos/$owner/$repo/releases/$releaseId/assets?name=$fileName"
            
            $fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $file))
            $fileContent = [System.Convert]::ToBase64String($fileBytes)
            
            $uploadHeaders = @{
                "Authorization" = "token $Token"
                "Accept" = "application/vnd.github.v3+json"
                "Content-Type" = "application/octet-stream"
            }
            
            try {
                $uploadResponse = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -Body $fileBytes
                Write-Host "  ✓ $fileName 上传成功" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ $fileName 上传失败: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "警告: 文件不存在: $file" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nRelease 创建完成!" -ForegroundColor Green
    Write-Host "访问: $($response.html_url)" -ForegroundColor Cyan
    
} catch {
    Write-Host "错误: 创建 Release 失败" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    exit 1
}

