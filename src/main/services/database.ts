import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { readFileSync } from 'fs'
import { cacheService } from './cache'
import type {
  Book,
  BookInput,
  Document,
  DocumentInput,
  Note,
  NoteInput,
  Tag,
  TagInput,
  ReadingProgress,
  ReadingProgressInput,
  BookFilters,
  BookSort,
  PaginatedResult
} from '../../renderer/src/types/book'

/**
 * 数据库服务类
 * 负责数据库初始化、连接管理和所有 CRUD 操作
 */
class DatabaseService {
  private db: Database.Database | null = null
  private _dbPath: string
  private isInitialized = false

  constructor() {
    // 数据库文件存储在用户数据目录
    // 延迟获取路径，避免在模块顶层调用 electron.app
    this._dbPath = ''
  }

  /**
   * 获取数据库路径
   */
  private getDbPath(): string {
    if (!this._dbPath) {
      const userDataPath = app.getPath('userData')
      this._dbPath = join(userDataPath, 'ibook.db')
    }
    return this._dbPath
  }

  /**
   * 初始化数据库
   * 创建数据库连接并执行 schema.sql 初始化脚本
   */
  initialize(): void {
    if (this.isInitialized && this.db) {
      return
    }

    try {
      // 打开数据库连接
      this.db = new Database(this.getDbPath())
      this.isInitialized = true
      
      // 启用外键约束
      this.db.pragma('foreign_keys = ON')

      // 读取并执行 schema.sql
      // 使用 app.getAppPath() 获取应用路径，兼容开发和生产环境
      const appPath = app.getAppPath()
      const schemaPath = join(appPath, 'database', 'schema.sql')
      const schema = readFileSync(schemaPath, 'utf-8')
      
      // 执行 SQL 脚本
      // SQLite 的 DDL 语句（CREATE TABLE 等）是自动提交的，不需要事务
      // 使用 exec 方法执行整个脚本，它会自动处理多语句
      try {
        const sanitizedSchema = this.stripUnsupportedComments(schema)
        this.db.exec(sanitizedSchema)
      } catch (error: any) {
        // 忽略某些预期的错误（如视图/表已存在、索引已存在等）
        const errorMsg = String(error?.message || error)
        if (
          !errorMsg.includes('already exists') &&
          !errorMsg.includes('duplicate column name') &&
          !errorMsg.includes('no such table') &&
          !errorMsg.includes('no such index')
        ) {
          // 如果是非预期的错误，记录并重新抛出
          console.error('数据库初始化 SQL 执行失败:', errorMsg)
          throw error
        }
      }
      
      console.log('数据库初始化成功:', this.getDbPath())
    } catch (error) {
      this.isInitialized = false
      this.db = null
      console.error('数据库初始化失败:', error)
      throw error
    }
  }

