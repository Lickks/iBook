import axios from 'axios'
import Jimp from 'jimp'
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
   * 返回 base64 数据 URL，以便在渲染进程中安全使用
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
    
    // 尝试使用 Jimp 处理图片（调整大小和压缩）
    let processedBuffer = buffer
    try {
      const image = await Jimp.read(buffer)
      if (image && typeof image.getWidth === 'function') {
        const targetWidth = options.maxWidth ?? 640
        if (image.getWidth() > targetWidth) {
          image.resize(targetWidth, Jimp.AUTO)
        }
        const quality = options.quality ?? 80
        image.quality(quality)
        
        // 获取处理后的图片数据
        processedBuffer = await image.getBufferAsync(Jimp.AUTO)
      }
    } catch (jimpError) {
      // Jimp 处理失败，使用原始缓冲区
      console.warn(`[CoverService] Jimp 处理远程封面失败，使用原始图片:`, jimpError)
    }

    // 检测图片格式
    const fileExt = this.detectImageFormat(processedBuffer)
    const mimeType = this.getMimeType(fileExt)
    
    // 将缓冲区转换为 base64 数据 URL
    const base64 = processedBuffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    console.log(`[CoverService] 远程封面已转换为 base64 数据 URL，格式: ${mimeType}`)
    return dataUrl
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
      console.log(`[CoverService] 开始提取封面: ${filePath}, 扩展名: ${ext}`)
      
      if (ext === '.epub') {
        const result = await this.extractFromEpub(filePath)
        console.log(`[CoverService] EPUB封面提取结果: ${filePath} -> ${result ? '成功' : '失败'}`)
        return result
      }
      // MOBI/AZW/AZW3 格式比较复杂，暂时不支持
      // 如果需要支持，可以使用 mobi 库或 calibre 工具
      
      console.warn(`[CoverService] 不支持的文件格式: ${ext}`)
      return null
    } catch (error) {
      console.error('[CoverService] 从电子书提取封面失败:', filePath, error)
      return null
    }
  }

  /**
   * 从 EPUB 文件中提取封面
   */
  private async extractFromEpub(filePath: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        console.log(`[CoverService] 初始化EPUB解析: ${filePath}`)
        const epub = new EPub(filePath)
        let resolved = false

        // 超时处理：30秒后如果还没解析完成，返回null
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true
            console.warn(`[CoverService] EPUB封面提取超时: ${filePath}`)
            resolve(null)
          }
        }, 30000)

        epub.on('error', (error) => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            console.error(`[CoverService] EPUB解析错误: ${filePath}`, error)
            resolve(null)
          }
        })

        epub.on('end', async () => {
          if (resolved) return
          console.log(`[CoverService] EPUB解析完成，开始提取封面: ${filePath}`)
          
          try {
            const manifest = epub.manifest
            const spine = epub.spine
            console.log(`[CoverService] Manifest项数: ${Object.keys(manifest).length}, Spine项数: ${spine?.length || 0}`)
            
            // 策略1: 尝试从 metadata.cover 获取
            const coverId = epub.metadata.cover
            console.log(`[CoverService] Metadata.cover ID: ${coverId || '未找到'}`)
            if (coverId) {
              try {
                // 尝试通过ID获取
                let coverBuffer = await new Promise<Buffer | null>((resolveCover) => {
                  epub.getImage(coverId, (err, imgBuffer) => {
                    if (err) {
                      console.warn(`[CoverService] getImage(${coverId}) 错误:`, err)
                      resolveCover(null)
                    } else if (!imgBuffer) {
                      console.warn(`[CoverService] getImage(${coverId}) 返回空缓冲区`)
                      resolveCover(null)
                    } else {
                      console.log(`[CoverService] getImage(${coverId}) 成功，缓冲区大小: ${imgBuffer.length}`)
                      resolveCover(imgBuffer)
                    }
                  })
                })
                
                // 如果通过ID获取失败，尝试通过manifest中的href获取
                if (!coverBuffer && manifest[coverId]) {
                  const coverItem = manifest[coverId]
                  console.log(`[CoverService] 尝试通过manifest[${coverId}].href获取: ${coverItem.href}`)
                  coverBuffer = await new Promise<Buffer | null>((resolveCover) => {
                    epub.getImage(coverItem.href, (err, imgBuffer) => {
                      if (err) {
                        console.warn(`[CoverService] getImage(${coverItem.href}) 错误:`, err)
                        resolveCover(null)
                      } else if (!imgBuffer) {
                        console.warn(`[CoverService] getImage(${coverItem.href}) 返回空缓冲区`)
                        resolveCover(null)
                      } else {
                        console.log(`[CoverService] getImage(${coverItem.href}) 成功，缓冲区大小: ${imgBuffer.length}`)
                        resolveCover(imgBuffer)
                      }
                    })
                  })
                }
                
                if (coverBuffer) {
                  try {
                    const coverUrl = await this.saveCoverBuffer(coverBuffer)
                    if (!resolved) {
                      resolved = true
                      clearTimeout(timeout)
                      console.log(`从 metadata.cover 提取封面成功: ${filePath}`)
                      resolve(coverUrl)
                      return
                    }
                  } catch (saveError) {
                    console.warn(`保存封面失败 (metadata.cover): ${filePath}`, saveError)
                  }
                }
              } catch (error) {
                console.warn(`获取封面失败 (metadata.cover): ${filePath}`, error)
              }
            }

            // 策略2: 从 manifest 中查找标记为 cover-image 的项
            console.log(`[CoverService] 策略2: 查找manifest中的封面标记项`)
            for (const key in manifest) {
              const item = manifest[key]
              // 检查是否标记为封面图片
              if (item.properties === 'cover-image' || 
                  key.toLowerCase().includes('cover') ||
                  item.href.toLowerCase().includes('cover')) {
                console.log(`[CoverService] 找到可能的封面项: ${key}, href: ${item.href}, properties: ${item.properties}`)
                try {
                  // 先尝试通过key（ID）获取
                  let coverBuffer = await new Promise<Buffer | null>((resolveCover) => {
                    epub.getImage(key, (err, imgBuffer) => {
                      if (err) {
                        console.warn(`[CoverService] getImage(${key}) 错误:`, err)
                        resolveCover(null)
                      } else if (!imgBuffer) {
                        resolveCover(null)
                      } else {
                        console.log(`[CoverService] getImage(${key}) 成功`)
                        resolveCover(imgBuffer)
                      }
                    })
                  })
                  
                  // 如果通过key失败，尝试通过href获取
                  if (!coverBuffer) {
                    coverBuffer = await new Promise<Buffer | null>((resolveCover) => {
                      epub.getImage(item.href, (err, imgBuffer) => {
                        if (err) {
                          console.warn(`[CoverService] getImage(${item.href}) 错误:`, err)
                          resolveCover(null)
                        } else if (!imgBuffer) {
                          resolveCover(null)
                        } else {
                          console.log(`[CoverService] getImage(${item.href}) 成功`)
                          resolveCover(imgBuffer)
                        }
                      })
                    })
                  }
                  
                  if (coverBuffer) {
                    try {
                      const coverUrl = await this.saveCoverBuffer(coverBuffer)
                      if (!resolved) {
                        resolved = true
                        clearTimeout(timeout)
                        console.log(`从 manifest[${key}] 提取封面成功: ${filePath}`)
                        resolve(coverUrl)
                        return
                      }
                    } catch (saveError) {
                      console.warn(`保存封面失败 (manifest): ${filePath}`, saveError)
                    }
                  }
                } catch (error) {
                  // 继续尝试下一个
                  continue
                }
              }
            }

            // 策略3: 查找所有图片，使用第一张图片作为封面
            console.log(`[CoverService] 策略3: 查找所有图片`)
            const imageItems: Array<{ key: string; item: any }> = []
            for (const key in manifest) {
              const item = manifest[key]
              // 检查是否是图片类型
              const mediaType = item['media-type'] || item.mediaType || ''
              if (mediaType.startsWith('image/') || 
                  /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(item.href)) {
                imageItems.push({ key, item })
                console.log(`[CoverService] 找到图片项: ${key}, href: ${item.href}, media-type: ${mediaType}`)
              }
            }
            console.log(`[CoverService] 总共找到 ${imageItems.length} 张图片`)

            // 如果找到了图片，尝试使用第一张作为封面
            if (imageItems.length > 0) {
              // 尝试从 spine 第一项开始查找图片（如果 spine 中的项指向图片）
              if (spine && spine.length > 0) {
                for (const spineItem of spine) {
                  const spineId = spineItem.idref
                  if (spineId && manifest[spineId]) {
                    // 如果 spine 项本身是图片
                    const spineManifestItem = manifest[spineId]
                    const spineMediaType = spineManifestItem['media-type'] || spineManifestItem.mediaType || ''
                    if (spineMediaType.startsWith('image/')) {
                      try {
                        const coverBuffer = await new Promise<Buffer | null>((resolveCover) => {
                          epub.getImage(spineManifestItem.href, (err, imgBuffer) => {
                            if (err || !imgBuffer) {
                              resolveCover(null)
                            } else {
                              resolveCover(imgBuffer)
                            }
                          })
                        })
                        
                        if (coverBuffer) {
                          try {
                            const coverUrl = await this.saveCoverBuffer(coverBuffer)
                            if (!resolved) {
                              resolved = true
                              clearTimeout(timeout)
                              console.log(`从 spine 第一项提取封面成功: ${filePath}`)
                              resolve(coverUrl)
                              return
                            }
                          } catch (saveError) {
                            console.warn(`保存封面失败 (spine): ${filePath}`, saveError)
                          }
                        }
                      } catch (error) {
                        // 继续尝试下一张图片
                        break
                      }
                    }
                  }
                  // 只尝试第一项
                  break
                }
              }

              // 如果 spine 中没有找到，使用 manifest 中第一张图片
              const firstImage = imageItems[0]
              try {
                const coverBuffer = await new Promise<Buffer | null>((resolveCover) => {
                  epub.getImage(firstImage.item.href, (err, imgBuffer) => {
                    if (err || !imgBuffer) {
                      resolveCover(null)
                    } else {
                      resolveCover(imgBuffer)
                    }
                  })
                })
                
                if (coverBuffer) {
                  try {
                    const coverUrl = await this.saveCoverBuffer(coverBuffer)
                    if (!resolved) {
                      resolved = true
                      clearTimeout(timeout)
                      console.log(`从 manifest 第一张图片提取封面成功: ${filePath}, 图片: ${firstImage.key}`)
                      resolve(coverUrl)
                      return
                    }
                  } catch (saveError) {
                    console.warn(`保存封面失败 (first image): ${filePath}`, saveError)
                  }
                }
              } catch (error) {
                console.warn(`获取第一张图片失败: ${filePath}`, error)
              }
            }

            // 所有策略都失败了
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              console.warn(`[CoverService] 无法提取封面，已尝试所有策略: ${filePath}`)
              console.warn(`[CoverService] Manifest项数: ${Object.keys(manifest).length}, 图片数: ${imageItems.length}`)
              // 输出前10个manifest项的信息用于调试
              const manifestKeys = Object.keys(manifest).slice(0, 10)
              manifestKeys.forEach(key => {
                const item = manifest[key]
                console.log(`  - ${key}: href=${item.href}, media-type=${item['media-type'] || item.mediaType || 'N/A'}, properties=${item.properties || 'N/A'}`)
              })
              resolve(null)
            }
          } catch (error) {
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              console.error(`提取封面过程出错: ${filePath}`, error)
              resolve(null)
            }
          }
        })

        epub.parse()
      } catch (error) {
        console.error(`EPUB初始化失败: ${filePath}`, error)
        resolve(null)
      }
    })
  }

  /**
   * 保存封面缓冲区为文件
   * 返回 base64 数据 URL，以便在渲染进程中安全使用
   */
  private async saveCoverBuffer(buffer: Buffer): Promise<string> {
    await this.ensureDirectory()
    
    try {
      // 检查 buffer 是否有效
      if (!buffer || buffer.length === 0) {
        throw new Error('缓冲区为空')
      }
      
      console.log(`[CoverService] 开始处理封面缓冲区，大小: ${buffer.length} bytes`)
      
      let processedBuffer = buffer
      
      // 尝试使用 Jimp 处理图片（调整大小和压缩）
      try {
        // 由于 Jimp 导入有问题，暂时跳过处理，直接使用原始缓冲区
        // 如果需要压缩，可以后续添加其他图片处理库
        console.log(`[CoverService] 跳过 Jimp 处理，直接使用原始图片`)
      } catch (jimpError) {
        // Jimp 处理失败，使用原始缓冲区
        console.warn(`[CoverService] Jimp 处理失败，使用原始图片:`, jimpError)
      }
      
      // 根据文件头判断图片格式
      const fileExt = this.detectImageFormat(processedBuffer)
      const mimeType = this.getMimeType(fileExt)
      
      // 将缓冲区转换为 base64 数据 URL
      const base64 = processedBuffer.toString('base64')
      const dataUrl = `data:${mimeType};base64,${base64}`
      
      console.log(`[CoverService] 封面已转换为 base64 数据 URL，格式: ${mimeType}`)
      return dataUrl
    } catch (error) {
      console.error(`[CoverService] 保存封面缓冲区失败:`, error)
      throw error
    }
  }
  
  /**
   * 根据文件扩展名获取 MIME 类型
   */
  private getMimeType(fileExt: string): string {
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp'
    }
    return mimeMap[fileExt.toLowerCase()] || 'image/jpeg'
  }
  
  /**
   * 根据文件头检测图片格式
   */
  private detectImageFormat(buffer: Buffer): string {
    if (!buffer || buffer.length < 4) {
      return '.jpg' // 默认格式
    }
    
    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return '.jpg'
    }
    
    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return '.png'
    }
    
    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return '.gif'
    }
    
    // WebP: 检查 RIFF...WEBP
    if (buffer.length >= 12 && 
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return '.webp'
    }
    
    return '.jpg' // 默认格式
  }
}

export const coverService = new CoverService()
