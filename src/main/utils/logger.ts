/**
 * 日志工具
 * 确保在 Windows 上正确显示中文
 * 注意：需要在应用启动时设置控制台编码（在 main/index.ts 中）
 */

// 直接导出 console 方法，因为已经在启动时设置了编码
// 如果编码设置失败，这些方法仍然可以工作
export const logger = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
}