  /**
   * 获取数据库实例
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      this.initialize()
    }

    if (!this.db) {
      throw new Error('数据库未初始化，请先调用 initialize()')
    }
    return this.db
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.isInitialized = false
    }
  }

  /**
   * 移除 SQLite 不支持的 COMMENT 语法，防止执行 schema 时出现语法错误
   */
  private stripUnsupportedComments(sql: string): string {
    return sql.replace(/\s+COMMENT\s+(['"])(?:\\.|(?!\1).)*\1/gi, '')
  }

  // ============================================
  // 书籍 CRUD 操作
  // ============================================

  /**
   * 创建书籍
   */
  createBook(input: BookInput): Book {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      INSERT INTO books (
        title, author, cover_url, platform, category, description,
        word_count_source, word_count_search, word_count_document, 
        word_count_manual, word_count_display, isbn, source_url,
        reading_status, personal_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      input.title,
      input.author || null,
      input.coverUrl || null,
      input.platform || null,
      input.category || null,
      input.description || null,
      input.wordCountSource || 'search',
      input.wordCountSearch || null,
      input.wordCountDocument || null,
      input.wordCountManual || null,
      input.wordCountDisplay || null,
      input.isbn || null,
      input.sourceUrl || null,
      input.readingStatus || 'unread',
      input.personalRating || null
    )

    // 确保安全地获取插入的ID，避免可能的序列化问题
    const insertId = result && typeof result.lastInsertRowid === 'number' ? result.lastInsertRowid : null
    if (!insertId) {
      throw new Error('创建书籍失败：无法获取插入的ID')
    }

    // 清除相关缓存
    cacheService.clearPattern('^books:')

    return this.getBookById(insertId)!
  }

  /**
   * 根据 ID 获取书籍
   */
  getBookById(id: number): Book | null {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, title, author, cover_url as coverUrl, platform, category, description,
        word_count_source as wordCountSource,
        word_count_search as wordCountSearch,
        word_count_document as wordCountDocument,
        word_count_manual as wordCountManual,
        word_count_display as wordCountDisplay,
        isbn, source_url as sourceUrl,
        reading_status as readingStatus,
        personal_rating as personalRating,
        created_at as createdAt,
        updated_at as updatedAt
      FROM books
      WHERE id = ?
    `)

    const row = stmt.get(id) as any
    if (!row) return null

    const book: Book = {
      ...row,
      readingStatus: row.readingStatus || 'unread',
      wordCountSource: row.wordCountSource || 'search',
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null),
      updatedAt: row.updatedAt && typeof row.updatedAt === 'object' && row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : (row.updatedAt || null),
      tags: this.getTagsByBookId(id)
    }

    return book
  }

  /**
   * 获取所有书籍（带缓存）
   */
  getAllBooks(): Book[] {
    const cacheKey = 'books:all'
    
    // 尝试从缓存获取
    const cached = cacheService.get<Book[]>(cacheKey)
    if (cached) {
      return cached
    }

    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, title, author, cover_url as coverUrl, platform, category, description,
        word_count_source as wordCountSource,
        word_count_search as wordCountSearch,
        word_count_document as wordCountDocument,
        word_count_manual as wordCountManual,
        word_count_display as wordCountDisplay,
        isbn, source_url as sourceUrl,
        reading_status as readingStatus,
        personal_rating as personalRating,
        created_at as createdAt,
        updated_at as updatedAt
      FROM books
      ORDER BY created_at DESC
    `)

    const rows = stmt.all() as any[]
    
    // 批量获取所有书籍的标签，避免N+1查询
    const bookIds = rows.map(row => row.id)
    const tagsMap = this.getTagsByBookIds(bookIds)

    const books = rows.map((row) => ({
      ...row,
      readingStatus: row.readingStatus || 'unread',
      wordCountSource: row.wordCountSource || 'search',
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null),
      updatedAt: row.updatedAt && typeof row.updatedAt === 'object' && row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : (row.updatedAt || null),
      tags: tagsMap.get(row.id) || []
    }))

    // 存入缓存
    cacheService.set(cacheKey, books)

    return books
  }

  /**
   * 更新书籍
   */
  updateBook(id: number, input: Partial<BookInput>): Book | null {
    const db = this.getDatabase()
    
    // 构建动态更新语句
    const fields: string[] = []
    const values: any[] = []

    if (input.title !== undefined) {
      fields.push('title = ?')
      values.push(input.title)
    }
    if (input.author !== undefined) {
      fields.push('author = ?')
      values.push(input.author || null)
    }
    if (input.coverUrl !== undefined) {
      fields.push('cover_url = ?')
      values.push(input.coverUrl || null)
    }
    if (input.platform !== undefined) {
      fields.push('platform = ?')
      values.push(input.platform || null)
    }
    if (input.category !== undefined) {
      fields.push('category = ?')
      values.push(input.category || null)
    }
    if (input.description !== undefined) {
      fields.push('description = ?')
      values.push(input.description || null)
    }
    if (input.wordCountSource !== undefined) {
      fields.push('word_count_source = ?')
      values.push(input.wordCountSource)
    }
    if (input.wordCountDisplay !== undefined) {
      fields.push('word_count_display = ?')
      values.push(input.wordCountDisplay || null)
    }
    if (input.wordCountSearch !== undefined) {
      fields.push('word_count_search = ?')
      values.push(input.wordCountSearch || null)
    }
    if (input.wordCountDocument !== undefined) {
      fields.push('word_count_document = ?')
      values.push(input.wordCountDocument || null)
    }
    if (input.wordCountManual !== undefined) {
      fields.push('word_count_manual = ?')
      values.push(input.wordCountManual || null)
    }
    if (input.isbn !== undefined) {
      fields.push('isbn = ?')
      values.push(input.isbn || null)
    }
    if (input.sourceUrl !== undefined) {
      fields.push('source_url = ?')
      values.push(input.sourceUrl || null)
    }
    if (input.readingStatus !== undefined) {
      fields.push('reading_status = ?')
      values.push(input.readingStatus)
    }
    if (input.personalRating !== undefined) {
      fields.push('personal_rating = ?')
      values.push(input.personalRating || null)
    }

    if (fields.length === 0) {
      return this.getBookById(id)
    }

    values.push(id)
    const stmt = db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)

    // 清除相关缓存
    cacheService.clearPattern('^books:')

    return this.getBookById(id)
  }

