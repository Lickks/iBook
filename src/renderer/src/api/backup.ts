import type { ApiResponse } from '../types/api'

export interface BackupProgress {
  stage: 'preparing' | 'database' | 'documents' | 'covers' | 'settings' | 'compressing' | 'complete'
  progress: number
  message: string
}

export interface RestoreProgress {
  stage: 'validating' | 'backing-up' | 'extracting' | 'database' | 'documents' | 'covers' | 'settings' | 'complete'
  progress: number
  message: string
}

export interface BackupMetadata {
  version: string
  appVersion: string
  backupTime: string
  dataStats: {
    books: number
    documents: number
    covers: number
    tags: number
    bookshelves: number
  }
  fileSize: number
}

/**
 * 创建备份
 */
export async function createBackup(
  savePath?: string
): Promise<ApiResponse<{ path?: string }>> {
  return await window.api.backup.create(savePath)
}

/**
 * 恢复备份
 */
export async function restoreBackup(backupPath?: string): Promise<ApiResponse> {
  return await window.api.backup.restore(backupPath)
}

/**
 * 验证备份文件
 */
export async function validateBackup(backupPath: string): Promise<
  ApiResponse<{
    valid: boolean
    metadata?: BackupMetadata
    error?: string
  }>
> {
  return await window.api.backup.validate(backupPath)
}

/**
 * 获取备份文件信息
 */
export async function getBackupInfo(backupPath: string): Promise<ApiResponse<BackupMetadata>> {
  return await window.api.backup.getInfo(backupPath)
}

/**
 * 监听备份进度
 */
export function onBackupProgress(callback: (progress: BackupProgress) => void): () => void {
  return window.api.backup.onProgress(callback)
}

/**
 * 监听恢复进度
 */
export function onRestoreProgress(callback: (progress: RestoreProgress) => void): () => void {
  return window.api.backup.onRestoreProgress(callback)
}

/**
 * 监听恢复完成
 */
export function onRestoreComplete(callback: () => void): () => void {
  return window.api.backup.onRestoreComplete(callback)
}

