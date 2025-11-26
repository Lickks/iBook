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
import type {
  Bookshelf,
  BookshelfInput,
  BookshelfStats
} from '../../renderer/src/types/bookshelf'

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
      
      // 初始化默认书架
      this.initializeDefaultBookshelf()
      
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

    // 自动将新创建的书籍添加到默认书架
    try {
      const defaultBookshelfStmt = db.prepare('SELECT id FROM bookshelves WHERE is_default = 1 LIMIT 1')
      const defaultBookshelf = defaultBookshelfStmt.get() as { id: number } | undefined
      
      if (defaultBookshelf) {
        const addToBookshelfStmt = db.prepare(`
          INSERT OR IGNORE INTO book_bookshelves (book_id, bookshelf_id)
          VALUES (?, ?)
        `)
        addToBookshelfStmt.run(insertId, defaultBookshelf.id)
      }
    } catch (error) {
      // 如果添加到默认书架失败，记录错误但不影响书籍创建
      console.warn('将新书籍添加到默认书架失败:', error)
    }

    // 清除相关缓存
    cacheService.clearPattern('^books:')
    cacheService.clearPattern('^bookshelves:')

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
    
    try {
      // 确保外键约束已启用（在 better-sqlite3 中，pragma 需要在连接级别设置）
      // 由于在 initialize() 中已经设置了，这里再次确保
      db.pragma('foreign_keys = ON')
      
      // 使用事务确保数据一致性
      const transaction = db.transaction((bookIds: number[]) => {
        // 构建批量删除SQL语句
        const placeholders = bookIds.map(() => '?').join(',')
        const sql = `DELETE FROM books WHERE id IN (${placeholders})`
        const stmt = db.prepare(sql)
        const result = stmt.run(...bookIds)
        
        // 确保只返回基本数据类型，避免可能的序列化问题
        const changes = result && typeof result.changes === 'number' ? result.changes : 0
        return changes
      })
      
      const changes = transaction(ids)
      
      // 清除相关缓存
      if (changes > 0) {
        cacheService.clearPattern('^books:')
      }
      
      return changes
    } catch (error: any) {
      console.error('批量删除书籍失败:', error)
      console.error('删除的ID列表:', ids)
      console.error('错误堆栈:', error?.stack)
      const errorMessage = error?.message || String(error) || '未知错误'
      throw new Error(`批量删除书籍失败: ${errorMessage}`)
    }
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
      const sortOrder = sort.sortOrder || (sort.sortBy === 'title' || sort.sortBy === 'author' ? 'asc' : 'desc')
      switch (sort.sortBy) {
        case 'wordCount':
          // 字数排序，相同时按书名A-Z排序
          orderBy = `ORDER BY word_count_display ${sortOrder}, title ASC`
          break
        case 'createdAt':
          // 创建时间排序，相同时按书名A-Z排序
          orderBy = `ORDER BY created_at ${sortOrder}, title ASC`
          break
        case 'rating':
          // 评分排序，相同时按书名A-Z排序
          orderBy = `ORDER BY personal_rating ${sortOrder}, title ASC`
          break
        case 'title':
          // 书名排序，相同时也按书名A-Z排序（虽然不太可能，但为了统一性）
          orderBy = `ORDER BY title ${sortOrder}, title ASC`
          break
        case 'author':
          // 按作者首字母排序，相同时按书名A-Z排序
          // SQLite使用SUBSTR函数提取首字符，处理NULL和空字符串
          // CASE WHEN 确保空字符串和NULL都返回'z'（排最后）
          orderBy = `ORDER BY CASE 
            WHEN author IS NULL OR TRIM(author) = '' THEN 'z'
            ELSE SUBSTR(LOWER(TRIM(author)), 1, 1)
          END ${sortOrder}, title ASC`
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
   * 如果关联已存在，返回 true（幂等操作）
   */
  addTagToBook(bookId: number, tagId: number): boolean {
    const db = this.getDatabase()
    // 先检查关联是否已存在
    const checkStmt = db.prepare(`
      SELECT 1 FROM book_tags
      WHERE book_id = ? AND tag_id = ?
      LIMIT 1
    `)
    const exists = checkStmt.get(bookId, tagId)
    if (exists) {
      // 关联已存在，视为成功（幂等操作）
      return true
    }
    // 关联不存在，执行插入
    const stmt = db.prepare(`
      INSERT INTO book_tags (book_id, tag_id)
      VALUES (?, ?)
    `)
    const result = stmt.run(bookId, tagId)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    
    // 清除相关缓存，确保标签变更后能获取最新数据
    if (changes > 0) {
      cacheService.clearPattern('^books:')
    }
    
    return changes > 0
  }

  /**
   * 移除书籍标签
   * 如果关联不存在，返回 true（幂等操作）
   */
  removeTagFromBook(bookId: number, tagId: number): boolean {
    const db = this.getDatabase()
    // 先检查关联是否存在
    const checkStmt = db.prepare(`
      SELECT 1 FROM book_tags
      WHERE book_id = ? AND tag_id = ?
      LIMIT 1
    `)
    const exists = checkStmt.get(bookId, tagId)
    if (!exists) {
      // 关联不存在，视为成功（幂等操作）
      return true
    }
    // 关联存在，执行删除
    const stmt = db.prepare(`
      DELETE FROM book_tags
      WHERE book_id = ? AND tag_id = ?
    `)
    const result = stmt.run(bookId, tagId)
    // 确保只返回基本数据类型，避免可能的序列化问题
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    
    // 清除相关缓存，确保标签变更后能获取最新数据
    if (changes > 0) {
      cacheService.clearPattern('^books:')
    }
    
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
    const count = transaction(bookIds, tagId)
    
    // 清除相关缓存，确保批量添加标签后能获取最新数据
    if (count > 0) {
      cacheService.clearPattern('^books:')
    }
    
    return count
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

  // ============================================
  // 书架 CRUD 操作
  // ============================================

  /**
   * 初始化默认书架
   * 如果不存在默认书架，则创建一个，并将所有现有书籍关联到默认书架
   */
  initializeDefaultBookshelf(): void {
    const db = this.getDatabase()
    
    // 检查是否已存在默认书架
    const checkStmt = db.prepare('SELECT id FROM bookshelves WHERE is_default = 1 LIMIT 1')
    const existing = checkStmt.get() as any
    
    if (!existing) {
      // 创建默认书架
      const createStmt = db.prepare(`
        INSERT INTO bookshelves (name, description, is_default, sort_order)
        VALUES (?, ?, 1, 0)
      `)
      const result = createStmt.run('全局书架', '所有书籍的默认书架')
      const defaultBookshelfId = result.lastInsertRowid as number
      
      // 将所有现有书籍关联到默认书架
      const allBooksStmt = db.prepare('SELECT id FROM books')
      const allBooks = allBooksStmt.all() as Array<{ id: number }>
      
      if (allBooks.length > 0) {
        const insertStmt = db.prepare(`
          INSERT OR IGNORE INTO book_bookshelves (book_id, bookshelf_id)
          VALUES (?, ?)
        `)
        const insertMany = db.transaction((books: Array<{ id: number }>) => {
          for (const book of books) {
            insertStmt.run(book.id, defaultBookshelfId)
          }
        })
        insertMany(allBooks)
      }
      
      console.log('默认书架初始化完成，已关联', allBooks.length, '本书籍')
    }
  }

  /**
   * 创建书架
   */
  createBookshelf(name: string, description?: string): Bookshelf {
    const db = this.getDatabase()
    
    // 获取当前最大排序值
    const maxOrderStmt = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM bookshelves')
    const maxOrder = (maxOrderStmt.get() as any)?.max_order || 0
    
    const stmt = db.prepare(`
      INSERT INTO bookshelves (name, description, is_default, sort_order)
      VALUES (?, ?, 0, ?)
    `)
    
    const result = stmt.run(name, description || null, maxOrder + 1)
    const insertId = result.lastInsertRowid as number
    
    // 清除缓存
    cacheService.clearPattern('^bookshelves:')
    
    return this.getBookshelfById(insertId)!
  }

  /**
   * 获取所有书架
   */
  getAllBookshelves(): Bookshelf[] {
    const cacheKey = 'bookshelves:all'
    
    const cached = cacheService.get<Bookshelf[]>(cacheKey)
    if (cached) {
      return cached
    }
    
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, name, description, is_default as isDefault,
        sort_order as sortOrder,
        created_at as createdAt,
        updated_at as updatedAt
      FROM bookshelves
      ORDER BY is_default DESC, sort_order ASC, created_at ASC
    `)
    
    const rows = stmt.all() as any[]
    const bookshelves = rows.map((row) => ({
      ...row,
      isDefault: Boolean(row.isDefault),
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null),
      updatedAt: row.updatedAt && typeof row.updatedAt === 'object' && row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : (row.updatedAt || null)
    }))
    
    cacheService.set(cacheKey, bookshelves)
    return bookshelves
  }

  /**
   * 根据 ID 获取书架
   */
  getBookshelfById(id: number): Bookshelf | null {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        id, name, description, is_default as isDefault,
        sort_order as sortOrder,
        created_at as createdAt,
        updated_at as updatedAt
      FROM bookshelves
      WHERE id = ?
    `)
    
    const row = stmt.get(id) as any
    if (!row) return null
    
    return {
      ...row,
      isDefault: Boolean(row.isDefault),
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null),
      updatedAt: row.updatedAt && typeof row.updatedAt === 'object' && row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : (row.updatedAt || null)
    }
  }

  /**
   * 更新书架
   */
  updateBookshelf(id: number, input: Partial<BookshelfInput>): Bookshelf | null {
    const db = this.getDatabase()
    
    // 不允许修改默认书架的 is_default 字段
    const fields: string[] = []
    const values: any[] = []
    
    if (input.name !== undefined) {
      fields.push('name = ?')
      values.push(input.name)
    }
    if (input.description !== undefined) {
      fields.push('description = ?')
      values.push(input.description || null)
    }
    if (input.sortOrder !== undefined) {
      fields.push('sort_order = ?')
      values.push(input.sortOrder)
    }
    
    if (fields.length === 0) {
      return this.getBookshelfById(id)
    }
    
    values.push(id)
    const stmt = db.prepare(`
      UPDATE bookshelves
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    stmt.run(...values)
    
    // 清除缓存
    cacheService.clearPattern('^bookshelves:')
    
    return this.getBookshelfById(id)
  }

  /**
   * 删除书架
   */
  deleteBookshelf(id: number): boolean {
    const db = this.getDatabase()
    
    // 检查是否为默认书架
    const checkStmt = db.prepare('SELECT is_default FROM bookshelves WHERE id = ?')
    const bookshelf = checkStmt.get(id) as any
    
    if (bookshelf?.is_default) {
      throw new Error('不能删除默认书架')
    }
    
    const stmt = db.prepare('DELETE FROM bookshelves WHERE id = ?')
    const result = stmt.run(id)
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    
    // 清除缓存
    cacheService.clearPattern('^bookshelves:')
    cacheService.clearPattern('^books:')
    
    return changes > 0
  }

  /**
   * 添加书籍到书架
   */
  addBooksToBookshelf(bookshelfId: number, bookIds: number[]): number {
    if (bookIds.length === 0) return 0
    
    // 确保 bookIds 是纯数组
    const ids = Array.isArray(bookIds) ? [...bookIds] : []
    if (ids.length === 0) return 0
    
    const db = this.getDatabase()
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO book_bookshelves (book_id, bookshelf_id)
      VALUES (?, ?)
    `)
    
    const insertMany = db.transaction((bookIdList: number[]) => {
      let count = 0
      for (const bookId of bookIdList) {
        try {
          const result = stmt.run(Number(bookId), Number(bookshelfId))
          if (result && typeof result.changes === 'number' && result.changes > 0) {
            count++
          }
        } catch (error) {
          // 忽略重复插入错误
        }
      }
      return count
    })
    
    const count = insertMany(ids)
    
    // 清除缓存
    cacheService.clearPattern('^books:')
    cacheService.clearPattern('^bookshelves:')
    
    // 确保返回的是纯数字
    return Number(count) || 0
  }

  /**
   * 从书架移除书籍
   */
  removeBooksFromBookshelf(bookshelfId: number, bookIds: number[]): number {
    // 确保 bookIds 是纯数组
    const ids = Array.isArray(bookIds) ? [...bookIds] : []
    if (ids.length === 0) return 0
    
    const db = this.getDatabase()
    
    // 检查是否为默认书架
    const checkStmt = db.prepare('SELECT is_default FROM bookshelves WHERE id = ?')
    const bookshelf = checkStmt.get(Number(bookshelfId)) as any
    
    if (bookshelf?.is_default) {
      throw new Error('不能从默认书架移除书籍')
    }
    
    const placeholders = ids.map(() => '?').join(',')
    const stmt = db.prepare(`
      DELETE FROM book_bookshelves
      WHERE bookshelf_id = ? AND book_id IN (${placeholders})
    `)
    
    const result = stmt.run(Number(bookshelfId), ...ids.map(id => Number(id)))
    const changes = result && typeof result.changes === 'number' ? result.changes : 0
    
    // 清除缓存
    cacheService.clearPattern('^books:')
    cacheService.clearPattern('^bookshelves:')
    
    // 确保返回的是纯数字
    return Number(changes) || 0
  }

  /**
   * 获取书架中的书籍
   */
  getBooksInBookshelf(bookshelfId: number | null, filters?: BookFilters): Book[] {
    const db = this.getDatabase()
    
    let query = `
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
    `
    
    const conditions: string[] = []
    const params: any[] = []
    
    if (bookshelfId !== null) {
      query += ' INNER JOIN book_bookshelves bb ON b.id = bb.book_id'
      conditions.push('bb.bookshelf_id = ?')
      params.push(bookshelfId)
    }
    
    if (filters) {
      if (filters.readingStatus) {
        conditions.push('b.reading_status = ?')
        params.push(filters.readingStatus)
      }
      if (filters.category) {
        conditions.push('b.category = ?')
        params.push(filters.category)
      }
      if (filters.platform) {
        conditions.push('b.platform = ?')
        params.push(filters.platform)
      }
      if (filters.keyword) {
        conditions.push('(b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)')
        const keyword = `%${filters.keyword}%`
        params.push(keyword, keyword, keyword)
      }
      if (filters.tagIds && filters.tagIds.length > 0) {
        query += ' INNER JOIN book_tags bt ON b.id = bt.book_id'
        const tagPlaceholders = filters.tagIds.map(() => '?').join(',')
        conditions.push(`bt.tag_id IN (${tagPlaceholders})`)
        params.push(...filters.tagIds)
      }
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY b.created_at DESC'
    
    const stmt = db.prepare(query)
    const rows = stmt.all(...params) as any[]
    
    // 批量获取标签
    const bookIds = rows.map(row => row.id)
    const tagsMap = this.getTagsByBookIds(bookIds)
    
    return rows.map((row) => ({
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
  }

  /**
   * 获取书架统计信息
   */
  getBookshelfStats(bookshelfId: number): BookshelfStats {
    const db = this.getDatabase()
    
    const stmt = db.prepare(`
      SELECT
        COUNT(DISTINCT bb.book_id) as totalBooks,
        SUM(CASE WHEN b.reading_status = 'finished' THEN 1 ELSE 0 END) as finishedBooks,
        SUM(CASE WHEN b.reading_status = 'reading' THEN 1 ELSE 0 END) as readingBooks,
        SUM(CASE WHEN b.reading_status = 'to-read' THEN 1 ELSE 0 END) as toReadBooks,
        SUM(CASE WHEN b.reading_status = 'dropped' THEN 1 ELSE 0 END) as droppedBooks,
        COALESCE(SUM(b.word_count_display), 0) as totalWords,
        AVG(b.personal_rating) as avgRating
      FROM book_bookshelves bb
      INNER JOIN books b ON bb.book_id = b.id
      WHERE bb.bookshelf_id = ?
    `)
    
    const row = stmt.get(bookshelfId) as any
    
    return {
      totalBooks: row?.totalBooks || 0,
      finishedBooks: row?.finishedBooks || 0,
      readingBooks: row?.readingBooks || 0,
      toReadBooks: row?.toReadBooks || 0,
      droppedBooks: row?.droppedBooks || 0,
      totalWords: row?.totalWords || 0,
      avgRating: row?.avgRating || null
    }
  }

  /**
   * 获取书籍所属的书架列表
   */
  getBookshelvesByBookId(bookId: number): Bookshelf[] {
    const db = this.getDatabase()
    const stmt = db.prepare(`
      SELECT
        bs.id, bs.name, bs.description, bs.is_default as isDefault,
        bs.sort_order as sortOrder,
        bs.created_at as createdAt,
        bs.updated_at as updatedAt
      FROM bookshelves bs
      INNER JOIN book_bookshelves bb ON bs.id = bb.bookshelf_id
      WHERE bb.book_id = ?
      ORDER BY bs.is_default DESC, bs.sort_order ASC
    `)
    
    const rows = stmt.all(bookId) as any[]
    return rows.map((row) => ({
      ...row,
      isDefault: Boolean(row.isDefault),
      createdAt: row.createdAt && typeof row.createdAt === 'object' && row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt || null),
      updatedAt: row.updatedAt && typeof row.updatedAt === 'object' && row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : (row.updatedAt || null)
    }))
  }
}

// 导出单例实例
export const databaseService = new DatabaseService()

