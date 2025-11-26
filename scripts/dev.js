#!/usr/bin/env node

/**
 * 开发环境启动脚本
 * 修复 Windows 控制台中文乱码问题
 */

const { spawn } = require('child_process')
const os = require('os')
const path = require('path')

// 设置环境变量
process.env.NODE_ENV = 'development'

// Windows 平台特殊处理
if (os.platform() === 'win32') {
  // 设置代码页为 UTF-8 (65001)
  try {
    require('child_process').execSync('chcp 65001 >nul 2>&1', {
      encoding: 'utf8',
      stdio: 'ignore',
      shell: true
    })
  } catch (error) {
    // 忽略错误
  }

  // 设置环境变量
  process.env.PYTHONIOENCODING = 'utf-8'

  // 设置 stdout/stderr 编码
  try {
    if (process.stdout && typeof process.stdout.setDefaultEncoding === 'function') {
      process.stdout.setDefaultEncoding('utf8')
    }
    if (process.stderr && typeof process.stderr.setDefaultEncoding === 'function') {
      process.stderr.setDefaultEncoding('utf8')
    }
  } catch (error) {
    // 忽略错误
  }
}

// 准备环境变量
const env = {
  ...process.env,
  // 确保使用 UTF-8 编码
  PYTHONIOENCODING: 'utf-8',
  NODE_ENV: 'development'
}

// Windows 平台：为子进程设置代码页命令
const isWindows = os.platform() === 'win32'
let command
let args

// 传递所有额外的参数
const extraArgs = process.argv.slice(2)

if (isWindows) {
  // Windows: 找到 electron-vite 的完整路径
  const electronVitePath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron-vite.cmd')
  
  // 构建完整的命令字符串：先设置代码页，然后运行 electron-vite
  let fullCommand = `chcp 65001 >nul && "${electronVitePath}" dev`
  if (extraArgs.length > 0) {
    fullCommand += ' ' + extraArgs.map(arg => `"${arg}"`).join(' ')
  }
  
  // 使用 cmd 执行命令
  command = 'cmd'
  args = ['/c', fullCommand]
} else {
  // 非 Windows: 直接运行 electron-vite
  const electronVitePath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron-vite')
  command = electronVitePath
  args = ['dev', ...extraArgs]
}

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: isWindows,
  env: env
})

child.on('error', (error) => {
  console.error('启动失败:', error)
  process.exit(1)
})

child.on('exit', (code) => {
  process.exit(code || 0)
})
