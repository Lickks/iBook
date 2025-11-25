import axios from 'axios'
import { Jimp } from 'jimp'
import { app } from 'electron'
import { join, extname } from 'path'
import { access, mkdir } from 'fs/promises'
import { constants } from 'fs'
import { pathToFileURL } from 'url'
import EPub from 'epub'

interface DownloadOptions {
  title?: string
  maxWidth?: number
  quality?: number
}

/**
 * 封面下载与处理服务
 */
class CoverService {
  private _downloadDir: string

  constructor() {
    this._downloadDir = ''
  }

  private getDownloadDir(): string {
    if (!this._downloadDir) {
      this._downloadDir = join(app.getPath('userData'), 'covers')
    }
    return this._downloadDir
  }

  /**
   * 下载远程封面并转码
   */
  async download(url: string, options: DownloadOptions = {}): Promise<string> {
    if (!url) {
      throw new Error('封面地址不能为空')
    }

    await this.ensureDirectory()

    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      validateStatus: (status) => status >= 200 && status < 400
    })

    const buffer = Buffer.from(response.data)
    const image = await Jimp.read(buffer)

    const targetWidth = options.maxWidth ?? 640
    if (image.getWidth() > targetWidth) {
      image.resize(targetWidth, Jimp.AUTO)
    }

    const quality = options.quality ?? 80
    image.quality(quality)

    const fileName = this.buildFileName(options.title)
    const filePath = join(this.getDownloadDir(), fileName)
    await image.writeAsync(filePath)

    return pathToFileURL(filePath).toString()
  }

  /**
   * 确认下载目录存在
   */
  private async ensureDirectory(): Promise<void> {
    try {
      await access(this.getDownloadDir(), constants.F_OK)
    } catch {
      await mkdir(this.getDownloadDir(), { recursive: true })
    }
  }

  /**
   * 根据标题生成安全文件名
   */
  private buildFileName(rawTitle?: string): string {
    const safeTitle = (rawTitle || 'cover')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40)
    const timestamp = Date.now()
    return `${safeTitle || 'cover'}-${timestamp}.jpg`
  }

  /**
   * 从电子书文件中提取封面
   * 支持 EPUB、MOBI、AZW、AZW3 格式
   * @param filePath 电子书文件路径
   * @returns 封面图片的 file:// URL，如果无法提取则返回 null
   */
  async extractFromEbook(filePath: string): Promise<string | null> {
    try {
      const ext = extname(filePath).toLowerCase()
      
      if (ext === '.epub') {
        return await this.extractFromEpub(filePath)
      }
      // MOBI/AZW/AZW3 格式比较复杂，暂时不支持
      // 如果需要支持，可以使用 mobi 库或 calibre 工具
      
      return null
    } catch (error) {
      console.warn('从电子书提取封面失败:', error)
      return null
    }
  }

  /**
   * 从 EPUB 文件中提取封面
   */
  private async extractFromEpub(filePath: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        const epub = new EPub(filePath)

        epub.on('error', () => {
          resolve(null)
        })

        epub.on('end', async () => {
          try {
            // 尝试获取封面图片
            const coverId = epub.metadata.cover
            if (coverId) {
              epub.getImage(coverId, async (err, imgBuffer) => {
                if (err || !imgBuffer) {
                  // 如果没有封面，尝试从 manifest 中查找
                  const manifest = epub.manifest
                  let found = false
                  for (const key in manifest) {
                    const item = manifest[key]
                    if (item.properties === 'cover-image' || key.toLowerCase().includes('cover')) {
                      found = true
                      epub.getImage(item.href, async (err2, imgBuffer2) => {
                        if (err2 || !imgBuffer2) {
                          resolve(null)
                        } else {
                          try {
                            const coverUrl = await this.saveCoverBuffer(imgBuffer2)
                            resolve(coverUrl)
                          } catch {
                            resolve(null)
                          }
                        }
                      })
                      break
                    }
                  }
                  if (!found) {
                    resolve(null)
                  }
                } else {
                  try {
                    const coverUrl = await this.saveCoverBuffer(imgBuffer)
                    resolve(coverUrl)
                  } catch {
                    resolve(null)
                  }
                }
              })
            } else {
              // 没有封面ID，尝试从 manifest 中查找
              const manifest = epub.manifest
              let found = false
              for (const key in manifest) {
                const item = manifest[key]
                if (item.properties === 'cover-image' || key.toLowerCase().includes('cover')) {
                  found = true
                  epub.getImage(item.href, async (err2, imgBuffer2) => {
                    if (err2 || !imgBuffer2) {
                      resolve(null)
                    } else {
                      try {
                        const coverUrl = await this.saveCoverBuffer(imgBuffer2)
                        resolve(coverUrl)
                      } catch {
                        resolve(null)
                      }
                    }
                  })
                  break
                }
              }
              if (!found) {
                resolve(null)
              }
            }
          } catch (error) {
            resolve(null)
          }
        })

        epub.parse()
      } catch (error) {
        resolve(null)
      }
    })
  }

  /**
   * 保存封面缓冲区为文件
   */
  private async saveCoverBuffer(buffer: Buffer): Promise<string> {
    await this.ensureDirectory()
    
    const image = await Jimp.read(buffer)
    const targetWidth = 640
    if (image.getWidth() > targetWidth) {
      image.resize(targetWidth, Jimp.AUTO)
    }
    image.quality(80)

    const fileName = this.buildFileName('ebook-cover')
    const filePath = join(this.getDownloadDir(), fileName)
    await image.writeAsync(filePath)

    return pathToFileURL(filePath).toString()
  }
}

export const coverService = new CoverService()