  /**
   * 删除书籍
   */
  deleteBook(id: number): boolean {
    const db = this.getDatabase()
    const stmt = db.prepare('DELETE FROM books WHERE id = ?')
    const result = stmt.run(id)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    
    // 清除相关缓存
    if (changes > 0) {
      cacheService.clearPattern('^books:')
    }
    
    return changes > 0
  }

  /**
   * 批量删除书籍
   */
  deleteBooks(ids: number[]): number {
    if (ids.length === 0) return 0
    const db = this.getDatabase()
    const placeholders = ids.map(() => '?').join(',')
    const stmt = db.prepare(`DELETE FROM books WHERE id IN (${placeholders})`)
    const result = stmt.run(...ids)
    return result && typeof result.changes === 'number' ? result.changes : 0
  }

  
  /**
   * 分页查询书籍（支持筛选和排序）
   */
  getBooksPaginated(
    page: number = 1,
    pageSize: number = 20,
    filters?: BookFilters,
    sort?: BookSort
  ): PaginatedResult<Book> {
    const db = this.getDatabase()
    const offset = (page - 1) * pageSize

    // 构建WHERE条件
    const conditions: string[] = []
    const params: any[] = []

    if (filters?.readingStatus) {
      conditions.push('reading_status = ?')
      params.push(filters.readingStatus)
    }

    if (filters?.category) {
      conditions.push('category = ?')
      params.push(filters.category)
    }

    if (filters?.platform) {
      conditions.push('platform = ?')
      params.push(filters.platform)
    }

    if (filters?.keyword) {
      const searchTerm = `%${filters.keyword}%`
      conditions.push('(title LIKE ? OR author LIKE ? OR description LIKE ?)')
      params.push(searchTerm, searchTerm, searchTerm)
    }

    // 标签筛选需要JOIN
    let tagJoin = ''
    if (filters?.tagIds && filters.tagIds.length > 0) {
      tagJoin = `INNER JOIN book_tags bt_filter ON b.id = bt_filter.book_id`
      const placeholders = filters.tagIds.map(() => '?').join(',')
      conditions.push(`bt_filter.tag_id IN (${placeholders})`)
      params.push(...filters.tagIds)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 构建ORDER BY子句
    let orderBy = 'ORDER BY created_at DESC'
    if (sort?.sortBy) {
      switch (sort.sortBy) {
        case 'wordCount':
          orderBy = `ORDER BY word_count_display ${sort.sortOrder || 'desc'}`
          break
        case 'createdAt':
          orderBy = `ORDER BY created_at ${sort.sortOrder || 'desc'}`
          break
        case 'rating':
          orderBy = `ORDER BY personal_rating ${sort.sortOrder || 'desc'}`
          break
        case 'title':
          orderBy = `ORDER BY title ${sort.sortOrder || 'asc'}`
          break
        case 'author':
          orderBy = `ORDER BY author ${sort.sortOrder || 'asc'}, title ${sort.sortOrder || 'asc'}`
          break
        default:
          orderBy = 'ORDER BY created_at DESC'
      }
    }

    // 查询总数
    const countStmt = db.prepare(`
      SELECT COUNT(DISTINCT b.id) as total
      FROM books b
      ${tagJoin}
      ${whereClause}
    `)
    const countResult = countStmt.get(...params) as { total: number }
    const total = countResult?.total || 0

    // 查询数据
    const dataStmt = db.prepare(`
      SELECT DISTINCT
        b.id, b.title, b.author, b.cover_url as coverUrl, b.platform, b.category, b.description,
        b.word_count_source as wordCountSource,
        b.word_count_search as wordCountSearch,
        b.word_count_document as wordCountDocument,
        b.word_count_manual as wordCountManual,
        b.word_count_display as wordCountDisplay,
        b.isbn, b.source_url as sourceUrl,
        b.reading_status as readingStatus,
        b.personal_rating as personalRating,
        b.created_at as createdAt,
        b.updated_at as updatedAt
      FROM books b
      ${tagJoin}
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `)

    const rows = dataStmt.all(...params, pageSize, offset) as any[]

    // 批量获取标签
    const bookIds = rows.map(row => row.id)
    const tagsMap = this.getTagsByBookIds(bookIds)

    const items = rows.map((row) => ({
      ...row,
      readingStatus: row.readingStatus || 'unread',
      wordCountSource: row.wordCountSource || 'search',
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null),
      updatedAt: row.updatedAt && typeof row.updatedAt === 'object' && row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : (row.updatedAt || null),
      tags: tagsMap.get(row.id) || []
    }))

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  /**
   * 搜索书籍
   */
  searchBooks(keyword: string): Book[] {
    const db = this.getDatabase()
    const searchTerm = `%${keyword}%`
    const stmt = db.prepare(`
      SELECT
        id, title, author, cover_url as coverUrl, platform, category, description,
        word_count_source as wordCountSource,
        word_count_search as wordCountSearch,
        word_count_document as wordCountDocument,
        word_count_manual as wordCountManual,
        word_count_display as wordCountDisplay,
        isbn, source_url as sourceUrl,
        reading_status as readingStatus,
        personal_rating as personalRating,
        created_at as createdAt,
        updated_at as updatedAt
      FROM books
      WHERE title LIKE ? OR author LIKE ? OR description LIKE ?
      ORDER BY created_at DESC
    `)

    const rows = stmt.all(searchTerm, searchTerm, searchTerm) as any[]
    
    // 批量获取所有书籍的标签，避免N+1查询
    const bookIds = rows.map(row => row.id)
    const tagsMap = this.getTagsByBookIds(bookIds)

    return rows.map((row) => ({
      ...row,
      readingStatus: row.readingStatus || 'unread',
      wordCountSource: row.wordCountSource || 'search',
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null),
      updatedAt: row.updatedAt && typeof row.updatedAt === 'object' && row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : (row.updatedAt || null),
      tags: tagsMap.get(row.id) || []
    }))
  }

