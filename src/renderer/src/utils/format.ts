/**
 * 格式化工具函数
 */

import dayjs from 'dayjs'

/**
 * 格式化字数
 * @param count 字数
 * @returns 格式化后的字符串，如 "100万字"
 */
export function formatWordCount(count?: number): string {
  if (!count) return '未知'
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万字`
  }
  return `${count}字`
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串，如 "1.5MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化日期
 * @param date 日期字符串或 Date 对象
 * @param format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: string | Date,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  return dayjs(date).format(format)
}

/**
 * 格式化相对时间
 * @param date 日期字符串或 Date 对象
 * @returns 相对时间字符串，如 "2小时前"
 */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow()
}

