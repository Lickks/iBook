import { app, shell } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 文件管理服务
 * 负责文件的保存、删除、打开等操作
 */
class FileManagerService {
  private _documentsDir: string

  constructor() {
    // 延迟初始化，避免在模块顶层调用 electron.app
    this._documentsDir = ''
  }

  /**
   * 获取文档目录
   */
  private getDocumentsDir(): string {
    if (!this._documentsDir) {
      // 获取用户数据目录
      const userDataPath = app.getPath('userData')
      // 文档存储目录
      this._documentsDir = path.join(userDataPath, 'documents')
      // 确保目录存在
      this.ensureDirectoryExists()
    }
    return this._documentsDir
  }

  /**
   * 确保文档目录存在
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.getDocumentsDir())) {
      fs.mkdirSync(this.getDocumentsDir(), { recursive: true })
    }
  }

  /**
   * 保存文件
   * @param filePath 原始文件路径
   * @param bookId 书籍ID
   * @returns 保存后的文件名
   */
  async saveFile(filePath: string, _bookId: number): Promise<string> {
    try {
      // 读取原文件
      const fileBuffer = fs.readFileSync(filePath)

      // 获取原文件名
      const originalName = path.basename(filePath)
      const ext = path.extname(originalName)
      const baseName = path.basename(originalName, ext)
      
      // 直接使用原文件名
      // 如果文件已存在，则添加序号后缀
      let fileName = originalName
      let savePath = path.join(this.getDocumentsDir(), fileName)
      let counter = 1
      
      // 如果文件已存在，添加序号后缀
      while (fs.existsSync(savePath)) {
        fileName = `${baseName}(${counter})${ext}`
        savePath = path.join(this.getDocumentsDir(), fileName)
        counter++
      }

      // 保存到文档目录
      fs.writeFileSync(savePath, fileBuffer)

      return fileName
    } catch (error) {
      console.error('保存文件失败:', error)
      throw new Error('保存文件失败')
    }
  }

  /**
   * 删除文件
   * @param fileName 文件名
   */
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const filePath = path.join(this.getDocumentsDir(), fileName)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error('删除文件失败:', error)
      return false
    }
  }

  /**
   * 打开文件
   * @param fileName 文件名
   */
  async openFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.getDocumentsDir(), fileName)
      if (fs.existsSync(filePath)) {
        await shell.openPath(filePath)
      } else {
        throw new Error('文件不存在')
      }
    } catch (error) {
      console.error('打开文件失败:', error)
      throw new Error('打开文件失败')
    }
  }

  /**
   * 获取文件路径
   * @param fileName 文件名
   */
  getFilePath(fileName: string): string {
    return path.join(this.getDocumentsDir(), fileName)
  }

  /**
   * 获取文件大小
   * @param fileName 文件名
   * @returns 文件大小（字节）
   */
  getFileSize(fileName: string): number {
    try {
      const filePath = path.join(this.getDocumentsDir(), fileName)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        return stats.size
      }
      return 0
    } catch (error) {
      return 0
    }
  }
}

// 导出单例
export default new FileManagerService()