  // ============================================
  // 文档 CRUD 操作
  // ============================================

  /**
   * 创建文档
   */
  createDocument(input: DocumentInput): Document {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      INSERT INTO documents (book_id, file_name, file_path, file_type, file_size, word_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      input.bookId,
      input.fileName,
      input.filePath,
      input.fileType,
      input.fileSize,
      input.wordCount || null
    )

    // 确保安全地获取插入的ID，避免可能的序列化问题
    const insertId = result && typeof result.lastInsertRowid === 'number' ? result.lastInsertRowid : null
    if (!insertId) {
      throw new Error('创建文档失败：无法获取插入的ID')
    }
    return this.getDocumentById(insertId)!
  }

  /**
   * 根据 ID 获取文档
   */
  getDocumentById(id: number): Document | null {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, file_name as fileName, file_path as filePath,
        file_type as fileType, file_size as fileSize, word_count as wordCount,
        uploaded_at as uploadedAt
      FROM documents
      WHERE id = ?
    `)

    const row = stmt.get(id) as any
    if (!row) return null

    return {
      ...row,
      // 确保日期对象可以被序列化
      uploadedAt: row.uploadedAt && typeof row.uploadedAt === 'object' && row.uploadedAt instanceof Date
        ? row.uploadedAt.toISOString()
        : (row.uploadedAt || null)
    }
  }

  /**
   * 根据书籍 ID 获取所有文档
   */
  getDocumentsByBookId(bookId: number): Document[] {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, file_name as fileName, file_path as filePath,
        file_type as fileType, file_size as fileSize, word_count as wordCount,
        uploaded_at as uploadedAt
      FROM documents
      WHERE book_id = ?
      ORDER BY uploaded_at DESC
    `)

