/**
 * electron-builder afterPack 钩子
 * 用于优化打包后的文件，移除不必要的语言包
 */

const fs = require('fs')
const path = require('path')

/**
 * 需要保留的语言包（只保留中文和英文）
 */
const KEEP_LOCALES = ['zh-CN', 'zh-TW', 'en-US', 'en-GB']

/**
 * 移除不必要的语言包
 */
function removeUnnecessaryLocales(appOutDir) {
  const localesDir = path.join(appOutDir, 'locales')
  
  if (!fs.existsSync(localesDir)) {
    console.log('locales 目录不存在，跳过语言包清理')
    return
  }

  const files = fs.readdirSync(localesDir)
  let removedCount = 0
  let totalSize = 0

  files.forEach(file => {
    if (!file.endsWith('.pak')) {
      return
    }

    // 提取语言代码（例如：zh-CN.pak -> zh-CN）
    const locale = file.replace('.pak', '')
    
    // 如果不在保留列表中，删除该语言包
    if (!KEEP_LOCALES.includes(locale)) {
      const filePath = path.join(localesDir, file)
      const stats = fs.statSync(filePath)
      totalSize += stats.size
      fs.unlinkSync(filePath)
      removedCount++
      console.log(`已移除语言包: ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
    }
  })

  if (removedCount > 0) {
    console.log(`\n语言包清理完成:`)
    console.log(`  - 移除了 ${removedCount} 个语言包`)
    console.log(`  - 节省空间: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  - 保留了 ${KEEP_LOCALES.length} 个语言包: ${KEEP_LOCALES.join(', ')}`)
  } else {
    console.log('没有需要移除的语言包')
  }
}

/**
 * electron-builder afterPack 钩子
 */
module.exports = async function afterPack(context) {
  const { appOutDir } = context
  
  console.log('\n开始优化打包文件...')
  console.log(`应用输出目录: ${appOutDir}`)
  
  // 移除不必要的语言包
  removeUnnecessaryLocales(appOutDir)
  
  console.log('\n打包优化完成！')
}

