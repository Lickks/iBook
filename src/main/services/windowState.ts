import { app, BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

interface WindowState {
  width: number
  height: number
  x: number
  y: number
  isMaximized: boolean
}

const WINDOW_STATE_FILE = join(app.getPath('userData'), 'window-state.json')

/**
 * 获取窗口状态文件路径
 */
function getWindowStatePath(): string {
  return WINDOW_STATE_FILE
}

/**
 * 读取保存的窗口状态
 */
function loadWindowState(): WindowState | null {
  try {
    const filePath = getWindowStatePath()
    if (!existsSync(filePath)) {
      return null
    }

    const data = readFileSync(filePath, 'utf-8')
    const state = JSON.parse(data) as WindowState

    // 验证状态是否有效
    if (
      typeof state.width === 'number' &&
      typeof state.height === 'number' &&
      typeof state.x === 'number' &&
      typeof state.y === 'number' &&
      typeof state.isMaximized === 'boolean'
    ) {
      return state
    }

    return null
  } catch (error) {
    console.error('读取窗口状态失败:', error)
    return null
  }
}

/**
 * 保存窗口状态
 */
function saveWindowState(window: BrowserWindow): void {
  try {
    const bounds = window.getBounds()
    const isMaximized = window.isMaximized()

    const state: WindowState = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized
    }

    const filePath = getWindowStatePath()
    const dir = join(filePath, '..')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8')
  } catch (error) {
    console.error('保存窗口状态失败:', error)
  }
}

/**
 * 确保窗口位置在屏幕范围内
 */
function ensureWindowOnScreen(state: WindowState): WindowState {
  const displays = screen.getAllDisplays()
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  // 检查窗口是否在任何显示器范围内
  let isOnScreen = false
  for (const display of displays) {
    const { x, y, width, height } = display.bounds
    if (
      state.x >= x &&
      state.y >= y &&
      state.x + state.width <= x + width &&
      state.y + state.height <= y + height
    ) {
      isOnScreen = true
      break
    }
  }

  // 如果窗口不在任何屏幕上，重置到主屏幕中心
  if (!isOnScreen) {
    state.x = Math.max(0, (screenWidth - state.width) / 2)
    state.y = Math.max(0, (screenHeight - state.height) / 2)
  }

  // 确保窗口大小不超过屏幕
  state.width = Math.min(state.width, screenWidth)
  state.height = Math.min(state.height, screenHeight)

  return state
}

/**
 * 创建窗口并恢复状态
 */
export function createWindowWithState(iconPath?: string): BrowserWindow {
  const savedState = loadWindowState()
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
  
  // 设置默认中等窗口大小（约为屏幕的 70%）
  const defaultWidth = Math.min(1400, Math.floor(screenWidth * 0.7))
  const defaultHeight = Math.min(900, Math.floor(screenHeight * 0.7))
  
  // 计算居中位置
  const defaultX = Math.max(0, Math.floor((screenWidth - defaultWidth) / 2))
  const defaultY = Math.max(0, Math.floor((screenHeight - defaultHeight) / 2))
  
  const defaultState: WindowState = {
    width: defaultWidth,
    height: defaultHeight,
    x: defaultX,
    y: defaultY,
    isMaximized: false
  }

  // 如果之前保存的状态是最大化，则使用默认状态（避免首次打开就是全屏）
  let windowState = savedState && !savedState.isMaximized ? savedState : defaultState
  windowState = ensureWindowOnScreen(windowState)

  const mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    ...(process.platform === 'linux' && iconPath ? { icon: iconPath } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 如果之前是最大化状态，则最大化窗口
  if (windowState.isMaximized) {
    mainWindow.maximize()
  }

  // 监听窗口状态变化并保存
  let saveTimer: NodeJS.Timeout | null = null
  const debouncedSave = (): void => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
    saveTimer = setTimeout(() => {
      if (!mainWindow.isDestroyed()) {
        saveWindowState(mainWindow)
      }
    }, 500)
  }

  mainWindow.on('resize', debouncedSave)
  mainWindow.on('move', debouncedSave)
  mainWindow.on('maximize', () => {
    saveWindowState(mainWindow)
  })
  mainWindow.on('unmaximize', () => {
    saveWindowState(mainWindow)
  })

  // 窗口关闭前保存状态
  mainWindow.on('close', () => {
    saveWindowState(mainWindow)
  })

  return mainWindow
}