    const rows = stmt.all(bookId) as any[]
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      uploadedAt: row.uploadedAt && typeof row.uploadedAt === 'object' && row.uploadedAt instanceof Date
        ? row.uploadedAt.toISOString()
        : (row.uploadedAt || null)
    }))
  }

  /**
   * 更新文档
   */
  updateDocument(id: number, input: Partial<DocumentInput>): Document | null {
    const db = this.getDatabase()
    
    const fields: string[] = []
    const values: any[] = []

    if (input.fileName !== undefined) {
      fields.push('file_name = ?')
      values.push(input.fileName)
    }
    if (input.filePath !== undefined) {
      fields.push('file_path = ?')
      values.push(input.filePath)
    }
    if (input.fileType !== undefined) {
      fields.push('file_type = ?')
      values.push(input.fileType)
    }
    if (input.fileSize !== undefined) {
      fields.push('file_size = ?')
      values.push(input.fileSize)
    }
    if (input.wordCount !== undefined) {
      fields.push('word_count = ?')
      values.push(input.wordCount || null)
    }

    if (fields.length === 0) {
      return this.getDocumentById(id)
    }

    values.push(id)
    const stmt = db.prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)

    return this.getDocumentById(id)
  }

  /**
   * 删除文档
   */
  deleteDocument(id: number): boolean {
    const db = this.getDatabase()
    const stmt = db.prepare('DELETE FROM documents WHERE id = ?')
    const result = stmt.run(id)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    return changes > 0
  }

  // ============================================
  // 笔记 CRUD 操作
  // ============================================

  /**
   * 创建笔记
   */
  createNote(input: NoteInput): Note {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      INSERT INTO notes (book_id, note_type, content)
      VALUES (?, ?, ?)
    `)

    const result = stmt.run(input.bookId, input.noteType, input.content)

    // 确保安全地获取插入的ID，避免可能的序列化问题
    const insertId = result && typeof result.lastInsertRowid === 'number' ? result.lastInsertRowid : null
    if (!insertId) {
      throw new Error('创建笔记失败：无法获取插入的ID')
    }
    return this.getNoteById(insertId)!
  }

  /**
   * 根据 ID 获取笔记
   */
  getNoteById(id: number): Note | null {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, note_type as noteType, content,
        created_at as createdAt
      FROM notes
      WHERE id = ?
    `)

    const row = stmt.get(id) as any
    if (!row) return null

    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null)
    }
  }

  /**
   * 根据书籍 ID 获取所有笔记
   */
  getNotesByBookId(bookId: number): Note[] {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, note_type as noteType, content,
        created_at as createdAt
      FROM notes
      WHERE book_id = ?
      ORDER BY created_at DESC
    `)

    const rows = stmt.all(bookId) as any[]
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null)
    }))
  }

  /**
   * 更新笔记
   */
  updateNote(id: number, input: Partial<NoteInput>): Note | null {
    const db = this.getDatabase()
    
    const fields: string[] = []
    const values: any[] = []

    if (input.noteType !== undefined) {
      fields.push('note_type = ?')
      values.push(input.noteType)
    }
    if (input.content !== undefined) {
      fields.push('content = ?')
      values.push(input.content)
    }

    if (fields.length === 0) {
      return this.getNoteById(id)
    }

    values.push(id)
    const stmt = db.prepare(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)

    return this.getNoteById(id)
  }

  /**
   * 删除笔记
   */
  deleteNote(id: number): boolean {
    const db = this.getDatabase()
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?')
    const result = stmt.run(id)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    return changes > 0
  }

  // ============================================
  // 标签 CRUD 操作
  // ============================================

  /**
   * 创建标签
   */
  createTag(input: TagInput): Tag {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      INSERT INTO tags (tag_name, color)
      VALUES (?, ?)
    `)

    const result = stmt.run(input.tagName, input.color || null)

    // 确保安全地获取插入的ID，避免可能的序列化问题
    const insertId = result && typeof result.lastInsertRowid === 'number' ? result.lastInsertRowid : null
    if (!insertId) {
      throw new Error('创建标签失败：无法获取插入的ID')
    }
    return this.getTagById(insertId)!
  }

  /**
   * 根据 ID 获取标签
   */
  getTagById(id: number): Tag | null {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      WHERE id = ?
    `)

    const row = stmt.get(id) as any
    if (!row) return null

    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null)
    }
  }

  /**
   * 获取所有标签
   */
  getAllTags(): Tag[] {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      ORDER BY created_at DESC
    `)

    const rows = stmt.all() as any[]
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null)
    }))
  }

  /**
   * 根据名称获取标签
   */
  getTagByName(tagName: string): Tag | null {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      WHERE tag_name = ?
    `)

    const row = stmt.get(tagName) as any
    if (!row) return null

    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null)
    }
  }

  /**
   * 更新标签
   */
  updateTag(id: number, input: Partial<TagInput>): Tag | null {
    const db = this.getDatabase()
    
    const fields: string[] = []
    const values: any[] = []

    if (input.tagName !== undefined) {
      fields.push('tag_name = ?')
      values.push(input.tagName)
    }
    if (input.color !== undefined) {
      fields.push('color = ?')
      values.push(input.color || null)
    }

    if (fields.length === 0) {
      return this.getTagById(id)
    }

    values.push(id)
    const stmt = db.prepare(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)

    return this.getTagById(id)
  }

  /**
   * 删除标签
   */
  deleteTag(id: number): boolean {
    const db = this.getDatabase()
    const stmt = db.prepare('DELETE FROM tags WHERE id = ?')
    const result = stmt.run(id)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    return changes > 0
  }

  /**
   * 为书籍添加标签
   */
  addTagToBook(bookId: number, tagId: number): boolean {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO book_tags (book_id, tag_id)
      VALUES (?, ?)
    `)
    const result = stmt.run(bookId, tagId)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    return changes > 0
  }

  /**
   * 移除书籍标签
   */
  removeTagFromBook(bookId: number, tagId: number): boolean {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      DELETE FROM book_tags
      WHERE book_id = ? AND tag_id = ?
    `)
    const result = stmt.run(bookId, tagId)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    return changes > 0
  }

  /**
   * 获取书籍的所有标签
   */
  getTagsByBookId(bookId: number): Tag[] {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        t.id, t.tag_name as tagName, t.color, t.created_at as createdAt
      FROM tags t
      INNER JOIN book_tags bt ON t.id = bt.tag_id
      WHERE bt.book_id = ?
      ORDER BY t.created_at DESC
    `)

    const rows = stmt.all(bookId) as any[]
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null)
    }))
  }

  /**
   * 批量获取多个书籍的标签（优化N+1查询问题）
   */
  getTagsByBookIds(bookIds: number[]): Map<number, Tag[]> {
    if (bookIds.length === 0) {
      return new Map()
    }

    const db = this.getDatabase()
    const placeholders = bookIds.map(() => '?').join(',')
    const stmt = db.prepare(`
      SELECT
        bt.book_id as bookId,
        t.id, t.tag_name as tagName, t.color, t.created_at as createdAt
      FROM tags t
      INNER JOIN book_tags bt ON t.id = bt.tag_id
      WHERE bt.book_id IN (${placeholders})
      ORDER BY bt.book_id, t.created_at DESC
    `)

    const rows = stmt.all(...bookIds) as any[]
    const tagMap = new Map<number, Tag[]>()

    // 初始化所有书籍ID的标签数组
    bookIds.forEach(id => {
      tagMap.set(id, [])
    })

    // 填充标签数据
    rows.forEach((row) => {
      const bookId = row.bookId
      if (tagMap.has(bookId)) {
        tagMap.get(bookId)!.push({
          id: row.id,
          tagName: row.tagName,
          color: row.color,
          createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : (row.createdAt || null)
        })
      }
    })

    return tagMap
  }

  /**
   * 批量为书籍添加标签
   */
  batchAddTagToBooks(bookIds: number[], tagId: number): number {
    if (bookIds.length === 0) return 0
    const db = this.getDatabase()
    const transaction = db.transaction((bookIds: number[], tagId: number) => {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO book_tags (book_id, tag_id)
        VALUES (?, ?)
      `)
      let count = 0
      for (const bookId of bookIds) {
        const result = stmt.run(bookId, tagId)
        if (result && typeof result.changes === 'number' && result.changes > 0) {
          count++
        }
      }
      return count
    })
    return transaction(bookIds, tagId)
  }

  /**
   * 获取标签的使用统计（有多少本书使用了该标签）
   */
  getTagUsageCount(tagId: number): number {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM book_tags
      WHERE tag_id = ?
    `)
    const row = stmt.get(tagId) as any
    return row?.count || 0
  }

  // ============================================
  // 阅读进度 CRUD 操作
  // ============================================

  /**
   * 创建或更新阅读进度
   */
  upsertReadingProgress(input: ReadingProgressInput): ReadingProgress {
    const db = this.getDatabase()
    
    // 先尝试更新
    const updateStmt = db.prepare(`
      UPDATE reading_progress
      SET current_chapter = ?, current_page = ?, progress_percentage = ?, last_read_at = ?
      WHERE book_id = ?
    `)
    
    const updateResult = updateStmt.run(
      input.currentChapter || null,
      input.currentPage || null,
      input.progressPercentage || null,
      input.lastReadAt || new Date().toISOString(),
      input.bookId
    )

    // 确保安全地获取受影响的行数，避免可能的序列化问题
    const changes = updateResult && typeof updateResult.changes === 'number' ? updateResult.changes : 0

    // 如果没有更新任何行，则插入
    if (changes === 0) {
      const insertStmt = db.prepare(`
        INSERT INTO reading_progress (book_id, current_chapter, current_page, progress_percentage, last_read_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      
      insertStmt.run(
        input.bookId,
        input.currentChapter || null,
        input.currentPage || null,
        input.progressPercentage || null,
        input.lastReadAt || new Date().toISOString()
      )
    }

    return this.getReadingProgressByBookId(input.bookId)!
  }

  /**
   * 根据书籍 ID 获取阅读进度
   */
  getReadingProgressByBookId(bookId: number): ReadingProgress | null {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, current_chapter as currentChapter,
        current_page as currentPage, progress_percentage as progressPercentage,
        last_read_at as lastReadAt
      FROM reading_progress
      WHERE book_id = ?
    `)

    const row = stmt.get(bookId) as any
    if (!row) return null

    return {
      ...row,
      // 确保日期对象可以被序列化
      lastReadAt: row.lastReadAt && typeof row.lastReadAt === 'object' && row.lastReadAt instanceof Date
        ? row.lastReadAt.toISOString()
        : (row.lastReadAt || null)
    }
  }

  /**
   * 删除阅读进度
   */
  deleteReadingProgress(bookId: number): boolean {
    const db = this.getDatabase()
    const stmt = db.prepare('DELETE FROM reading_progress WHERE book_id = ?')
    const result = stmt.run(bookId)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    return changes > 0
  }
}

// 导出单例实例
export const databaseService = new DatabaseService()

