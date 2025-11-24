import axios from 'axios'
import Jimp from 'jimp'
import { app } from 'electron'
import { join } from 'path'
import { access, mkdir } from 'fs/promises'
import { constants } from 'fs'
import { pathToFileURL } from 'url'

interface DownloadOptions {
  title?: string
  maxWidth?: number
  quality?: number
}

/**
 * 封面下载与处理服务
 */
class CoverService {
  private readonly downloadDir: string

  constructor() {
    this.downloadDir = join(app.getPath('userData'), 'covers')
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
    const filePath = join(this.downloadDir, fileName)
    await image.writeAsync(filePath)

    return pathToFileURL(filePath).toString()
  }

  /**
   * 确认下载目录存在
   */
  private async ensureDirectory(): Promise<void> {
    try {
      await access(this.downloadDir, constants.F_OK)
    } catch {
      await mkdir(this.downloadDir, { recursive: true })
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
}

export const coverService = new CoverService()
