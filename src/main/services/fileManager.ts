import { app, shell } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

/**
 * 文件管理服务
 * 负责文件的保存、删除、打开等操作
 */
class FileManagerService {
  private documentsDir: string

  constructor() {
    // 获取用户数据目录
    const userDataPath = app.getPath('userData')
    // 文档存储目录
    this.documentsDir = path.join(userDataPath, 'documents')
    // 确保目录存在
    this.ensureDirectoryExists()
  }

  /**
   * 确保文档目录存在
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true })
    }
  }

  /**
   * 保存文件
   * @param filePath 原始文件路径
   * @param bookId 书籍ID
   * @returns 保存后的文件名
   */
  async saveFile(filePath: string, bookId: number): Promise<string> {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error('文件不存在')
      }

      // 获取文件信息
      const fileStats = fs.statSync(filePath)
      if (!fileStats.isFile()) {
        throw new Error('不是有效的文件')
      }

      // 获取源文件名并处理冲突
      const originalFileName = path.basename(filePath)
      const finalFileName = this.resolveFileNameConflict(originalFileName)
      const destPath = path.join(this.documentsDir, finalFileName)

      // 复制文件
      fs.copyFileSync(filePath, destPath)

      return finalFileName
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`文件保存失败: ${message}`)
    }
  }

  /**
   * 解决文件名冲突
   * 如果文件名已存在，自动添加序号：文件名(1).ext, 文件名(2).ext
   * @param fileName 原始文件名
   * @returns 不冲突的文件名
   */
  private resolveFileNameConflict(fileName: string): string {
    const ext = path.extname(fileName)
    const nameWithoutExt = path.basename(fileName, ext)

    let finalFileName = fileName
    let counter = 1

    // 循环检查文件是否存在，直到找到不冲突的文件名
    while (fs.existsSync(path.join(this.documentsDir, finalFileName))) {
      finalFileName = `${nameWithoutExt}(${counter})${ext}`
      counter++
    }

    return finalFileName
  }

  /**
   * 删除文件
   * @param fileName 文件名
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.documentsDir, fileName)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`文件删除失败: ${message}`)
    }
  }

  /**
   * 使用系统默认程序打开文件
   * @param fileName 文件名
   */
  async openFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.documentsDir, fileName)

      if (!fs.existsSync(filePath)) {
        throw new Error('文件不存在')
      }

      // 使用系统默认程序打开
      await shell.openPath(filePath)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`文件打开失败: ${message}`)
    }
  }

  /**
   * 获取文件完整路径
   * @param fileName 文件名
   * @returns 完整路径
   */
  getFilePath(fileName: string): string {
    return path.join(this.documentsDir, fileName)
  }

  /**
   * 检查文件是否存在
   * @param fileName 文件名
   * @returns 是否存在
   */
  fileExists(fileName: string): boolean {
    const filePath = path.join(this.documentsDir, fileName)
    return fs.existsSync(filePath)
  }

  /**
   * 获取文件大小
   * @param fileName 文件名
   * @returns 文件大小（字节）
   */
  getFileSize(fileName: string): number {
    try {
      const filePath = path.join(this.documentsDir, fileName)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        return stats.size
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  /**
   * 获取文档存储目录路径
   */
  getDocumentsDir(): string {
    return this.documentsDir
  }
}

// 导出单例
export default new FileManagerService()
