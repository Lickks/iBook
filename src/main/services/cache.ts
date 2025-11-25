/**
 * 简单的内存缓存服务
 * 使用LRU策略，最大缓存100条记录
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  accessCount: number
  lastAccess: number
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly maxSize: number = 100
  private readonly defaultTTL: number = 5 * 60 * 1000 // 5分钟

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    // 检查是否过期
    const now = Date.now()
    if (now - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key)
      return null
    }

    // 更新访问信息
    entry.lastAccess = now
    entry.accessCount++

    return entry.data as T
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T): void {
    const now = Date.now()

    // 如果缓存已满，删除最久未访问的项
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccess: now
    })
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 清空匹配模式的缓存
   */
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 删除最久未访问的项（LRU策略）
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestAccess = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }
}

// 导出单例
export const cacheService = new CacheService()

// 定期清理过期缓存（每10分钟清理一次）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cacheService.cleanup()
  }, 10 * 60 * 1000)
}

