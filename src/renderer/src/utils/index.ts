/**
 * 工具函数统一导出
 */

export * from './format'

/**
 * 过滤书名用于网络检索
 * 去除括号及其内容，例如 "你好（111）.epub" -> "你好.epub"
 * 注意：仅用于网络检索，原始书名保留用于表单填充
 */
export function filterTitleForSearch(title: string): string {
  if (!title) return ''
  // 移除括号及其内容，包括中文括号和英文括号
  return title.replace(/[（(][^）)]*[）)]/g, '').trim()
}

/**
 * 规范化书名用于判断是否为同一本书
 * 去除括号及其内容，例如 "A（1）" -> "A"，"A（2）" -> "A"
 * 用于批量导入时判断书籍是否已存在
 */
export function normalizeTitleForComparison(title: string): string {
  if (!title) return ''
  // 移除括号及其内容，包括中文括号和英文括号
  // 同时去除首尾空格
  return title.replace(/[（(][^）)]*[）)]/g, '').trim()
}

/**
 * 并发控制：限制同时执行的异步任务数量
 * @param tasks 任务数组，每个任务返回 Promise
 * @param concurrency 最大并发数，默认 5
 * @param onProgress 进度回调函数，参数为 (已完成数, 总数)
 * @returns Promise，所有任务完成后返回结果数组
 */
export async function pLimit<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number = 5,
  onProgress?: (completed: number, total: number) => void
): Promise<T[]> {
  const results: T[] = []
  let completed = 0
  const total = tasks.length

  // 如果任务数量为0，直接返回
  if (total === 0) {
    return results
  }

  // 创建执行队列
  const queue: Array<() => Promise<void>> = []
  let running = 0

  // 执行单个任务
  const runTask = async (task: () => Promise<T>, index: number): Promise<void> => {
    running++
    try {
      const result = await task()
      results[index] = result
      completed++
      if (onProgress) {
        onProgress(completed, total)
      }
    } catch (error) {
      // 任务失败时，将错误作为结果
      results[index] = error as T
      completed++
      if (onProgress) {
        onProgress(completed, total)
      }
    } finally {
      running--
      // 执行下一个任务
      if (queue.length > 0) {
        const nextTask = queue.shift()
        if (nextTask) {
          nextTask()
        }
      }
    }
  }

  // 创建所有任务的执行函数
  const taskPromises = tasks.map((task, index) => {
    return () => runTask(task, index)
  })

  // 启动初始批次
  const initialBatch = taskPromises.slice(0, Math.min(concurrency, total))
  const remainingTasks = taskPromises.slice(concurrency)

  // 将剩余任务加入队列
  remainingTasks.forEach((task) => {
    queue.push(task)
  })

  // 执行初始批次
  await Promise.all(initialBatch.map((task) => task()))

  return results
}
