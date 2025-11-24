"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");
const uuid = require("uuid");
const EPub = require("epub");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const iconv = require("iconv-lite");
const jschardet = require("jschardet");
const axios = require("axios");
const cheerio = require("cheerio");
const jimp = require("jimp");
const promises = require("fs/promises");
const url = require("url");
const XLSX = require("xlsx");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const iconv__namespace = /* @__PURE__ */ _interopNamespaceDefault(iconv);
const jschardet__namespace = /* @__PURE__ */ _interopNamespaceDefault(jschardet);
const cheerio__namespace = /* @__PURE__ */ _interopNamespaceDefault(cheerio);
const XLSX__namespace = /* @__PURE__ */ _interopNamespaceDefault(XLSX);
const icon = path.join(__dirname, "../../resources/icon.png");
let DatabaseService$1 = class DatabaseService {
  db = null;
  _dbPath;
  isInitialized = false;
  constructor() {
    this._dbPath = "";
  }
  /**
   * 获取数据库路径
   */
  getDbPath() {
    if (!this._dbPath) {
      const userDataPath = electron.app.getPath("userData");
      this._dbPath = path.join(userDataPath, "ibook.db");
    }
    return this._dbPath;
  }
  /**
   * 初始化数据库
   * 创建数据库连接并执行 schema.sql 初始化脚本
   */
  initialize() {
    if (this.isInitialized && this.db) {
      return;
    }
    try {
      this.db = new Database(this.getDbPath());
      this.isInitialized = true;
      this.db.pragma("foreign_keys = ON");
      const appPath = electron.app.getAppPath();
      const schemaPath = path.join(appPath, "database", "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf-8");
      try {
        const sanitizedSchema = this.stripUnsupportedComments(schema);
        this.db.exec(sanitizedSchema);
      } catch (error) {
        const errorMsg = String(error?.message || error);
        if (!errorMsg.includes("already exists") && !errorMsg.includes("duplicate column name") && !errorMsg.includes("no such table") && !errorMsg.includes("no such index")) {
          console.error("数据库初始化 SQL 执行失败:", errorMsg);
          throw error;
        }
      }
      console.log("数据库初始化成功:", this.getDbPath());
    } catch (error) {
      this.isInitialized = false;
      this.db = null;
      console.error("数据库初始化失败:", error);
      throw error;
    }
  }
  /**
   * 获取数据库实例
   */
  getDatabase() {
    if (!this.db) {
      this.initialize();
    }
    if (!this.db) {
      throw new Error("数据库未初始化，请先调用 initialize()");
    }
    return this.db;
  }
  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
  /**
   * 移除 SQLite 不支持的 COMMENT 语法，防止执行 schema 时出现语法错误
   */
  stripUnsupportedComments(sql) {
    return sql.replace(/\s+COMMENT\s+(['"])(?:\\.|(?!\1).)*\1/gi, "");
  }
  // ============================================
  // 书籍 CRUD 操作
  // ============================================
  /**
   * 创建书籍
   */
  createBook(input) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO books (
        title, author, cover_url, platform, category, description,
        word_count_source, word_count_search, word_count_document, 
        word_count_manual, word_count_display, isbn, source_url,
        reading_status, personal_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.title,
      input.author || null,
      input.coverUrl || null,
      input.platform || null,
      input.category || null,
      input.description || null,
      input.wordCountSource || "search",
      input.wordCountSearch || null,
      input.wordCountDocument || null,
      input.wordCountManual || null,
      input.wordCountDisplay || null,
      input.isbn || null,
      input.sourceUrl || null,
      input.readingStatus || "unread",
      input.personalRating || null
    );
    const insertId = result && typeof result.lastInsertRowid === "number" ? result.lastInsertRowid : null;
    if (!insertId) {
      throw new Error("创建书籍失败：无法获取插入的ID");
    }
    return this.getBookById(insertId);
  }
  /**
   * 根据 ID 获取书籍
   */
  getBookById(id) {
    const db = this.getDatabase();
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
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      readingStatus: row.readingStatus || "unread",
      wordCountSource: row.wordCountSource || "search",
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null,
      updatedAt: row.updatedAt && typeof row.updatedAt === "object" && row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt || null
    };
  }
  /**
   * 获取所有书籍
   */
  getAllBooks() {
    const db = this.getDatabase();
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
    `);
    const rows = stmt.all();
    return rows.map((row) => ({
      ...row,
      readingStatus: row.readingStatus || "unread",
      wordCountSource: row.wordCountSource || "search",
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null,
      updatedAt: row.updatedAt && typeof row.updatedAt === "object" && row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt || null
    }));
  }
  /**
   * 更新书籍
   */
  updateBook(id, input) {
    const db = this.getDatabase();
    const fields = [];
    const values = [];
    if (input.title !== void 0) {
      fields.push("title = ?");
      values.push(input.title);
    }
    if (input.author !== void 0) {
      fields.push("author = ?");
      values.push(input.author || null);
    }
    if (input.coverUrl !== void 0) {
      fields.push("cover_url = ?");
      values.push(input.coverUrl || null);
    }
    if (input.platform !== void 0) {
      fields.push("platform = ?");
      values.push(input.platform || null);
    }
    if (input.category !== void 0) {
      fields.push("category = ?");
      values.push(input.category || null);
    }
    if (input.description !== void 0) {
      fields.push("description = ?");
      values.push(input.description || null);
    }
    if (input.wordCountSource !== void 0) {
      fields.push("word_count_source = ?");
      values.push(input.wordCountSource);
    }
    if (input.wordCountDisplay !== void 0) {
      fields.push("word_count_display = ?");
      values.push(input.wordCountDisplay || null);
    }
    if (input.wordCountSearch !== void 0) {
      fields.push("word_count_search = ?");
      values.push(input.wordCountSearch || null);
    }
    if (input.wordCountDocument !== void 0) {
      fields.push("word_count_document = ?");
      values.push(input.wordCountDocument || null);
    }
    if (input.wordCountManual !== void 0) {
      fields.push("word_count_manual = ?");
      values.push(input.wordCountManual || null);
    }
    if (input.isbn !== void 0) {
      fields.push("isbn = ?");
      values.push(input.isbn || null);
    }
    if (input.sourceUrl !== void 0) {
      fields.push("source_url = ?");
      values.push(input.sourceUrl || null);
    }
    if (input.readingStatus !== void 0) {
      fields.push("reading_status = ?");
      values.push(input.readingStatus);
    }
    if (input.personalRating !== void 0) {
      fields.push("personal_rating = ?");
      values.push(input.personalRating || null);
    }
    if (fields.length === 0) {
      return this.getBookById(id);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE books SET ${fields.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getBookById(id);
  }
  /**
   * 删除书籍
   */
  deleteBook(id) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM books WHERE id = ?");
    const result = stmt.run(id);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  /**
   * 搜索书籍
   */
  searchBooks(keyword) {
    const db = this.getDatabase();
    const searchTerm = `%${keyword}%`;
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
    `);
    const rows = stmt.all(searchTerm, searchTerm, searchTerm);
    return rows.map((row) => ({
      ...row,
      readingStatus: row.readingStatus || "unread",
      wordCountSource: row.wordCountSource || "search",
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null,
      updatedAt: row.updatedAt && typeof row.updatedAt === "object" && row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt || null
    }));
  }
  // ============================================
  // 文档 CRUD 操作
  // ============================================
  /**
   * 创建文档
   */
  createDocument(input) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO documents (book_id, file_name, file_path, file_type, file_size, word_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.bookId,
      input.fileName,
      input.filePath,
      input.fileType,
      input.fileSize,
      input.wordCount || null
    );
    const insertId = result && typeof result.lastInsertRowid === "number" ? result.lastInsertRowid : null;
    if (!insertId) {
      throw new Error("创建文档失败：无法获取插入的ID");
    }
    return this.getDocumentById(insertId);
  }
  /**
   * 根据 ID 获取文档
   */
  getDocumentById(id) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, file_name as fileName, file_path as filePath,
        file_type as fileType, file_size as fileSize, word_count as wordCount,
        uploaded_at as uploadedAt
      FROM documents
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      uploadedAt: row.uploadedAt && typeof row.uploadedAt === "object" && row.uploadedAt instanceof Date ? row.uploadedAt.toISOString() : row.uploadedAt || null
    };
  }
  /**
   * 根据书籍 ID 获取所有文档
   */
  getDocumentsByBookId(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, file_name as fileName, file_path as filePath,
        file_type as fileType, file_size as fileSize, word_count as wordCount,
        uploaded_at as uploadedAt
      FROM documents
      WHERE book_id = ?
      ORDER BY uploaded_at DESC
    `);
    const rows = stmt.all(bookId);
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      uploadedAt: row.uploadedAt && typeof row.uploadedAt === "object" && row.uploadedAt instanceof Date ? row.uploadedAt.toISOString() : row.uploadedAt || null
    }));
  }
  /**
   * 更新文档
   */
  updateDocument(id, input) {
    const db = this.getDatabase();
    const fields = [];
    const values = [];
    if (input.fileName !== void 0) {
      fields.push("file_name = ?");
      values.push(input.fileName);
    }
    if (input.filePath !== void 0) {
      fields.push("file_path = ?");
      values.push(input.filePath);
    }
    if (input.fileType !== void 0) {
      fields.push("file_type = ?");
      values.push(input.fileType);
    }
    if (input.fileSize !== void 0) {
      fields.push("file_size = ?");
      values.push(input.fileSize);
    }
    if (input.wordCount !== void 0) {
      fields.push("word_count = ?");
      values.push(input.wordCount || null);
    }
    if (fields.length === 0) {
      return this.getDocumentById(id);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE documents SET ${fields.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getDocumentById(id);
  }
  /**
   * 删除文档
   */
  deleteDocument(id) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM documents WHERE id = ?");
    const result = stmt.run(id);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  // ============================================
  // 笔记 CRUD 操作
  // ============================================
  /**
   * 创建笔记
   */
  createNote(input) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO notes (book_id, note_type, content)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(input.bookId, input.noteType, input.content);
    const insertId = result && typeof result.lastInsertRowid === "number" ? result.lastInsertRowid : null;
    if (!insertId) {
      throw new Error("创建笔记失败：无法获取插入的ID");
    }
    return this.getNoteById(insertId);
  }
  /**
   * 根据 ID 获取笔记
   */
  getNoteById(id) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, note_type as noteType, content,
        created_at as createdAt
      FROM notes
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    };
  }
  /**
   * 根据书籍 ID 获取所有笔记
   */
  getNotesByBookId(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, note_type as noteType, content,
        created_at as createdAt
      FROM notes
      WHERE book_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(bookId);
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    }));
  }
  /**
   * 更新笔记
   */
  updateNote(id, input) {
    const db = this.getDatabase();
    const fields = [];
    const values = [];
    if (input.noteType !== void 0) {
      fields.push("note_type = ?");
      values.push(input.noteType);
    }
    if (input.content !== void 0) {
      fields.push("content = ?");
      values.push(input.content);
    }
    if (fields.length === 0) {
      return this.getNoteById(id);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE notes SET ${fields.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getNoteById(id);
  }
  /**
   * 删除笔记
   */
  deleteNote(id) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
    const result = stmt.run(id);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  // ============================================
  // 标签 CRUD 操作
  // ============================================
  /**
   * 创建标签
   */
  createTag(input) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO tags (tag_name, color)
      VALUES (?, ?)
    `);
    const result = stmt.run(input.tagName, input.color || null);
    const insertId = result && typeof result.lastInsertRowid === "number" ? result.lastInsertRowid : null;
    if (!insertId) {
      throw new Error("创建标签失败：无法获取插入的ID");
    }
    return this.getTagById(insertId);
  }
  /**
   * 根据 ID 获取标签
   */
  getTagById(id) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    };
  }
  /**
   * 获取所有标签
   */
  getAllTags() {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      ORDER BY created_at DESC
    `);
    const rows = stmt.all();
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    }));
  }
  /**
   * 根据名称获取标签
   */
  getTagByName(tagName) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      WHERE tag_name = ?
    `);
    const row = stmt.get(tagName);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    };
  }
  /**
   * 更新标签
   */
  updateTag(id, input) {
    const db = this.getDatabase();
    const fields = [];
    const values = [];
    if (input.tagName !== void 0) {
      fields.push("tag_name = ?");
      values.push(input.tagName);
    }
    if (input.color !== void 0) {
      fields.push("color = ?");
      values.push(input.color || null);
    }
    if (fields.length === 0) {
      return this.getTagById(id);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE tags SET ${fields.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getTagById(id);
  }
  /**
   * 删除标签
   */
  deleteTag(id) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM tags WHERE id = ?");
    const result = stmt.run(id);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  /**
   * 为书籍添加标签
   */
  addTagToBook(bookId, tagId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO book_tags (book_id, tag_id)
      VALUES (?, ?)
    `);
    const result = stmt.run(bookId, tagId);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  /**
   * 移除书籍标签
   */
  removeTagFromBook(bookId, tagId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      DELETE FROM book_tags
      WHERE book_id = ? AND tag_id = ?
    `);
    const result = stmt.run(bookId, tagId);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  /**
   * 获取书籍的所有标签
   */
  getTagsByBookId(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        t.id, t.tag_name as tagName, t.color, t.created_at as createdAt
      FROM tags t
      INNER JOIN book_tags bt ON t.id = bt.tag_id
      WHERE bt.book_id = ?
      ORDER BY t.created_at DESC
    `);
    const rows = stmt.all(bookId);
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    }));
  }
  // ============================================
  // 阅读进度 CRUD 操作
  // ============================================
  /**
   * 创建或更新阅读进度
   */
  upsertReadingProgress(input) {
    const db = this.getDatabase();
    const updateStmt = db.prepare(`
      UPDATE reading_progress
      SET current_chapter = ?, current_page = ?, progress_percentage = ?, last_read_at = ?
      WHERE book_id = ?
    `);
    const updateResult = updateStmt.run(
      input.currentChapter || null,
      input.currentPage || null,
      input.progressPercentage || null,
      input.lastReadAt || (/* @__PURE__ */ new Date()).toISOString(),
      input.bookId
    );
    const changes = updateResult && typeof updateResult.changes === "number" ? updateResult.changes : 0;
    if (changes === 0) {
      const insertStmt = db.prepare(`
        INSERT INTO reading_progress (book_id, current_chapter, current_page, progress_percentage, last_read_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        input.bookId,
        input.currentChapter || null,
        input.currentPage || null,
        input.progressPercentage || null,
        input.lastReadAt || (/* @__PURE__ */ new Date()).toISOString()
      );
    }
    return this.getReadingProgressByBookId(input.bookId);
  }
  /**
   * 根据书籍 ID 获取阅读进度
   */
  getReadingProgressByBookId(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, current_chapter as currentChapter,
        current_page as currentPage, progress_percentage as progressPercentage,
        last_read_at as lastReadAt
      FROM reading_progress
      WHERE book_id = ?
    `);
    const row = stmt.get(bookId);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      lastReadAt: row.lastReadAt && typeof row.lastReadAt === "object" && row.lastReadAt instanceof Date ? row.lastReadAt.toISOString() : row.lastReadAt || null
    };
  }
  /**
   * 删除阅读进度
   */
  deleteReadingProgress(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM reading_progress WHERE book_id = ?");
    const result = stmt.run(bookId);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
};
const databaseService$1 = new DatabaseService$1();
class DatabaseService2 {
  db = null;
  _dbPath;
  isInitialized = false;
  constructor() {
    this._dbPath = "";
  }
  /**
   * 获取数据库路径
   */
  getDbPath() {
    if (!this._dbPath) {
      const userDataPath = electron.app.getPath("userData");
      this._dbPath = path.join(userDataPath, "ibook.db");
    }
    return this._dbPath;
  }
  /**
   * 初始化数据库
   * 创建数据库连接并执行 schema.sql 初始化脚本
   */
  initialize() {
    if (this.isInitialized && this.db) {
      return;
    }
    try {
      this.db = new Database(this.getDbPath());
      this.isInitialized = true;
      this.db.pragma("foreign_keys = ON");
      const appPath = electron.app.getAppPath();
      const schemaPath = path.join(appPath, "database", "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf-8");
      try {
        const sanitizedSchema = this.stripUnsupportedComments(schema);
        this.db.exec(sanitizedSchema);
      } catch (error) {
        const errorMsg = String(error?.message || error);
        if (!errorMsg.includes("already exists") && !errorMsg.includes("duplicate column name") && !errorMsg.includes("no such table") && !errorMsg.includes("no such index")) {
          console.error("数据库初始化 SQL 执行失败:", errorMsg);
          throw error;
        }
      }
      console.log("数据库初始化成功:", this.getDbPath());
    } catch (error) {
      this.isInitialized = false;
      this.db = null;
      console.error("数据库初始化失败:", error);
      throw error;
    }
  }
  /**
   * 获取数据库实例
   */
  getDatabase() {
    if (!this.db) {
      this.initialize();
    }
    if (!this.db) {
      throw new Error("数据库未初始化，请先调用 initialize()");
    }
    return this.db;
  }
  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
  /**
   * 移除 SQLite 不支持的 COMMENT 语法，防止执行 schema 时出现语法错误
   */
  stripUnsupportedComments(sql) {
    return sql.replace(/\s+COMMENT\s+(['"])(?:\\.|(?!\1).)*\1/gi, "");
  }
  // ============================================
  // 书籍 CRUD 操作
  // ============================================
  /**
   * 创建书籍
   */
  createBook(input) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO books (
        title, author, cover_url, platform, category, description,
        word_count_source, word_count_search, word_count_document, 
        word_count_manual, word_count_display, isbn, source_url,
        reading_status, personal_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.title,
      input.author || null,
      input.coverUrl || null,
      input.platform || null,
      input.category || null,
      input.description || null,
      input.wordCountSource || "search",
      input.wordCountSearch || null,
      input.wordCountDocument || null,
      input.wordCountManual || null,
      input.wordCountDisplay || null,
      input.isbn || null,
      input.sourceUrl || null,
      input.readingStatus || "unread",
      input.personalRating || null
    );
    const insertId = result && typeof result.lastInsertRowid === "number" ? result.lastInsertRowid : null;
    if (!insertId) {
      throw new Error("创建书籍失败：无法获取插入的ID");
    }
    return this.getBookById(insertId);
  }
  /**
   * 根据 ID 获取书籍
   */
  getBookById(id) {
    const db = this.getDatabase();
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
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      readingStatus: row.readingStatus || "unread",
      wordCountSource: row.wordCountSource || "search",
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null,
      updatedAt: row.updatedAt && typeof row.updatedAt === "object" && row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt || null
    };
  }
  /**
   * 获取所有书籍
   */
  getAllBooks() {
    const db = this.getDatabase();
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
    `);
    const rows = stmt.all();
    return rows.map((row) => ({
      ...row,
      readingStatus: row.readingStatus || "unread",
      wordCountSource: row.wordCountSource || "search",
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null,
      updatedAt: row.updatedAt && typeof row.updatedAt === "object" && row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt || null
    }));
  }
  /**
   * 更新书籍
   */
  updateBook(id, input) {
    const db = this.getDatabase();
    const fields = [];
    const values = [];
    if (input.title !== void 0) {
      fields.push("title = ?");
      values.push(input.title);
    }
    if (input.author !== void 0) {
      fields.push("author = ?");
      values.push(input.author || null);
    }
    if (input.coverUrl !== void 0) {
      fields.push("cover_url = ?");
      values.push(input.coverUrl || null);
    }
    if (input.platform !== void 0) {
      fields.push("platform = ?");
      values.push(input.platform || null);
    }
    if (input.category !== void 0) {
      fields.push("category = ?");
      values.push(input.category || null);
    }
    if (input.description !== void 0) {
      fields.push("description = ?");
      values.push(input.description || null);
    }
    if (input.wordCountSource !== void 0) {
      fields.push("word_count_source = ?");
      values.push(input.wordCountSource);
    }
    if (input.wordCountDisplay !== void 0) {
      fields.push("word_count_display = ?");
      values.push(input.wordCountDisplay || null);
    }
    if (input.wordCountSearch !== void 0) {
      fields.push("word_count_search = ?");
      values.push(input.wordCountSearch || null);
    }
    if (input.wordCountDocument !== void 0) {
      fields.push("word_count_document = ?");
      values.push(input.wordCountDocument || null);
    }
    if (input.wordCountManual !== void 0) {
      fields.push("word_count_manual = ?");
      values.push(input.wordCountManual || null);
    }
    if (input.isbn !== void 0) {
      fields.push("isbn = ?");
      values.push(input.isbn || null);
    }
    if (input.sourceUrl !== void 0) {
      fields.push("source_url = ?");
      values.push(input.sourceUrl || null);
    }
    if (input.readingStatus !== void 0) {
      fields.push("reading_status = ?");
      values.push(input.readingStatus);
    }
    if (input.personalRating !== void 0) {
      fields.push("personal_rating = ?");
      values.push(input.personalRating || null);
    }
    if (fields.length === 0) {
      return this.getBookById(id);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE books SET ${fields.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getBookById(id);
  }
  /**
   * 删除书籍
   */
  deleteBook(id) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM books WHERE id = ?");
    const result = stmt.run(id);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  /**
   * 搜索书籍
   */
  searchBooks(keyword) {
    const db = this.getDatabase();
    const searchTerm = `%${keyword}%`;
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
    `);
    const rows = stmt.all(searchTerm, searchTerm, searchTerm);
    return rows.map((row) => ({
      ...row,
      readingStatus: row.readingStatus || "unread",
      wordCountSource: row.wordCountSource || "search",
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null,
      updatedAt: row.updatedAt && typeof row.updatedAt === "object" && row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt || null
    }));
  }
  // ============================================
  // 文档 CRUD 操作
  // ============================================
  /**
   * 创建文档
   */
  createDocument(input) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO documents (book_id, file_name, file_path, file_type, file_size, word_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.bookId,
      input.fileName,
      input.filePath,
      input.fileType,
      input.fileSize,
      input.wordCount || null
    );
    const insertId = result && typeof result.lastInsertRowid === "number" ? result.lastInsertRowid : null;
    if (!insertId) {
      throw new Error("创建文档失败：无法获取插入的ID");
    }
    return this.getDocumentById(insertId);
  }
  /**
   * 根据 ID 获取文档
   */
  getDocumentById(id) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, file_name as fileName, file_path as filePath,
        file_type as fileType, file_size as fileSize, word_count as wordCount,
        uploaded_at as uploadedAt
      FROM documents
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      uploadedAt: row.uploadedAt && typeof row.uploadedAt === "object" && row.uploadedAt instanceof Date ? row.uploadedAt.toISOString() : row.uploadedAt || null
    };
  }
  /**
   * 根据书籍 ID 获取所有文档
   */
  getDocumentsByBookId(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, file_name as fileName, file_path as filePath,
        file_type as fileType, file_size as fileSize, word_count as wordCount,
        uploaded_at as uploadedAt
      FROM documents
      WHERE book_id = ?
      ORDER BY uploaded_at DESC
    `);
    const rows = stmt.all(bookId);
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      uploadedAt: row.uploadedAt && typeof row.uploadedAt === "object" && row.uploadedAt instanceof Date ? row.uploadedAt.toISOString() : row.uploadedAt || null
    }));
  }
  /**
   * 更新文档
   */
  updateDocument(id, input) {
    const db = this.getDatabase();
    const fields = [];
    const values = [];
    if (input.fileName !== void 0) {
      fields.push("file_name = ?");
      values.push(input.fileName);
    }
    if (input.filePath !== void 0) {
      fields.push("file_path = ?");
      values.push(input.filePath);
    }
    if (input.fileType !== void 0) {
      fields.push("file_type = ?");
      values.push(input.fileType);
    }
    if (input.fileSize !== void 0) {
      fields.push("file_size = ?");
      values.push(input.fileSize);
    }
    if (input.wordCount !== void 0) {
      fields.push("word_count = ?");
      values.push(input.wordCount || null);
    }
    if (fields.length === 0) {
      return this.getDocumentById(id);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE documents SET ${fields.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getDocumentById(id);
  }
  /**
   * 删除文档
   */
  deleteDocument(id) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM documents WHERE id = ?");
    const result = stmt.run(id);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  // ============================================
  // 笔记 CRUD 操作
  // ============================================
  /**
   * 创建笔记
   */
  createNote(input) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO notes (book_id, note_type, content)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(input.bookId, input.noteType, input.content);
    const insertId = result && typeof result.lastInsertRowid === "number" ? result.lastInsertRowid : null;
    if (!insertId) {
      throw new Error("创建笔记失败：无法获取插入的ID");
    }
    return this.getNoteById(insertId);
  }
  /**
   * 根据 ID 获取笔记
   */
  getNoteById(id) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, note_type as noteType, content,
        created_at as createdAt
      FROM notes
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    };
  }
  /**
   * 根据书籍 ID 获取所有笔记
   */
  getNotesByBookId(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, note_type as noteType, content,
        created_at as createdAt
      FROM notes
      WHERE book_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(bookId);
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    }));
  }
  /**
   * 更新笔记
   */
  updateNote(id, input) {
    const db = this.getDatabase();
    const fields = [];
    const values = [];
    if (input.noteType !== void 0) {
      fields.push("note_type = ?");
      values.push(input.noteType);
    }
    if (input.content !== void 0) {
      fields.push("content = ?");
      values.push(input.content);
    }
    if (fields.length === 0) {
      return this.getNoteById(id);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE notes SET ${fields.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getNoteById(id);
  }
  /**
   * 删除笔记
   */
  deleteNote(id) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
    const result = stmt.run(id);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  // ============================================
  // 标签 CRUD 操作
  // ============================================
  /**
   * 创建标签
   */
  createTag(input) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT INTO tags (tag_name, color)
      VALUES (?, ?)
    `);
    const result = stmt.run(input.tagName, input.color || null);
    const insertId = result && typeof result.lastInsertRowid === "number" ? result.lastInsertRowid : null;
    if (!insertId) {
      throw new Error("创建标签失败：无法获取插入的ID");
    }
    return this.getTagById(insertId);
  }
  /**
   * 根据 ID 获取标签
   */
  getTagById(id) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    };
  }
  /**
   * 获取所有标签
   */
  getAllTags() {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      ORDER BY created_at DESC
    `);
    const rows = stmt.all();
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    }));
  }
  /**
   * 根据名称获取标签
   */
  getTagByName(tagName) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, tag_name as tagName, color, created_at as createdAt
      FROM tags
      WHERE tag_name = ?
    `);
    const row = stmt.get(tagName);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    };
  }
  /**
   * 更新标签
   */
  updateTag(id, input) {
    const db = this.getDatabase();
    const fields = [];
    const values = [];
    if (input.tagName !== void 0) {
      fields.push("tag_name = ?");
      values.push(input.tagName);
    }
    if (input.color !== void 0) {
      fields.push("color = ?");
      values.push(input.color || null);
    }
    if (fields.length === 0) {
      return this.getTagById(id);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE tags SET ${fields.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getTagById(id);
  }
  /**
   * 删除标签
   */
  deleteTag(id) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM tags WHERE id = ?");
    const result = stmt.run(id);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  /**
   * 为书籍添加标签
   */
  addTagToBook(bookId, tagId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO book_tags (book_id, tag_id)
      VALUES (?, ?)
    `);
    const result = stmt.run(bookId, tagId);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  /**
   * 移除书籍标签
   */
  removeTagFromBook(bookId, tagId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      DELETE FROM book_tags
      WHERE book_id = ? AND tag_id = ?
    `);
    const result = stmt.run(bookId, tagId);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
  /**
   * 获取书籍的所有标签
   */
  getTagsByBookId(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        t.id, t.tag_name as tagName, t.color, t.created_at as createdAt
      FROM tags t
      INNER JOIN book_tags bt ON t.id = bt.tag_id
      WHERE bt.book_id = ?
      ORDER BY t.created_at DESC
    `);
    const rows = stmt.all(bookId);
    return rows.map((row) => ({
      ...row,
      // 确保日期对象可以被序列化
      createdAt: row.createdAt && typeof row.createdAt === "object" && row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt || null
    }));
  }
  // ============================================
  // 阅读进度 CRUD 操作
  // ============================================
  /**
   * 创建或更新阅读进度
   */
  upsertReadingProgress(input) {
    const db = this.getDatabase();
    const updateStmt = db.prepare(`
      UPDATE reading_progress
      SET current_chapter = ?, current_page = ?, progress_percentage = ?, last_read_at = ?
      WHERE book_id = ?
    `);
    const updateResult = updateStmt.run(
      input.currentChapter || null,
      input.currentPage || null,
      input.progressPercentage || null,
      input.lastReadAt || (/* @__PURE__ */ new Date()).toISOString(),
      input.bookId
    );
    const changes = updateResult && typeof updateResult.changes === "number" ? updateResult.changes : 0;
    if (changes === 0) {
      const insertStmt = db.prepare(`
        INSERT INTO reading_progress (book_id, current_chapter, current_page, progress_percentage, last_read_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        input.bookId,
        input.currentChapter || null,
        input.currentPage || null,
        input.progressPercentage || null,
        input.lastReadAt || (/* @__PURE__ */ new Date()).toISOString()
      );
    }
    return this.getReadingProgressByBookId(input.bookId);
  }
  /**
   * 根据书籍 ID 获取阅读进度
   */
  getReadingProgressByBookId(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT
        id, book_id as bookId, current_chapter as currentChapter,
        current_page as currentPage, progress_percentage as progressPercentage,
        last_read_at as lastReadAt
      FROM reading_progress
      WHERE book_id = ?
    `);
    const row = stmt.get(bookId);
    if (!row) return null;
    return {
      ...row,
      // 确保日期对象可以被序列化
      lastReadAt: row.lastReadAt && typeof row.lastReadAt === "object" && row.lastReadAt instanceof Date ? row.lastReadAt.toISOString() : row.lastReadAt || null
    };
  }
  /**
   * 删除阅读进度
   */
  deleteReadingProgress(bookId) {
    const db = this.getDatabase();
    const stmt = db.prepare("DELETE FROM reading_progress WHERE book_id = ?");
    const result = stmt.run(bookId);
    const changes = result && typeof result.changes === "number" ? result.changes : 0;
    return changes > 0;
  }
}
const databaseService = new DatabaseService2();
function setupBookHandlers() {
  electron.ipcMain.handle("book:create", async (_event, input) => {
    try {
      const book = databaseService.createBook(input);
      return { success: true, data: book };
    } catch (error) {
      console.error("创建书籍失败:", error);
      return {
        success: false,
        error: error?.message || "创建书籍失败"
      };
    }
  });
  electron.ipcMain.handle(
    "book:update",
    async (_event, id, input) => {
      try {
        const book = databaseService.updateBook(id, input);
        if (!book) {
          return {
            success: false,
            error: "书籍不存在"
          };
        }
        return { success: true, data: book };
      } catch (error) {
        console.error("更新书籍失败:", error);
        return {
          success: false,
          error: error?.message || "更新书籍失败"
        };
      }
    }
  );
  electron.ipcMain.handle("book:delete", async (_event, id) => {
    try {
      const success = databaseService.deleteBook(id);
      if (!success) {
        return {
          success: false,
          error: "书籍不存在"
        };
      }
      return { success: true };
    } catch (error) {
      console.error("删除书籍失败:", error);
      return {
        success: false,
        error: error?.message || "删除书籍失败"
      };
    }
  });
  electron.ipcMain.handle("book:getById", async (_event, id) => {
    try {
      const book = databaseService.getBookById(id);
      if (!book) {
        return {
          success: false,
          error: "书籍不存在"
        };
      }
      return { success: true, data: book };
    } catch (error) {
      console.error("获取书籍失败:", error);
      return {
        success: false,
        error: error?.message || "获取书籍失败"
      };
    }
  });
  electron.ipcMain.handle("book:getAll", async () => {
    try {
      const books = databaseService.getAllBooks();
      return { success: true, data: books };
    } catch (error) {
      console.error("获取书籍列表失败:", error);
      return {
        success: false,
        error: error?.message || "获取书籍列表失败"
      };
    }
  });
  electron.ipcMain.handle("book:search", async (_event, keyword) => {
    try {
      if (!keyword || keyword.trim().length === 0) {
        return { success: true, data: [] };
      }
      const books = databaseService.searchBooks(keyword.trim());
      return { success: true, data: books };
    } catch (error) {
      console.error("搜索书籍失败:", error);
      return {
        success: false,
        error: error?.message || "搜索书籍失败"
      };
    }
  });
}
class FileManagerService {
  _documentsDir;
  constructor() {
    this._documentsDir = "";
  }
  /**
   * 获取文档目录
   */
  getDocumentsDir() {
    if (!this._documentsDir) {
      const userDataPath = electron.app.getPath("userData");
      this._documentsDir = path__namespace.join(userDataPath, "documents");
      this.ensureDirectoryExists();
    }
    return this._documentsDir;
  }
  /**
   * 确保文档目录存在
   */
  ensureDirectoryExists() {
    if (!fs__namespace.existsSync(this.getDocumentsDir())) {
      fs__namespace.mkdirSync(this.getDocumentsDir(), { recursive: true });
    }
  }
  /**
   * 保存文件
   * @param filePath 原始文件路径
   * @param bookId 书籍ID
   * @returns 保存后的文件名
   */
  async saveFile(filePath, bookId) {
    try {
      const fileBuffer = fs__namespace.readFileSync(filePath);
      const originalName = path__namespace.basename(filePath);
      const ext = path__namespace.extname(originalName);
      const uniqueName = `${bookId}_${uuid.v4()}${ext}`;
      const savePath = path__namespace.join(this.getDocumentsDir(), uniqueName);
      fs__namespace.writeFileSync(savePath, fileBuffer);
      return uniqueName;
    } catch (error) {
      console.error("保存文件失败:", error);
      throw new Error("保存文件失败");
    }
  }
  /**
   * 删除文件
   * @param fileName 文件名
   */
  async deleteFile(fileName) {
    try {
      const filePath = path__namespace.join(this.getDocumentsDir(), fileName);
      if (fs__namespace.existsSync(filePath)) {
        fs__namespace.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("删除文件失败:", error);
      return false;
    }
  }
  /**
   * 打开文件
   * @param fileName 文件名
   */
  async openFile(fileName) {
    try {
      const filePath = path__namespace.join(this.getDocumentsDir(), fileName);
      if (fs__namespace.existsSync(filePath)) {
        await electron.shell.openPath(filePath);
      } else {
        throw new Error("文件不存在");
      }
    } catch (error) {
      console.error("打开文件失败:", error);
      throw new Error("打开文件失败");
    }
  }
  /**
   * 获取文件路径
   * @param fileName 文件名
   */
  getFilePath(fileName) {
    return path__namespace.join(this.getDocumentsDir(), fileName);
  }
  /**
   * 获取文件大小
   * @param fileName 文件名
   * @returns 文件大小（字节）
   */
  getFileSize(fileName) {
    try {
      const filePath = path__namespace.join(this.getDocumentsDir(), fileName);
      if (fs__namespace.existsSync(filePath)) {
        const stats = fs__namespace.statSync(filePath);
        return stats.size;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }
}
const fileManager = new FileManagerService();
class WordCounterService {
  /**
   * 统计文件字数
   * @param filePath 文件完整路径
   * @returns 字数
   */
  async countWords(filePath) {
    try {
      if (!fs__namespace.existsSync(filePath)) {
        throw new Error("文件不存在");
      }
      const ext = path__namespace.extname(filePath).toLowerCase();
      switch (ext) {
        case ".txt":
          return await this.countTxtWords(filePath);
        case ".epub":
          return await this.countEpubWords(filePath);
        case ".pdf":
          return await this.countPdfWords(filePath);
        case ".docx":
        case ".doc":
          return await this.countDocxWords(filePath);
        default:
          throw new Error(`不支持的文件格式: ${ext}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`字数统计失败: ${message}`);
    }
  }
  /**
   * 统计 TXT 文件字数
   * 支持自动编码检测
   */
  async countTxtWords(filePath) {
    try {
      const buffer = fs__namespace.readFileSync(filePath);
      const detected = jschardet__namespace.detect(buffer);
      const encoding = detected.encoding || "utf-8";
      let text = iconv__namespace.decode(buffer, encoding);
      return this.calculateWordCount(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`TXT 文件解析失败: ${message}`);
    }
  }
  /**
   * 统计 EPUB 文件字数
   */
  async countEpubWords(filePath) {
    return new Promise((resolve, reject) => {
      try {
        const epub = new EPub(filePath);
        epub.on("error", (err) => {
          const message = err instanceof Error ? err.message : String(err);
          reject(new Error(`EPUB 解析失败: ${message}`));
        });
        epub.on("end", async () => {
          try {
            const chapters = epub.flow;
            let totalText = "";
            for (const chapter of chapters) {
              const chapterText = await this.getChapterText(epub, chapter.id);
              totalText += chapterText + " ";
            }
            const wordCount = this.calculateWordCount(totalText);
            resolve(wordCount);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            reject(new Error(`EPUB 文本提取失败: ${message}`));
          }
        });
        epub.parse();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        reject(new Error(`EPUB 文件读取失败: ${message}`));
      }
    });
  }
  /**
   * 获取 EPUB 章节文本
   */
  getChapterText(epub, chapterId) {
    return new Promise((resolve, reject) => {
      epub.getChapter(chapterId, (err, text) => {
        if (err) {
          reject(err);
        } else {
          const cleanText = text.replace(/<[^>]*>/g, "");
          resolve(cleanText);
        }
      });
    });
  }
  /**
   * 统计 PDF 文件字数
   */
  async countPdfWords(filePath) {
    try {
      const dataBuffer = fs__namespace.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      const text = data.text;
      return this.calculateWordCount(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`PDF 文件解析失败: ${message}`);
    }
  }
  /**
   * 统计 DOCX 文件字数
   */
  async countDocxWords(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;
      return this.calculateWordCount(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`DOCX 文件解析失败: ${message}`);
    }
  }
  /**
   * 计算字数
   * 中文按字符数，英文按单词数
   */
  calculateWordCount(text) {
    if (!text || text.trim().length === 0) {
      return 0;
    }
    text = text.replace(/\s+/g, " ").trim();
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
    const chineseCount = chineseChars ? chineseChars.length : 0;
    const textWithoutChinese = text.replace(/[\u4e00-\u9fa5]/g, " ");
    const englishWords = textWithoutChinese.match(/[a-zA-Z]+/g);
    const englishCount = englishWords ? englishWords.length : 0;
    return chineseCount + englishCount;
  }
  /**
   * 获取文件支持的格式列表
   */
  getSupportedFormats() {
    return [".txt", ".epub", ".pdf", ".docx", ".doc"];
  }
  /**
   * 检查文件格式是否支持
   */
  isFormatSupported(filePath) {
    const ext = path__namespace.extname(filePath).toLowerCase();
    return this.getSupportedFormats().includes(ext);
  }
}
const wordCounter = new WordCounterService();
function setupDocumentHandlers() {
  electron.ipcMain.handle("document:selectFile", async (_event) => {
    try {
      const result = await electron.dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          { name: "文档文件", extensions: ["txt", "epub", "pdf", "docx", "doc"] },
          { name: "所有文件", extensions: ["*"] }
        ]
      });
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: "未选择文件" };
      }
      return { success: true, data: result.filePaths[0] };
    } catch (error) {
      console.error("选择文件失败:", error);
      return {
        success: false,
        error: error?.message || "选择文件失败"
      };
    }
  });
  electron.ipcMain.handle(
    "document:upload",
    async (_event, filePath, bookId) => {
      try {
        const fileName = await fileManager.saveFile(filePath, bookId);
        const fileSize = fileManager.getFileSize(fileName);
        let wordCount = 0;
        try {
          const savedFilePath = fileManager.getFilePath(fileName);
          wordCount = await wordCounter.countWords(savedFilePath);
        } catch (error) {
          console.warn("字数统计失败，使用默认值 0:", error);
        }
        const input = {
          bookId,
          fileName,
          filePath: fileName,
          fileType: fileName.split(".").pop() || "",
          fileSize,
          wordCount
        };
        const document = databaseService.createDocument(input);
        return { success: true, data: document };
      } catch (error) {
        console.error("上传文档失败:", error);
        return {
          success: false,
          error: error?.message || "上传文档失败"
        };
      }
    }
  );
  electron.ipcMain.handle("document:delete", async (_event, id) => {
    try {
      const document = databaseService.getDocumentById(id);
      if (!document) {
        return {
          success: false,
          error: "文档不存在"
        };
      }
      const success = databaseService.deleteDocument(id);
      if (!success) {
        return {
          success: false,
          error: "删除文档失败"
        };
      }
      try {
        await fileManager.deleteFile(document.filePath);
      } catch (error) {
        console.warn("删除文件失败（数据库记录已删除）:", error);
      }
      return { success: true };
    } catch (error) {
      console.error("删除文档失败:", error);
      return {
        success: false,
        error: error?.message || "删除文档失败"
      };
    }
  });
  electron.ipcMain.handle("document:open", async (_event, fileName) => {
    try {
      await fileManager.openFile(fileName);
      return { success: true };
    } catch (error) {
      console.error("打开文档失败:", error);
      return {
        success: false,
        error: error?.message || "打开文档失败"
      };
    }
  });
  electron.ipcMain.handle("document:countWords", async (_event, fileName) => {
    try {
      const filePath = fileManager.getFilePath(fileName);
      const wordCount = await wordCounter.countWords(filePath);
      return { success: true, data: wordCount };
    } catch (error) {
      console.error("统计字数失败:", error);
      return {
        success: false,
        error: error?.message || "统计字数失败"
      };
    }
  });
  electron.ipcMain.handle(
    "document:getByBookId",
    async (_event, bookId) => {
      try {
        const documents = databaseService.getDocumentsByBookId(bookId);
        return { success: true, data: documents };
      } catch (error) {
        console.error("获取文档列表失败:", error);
        return {
          success: false,
          error: error?.message || "获取文档列表失败"
        };
      }
    }
  );
  electron.ipcMain.handle(
    "document:update",
    async (_event, id, input) => {
      try {
        const document = databaseService.updateDocument(id, input);
        if (!document) {
          return {
            success: false,
            error: "文档不存在"
          };
        }
        return { success: true, data: document };
      } catch (error) {
        console.error("更新文档失败:", error);
        return {
          success: false,
          error: error?.message || "更新文档失败"
        };
      }
    }
  );
}
class SpiderService {
  baseUrl = "https://youshu.me";
  client;
  maxResults = 20;
  requestTimeouts = [1e4, 15e3, 2e4];
  retryDelay = 500;
  detailLabelMap = {
    category: ["作品分类", "作品类别", "小说分类", "小说类别", "作品类型", "小说类型"],
    platform: ["首发网站", "首发站点", "首发平台"]
  };
  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 1e4,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: this.baseUrl
      },
      responseType: "arraybuffer",
      validateStatus: (status) => status >= 200 && status < 400
    });
  }
  /**
   * 根据关键词检索 youshu
   */
  async searchYoushu(keyword) {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const path2 = `/search/articlename/${encodeURIComponent(trimmed)}/1.html`;
      const response = await this.requestWithRetry(path2);
      const buffer = Buffer.from(response.data);
      const html = this.decodeHtml(buffer, response.headers);
      const $ = cheerio__namespace.load(html);
      const results = [];
      const rows = $(".c_row").toArray();
      for (const element of rows) {
        const row = $(element);
        const title = row.find(".c_subject a").first().text().replace(/\s+/g, " ").trim();
        if (!title) continue;
        const link = row.find(".c_subject a").first().attr("href") ?? "";
        const coverSrc = row.find(".fl img").attr("src") ?? "";
        const description = row.find(".c_description").text().replace(/\s+/g, " ").trim();
        const meta = this.extractMeta(row, $);
        const normalizedCover = this.normalizeUrl(coverSrc);
        results.push({
          title,
          author: meta.author || "未知作者",
          cover: this.toProxyImageUrl(normalizedCover),
          platform: meta.platform || void 0,
          category: meta.category || "",
          wordCount: meta.wordCount,
          description: description || "暂无简介",
          sourceUrl: this.normalizeUrl(link)
        });
      }
      return results.slice(0, this.maxResults);
    } catch (error) {
      const message = error instanceof Error ? error.message : "网络异常";
      throw new Error(`抓取 youshu 数据失败: ${message}`);
    }
  }
  /**
   * 带超时重试的请求封装
   */
  async requestWithRetry(path2) {
    let lastError;
    for (let attempt = 0; attempt < this.requestTimeouts.length; attempt += 1) {
      const timeout = this.requestTimeouts[attempt];
      try {
        return await this.client.get(path2, { timeout });
      } catch (error) {
        lastError = error;
        const shouldRetry = this.isRetryableError(error) && attempt < this.requestTimeouts.length - 1;
        if (!shouldRetry) {
          throw error;
        }
        await this.delay(this.retryDelay * (attempt + 1));
      }
    }
    throw lastError instanceof Error ? lastError : new Error("网络异常");
  }
  isRetryableError(error) {
    if (!axios.isAxiosError(error)) {
      return false;
    }
    const retryableCodes = ["ECONNABORTED", "ETIMEDOUT", "ECONNRESET", "ENOTFOUND"];
    return !!error.code && retryableCodes.includes(error.code);
  }
  async delay(ms) {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * 解析 meta 信息
   */
  extractMeta(row, $) {
    const meta = {
      author: "",
      platform: "",
      category: "",
      wordCount: 0
    };
    row.find(".c_tag").each((_idx, tag) => {
      let currentLabel = "";
      $(tag).children("span").each((_spanIdx, span) => {
        const el = $(span);
        if (el.hasClass("c_label")) {
          currentLabel = this.normalizeLabel(el.text());
        } else if (el.hasClass("c_value")) {
          const value = el.text().replace(/\s+/g, " ").trim();
          switch (currentLabel) {
            case "作者":
              meta.author = value;
              break;
            case "类别":
            case "分类":
            case "类型":
            case "题材":
              meta.category = value;
              break;
            case "来源":
            case "平台":
              meta.platform = value;
              break;
            case "字数":
              meta.wordCount = this.parseWordCount(value);
              break;
          }
        }
      });
    });
    return meta;
  }
  async fetchDetailInfo(sourceUrl) {
    const detailUrl = this.normalizeUrl(sourceUrl);
    if (!detailUrl) {
      throw new Error("sourceUrl 不能为空");
    }
    const response = await this.requestWithRetry(detailUrl);
    const buffer = Buffer.from(response.data);
    const html = this.decodeHtml(buffer, response.headers);
    return this.extractDetailMeta(html);
  }
  extractDetailMeta(html) {
    const $ = cheerio__namespace.load(html);
    const detailMeta = {};
    const selectors = [
      ".bookinfo li",
      ".workinfo li",
      ".book-information li",
      ".book-info li",
      ".bookinfo p",
      ".workinfo p"
    ];
    for (const selector of selectors) {
      $(selector).each((_idx, el) => {
        const text = $(el).text().replace(/\s+/g, " ").trim();
        this.assignDetailValue(text, detailMeta);
      });
      if (detailMeta.category && detailMeta.platform) {
        break;
      }
    }
    if (!detailMeta.category || !detailMeta.platform) {
      const bodyText = $.root().text().replace(/\s+/g, " ").trim();
      this.assignDetailValue(bodyText, detailMeta);
    }
    return detailMeta;
  }
  assignDetailValue(text, meta) {
    const normalized = text.replace(/\s+/g, " ").trim();
    const mappings = Object.entries(this.detailLabelMap);
    for (const [key, labels] of mappings) {
      if (key === "category" && meta.category || key === "platform" && meta.platform) {
        continue;
      }
      for (const label of labels) {
        const regex = new RegExp(`${label}[：:]\\s*([^\\s，。；;|]+)`, "i");
        const match = regex.exec(normalized);
        if (match?.[1]) {
          if (key === "category") {
            meta.category = match[1].trim();
          } else {
            meta.platform = match[1].trim();
          }
          break;
        }
      }
    }
  }
  /**
   * 标签标准化，去除中英文冒号
   */
  normalizeLabel(label) {
    return label.replace(/[\s：:]/g, "").trim();
  }
  /**
   * 将 "123456" "123,456" 或 "123.4万" 等形式转换为数字
   */
  parseWordCount(value) {
    const text = value.replace(/,/g, "").trim();
    if (!text) return 0;
    if (text.includes("万")) {
      const num = parseFloat(text.replace(/[^0-9.]/g, ""));
      return Number.isNaN(num) ? 0 : Math.round(num * 1e4);
    }
    const digits = text.replace(/[^\d]/g, "");
    return digits ? parseInt(digits, 10) : 0;
  }
  /**
   * 将相对链接转换为绝对链接
   */
  normalizeUrl(value) {
    if (!value) return "";
    if (value.startsWith("http")) return value;
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("/")) return `${this.baseUrl}${value}`;
    return `${this.baseUrl}/${value.replace(/^\//, "")}`;
  }
  /**
   * 将封面 URL 经过代理，避免跨域盗链限制
   */
  toProxyImageUrl(value) {
    if (!value) return "";
    const https = /^https:\/\//i.test(value);
    const sanitized = value.replace(/^https?:\/\//i, "");
    return `https://images.weserv.nl/?url=${https ? "ssl:" : ""}${sanitized}`;
  }
  /**
   * 根据响应头/HTML meta 自动识别编码并解码为 UTF-8 字符串
   */
  decodeHtml(buffer, headers) {
    const declared = this.extractEncoding(headers["content-type"]);
    const metaEncoding = this.sniffMetaEncoding(buffer);
    const candidate = this.normalizeEncoding(declared || metaEncoding || "gbk");
    try {
      return iconv.decode(buffer, candidate);
    } catch (error) {
      console.warn(`使用编码 ${candidate} 解码失败，自动回退为 utf-8`, error);
      return iconv.decode(buffer, "utf-8");
    }
  }
  /**
   * 从 Content-Type 中提取 charset
   */
  extractEncoding(contentType) {
    if (!contentType) return void 0;
    const match = /charset=([\w-]+)/i.exec(contentType);
    return match?.[1];
  }
  /**
   * 扫描 HTML 头部 meta 标签，获取 charset
   */
  sniffMetaEncoding(buffer) {
    const snippet = buffer.toString("ascii", 0, Math.min(buffer.length, 2048));
    const match = /charset=["']?([\w-]+)/i.exec(snippet);
    return match?.[1];
  }
  /**
   * 规范化编码名称，兼容 gb2312/gb18030
   */
  normalizeEncoding(encoding) {
    const lower = encoding.toLowerCase();
    if (lower === "gb2312" || lower === "gbk" || lower === "gb18030") {
      return "gbk";
    }
    if (lower === "utf8") {
      return "utf-8";
    }
    return lower;
  }
}
const spiderService = new SpiderService();
class CoverService {
  _downloadDir;
  constructor() {
    this._downloadDir = "";
  }
  getDownloadDir() {
    if (!this._downloadDir) {
      this._downloadDir = path.join(electron.app.getPath("userData"), "covers");
    }
    return this._downloadDir;
  }
  /**
   * 下载远程封面并转码
   */
  async download(url$1, options = {}) {
    if (!url$1) {
      throw new Error("封面地址不能为空");
    }
    await this.ensureDirectory();
    const response = await axios.get(url$1, {
      responseType: "arraybuffer",
      timeout: 15e3,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      validateStatus: (status) => status >= 200 && status < 400
    });
    const buffer = Buffer.from(response.data);
    const image = await jimp.Jimp.read(buffer);
    const targetWidth = options.maxWidth ?? 640;
    if (image.getWidth() > targetWidth) {
      image.resize(targetWidth, jimp.Jimp.AUTO);
    }
    const quality = options.quality ?? 80;
    image.quality(quality);
    const fileName = this.buildFileName(options.title);
    const filePath = path.join(this.getDownloadDir(), fileName);
    await image.writeAsync(filePath);
    return url.pathToFileURL(filePath).toString();
  }
  /**
   * 确认下载目录存在
   */
  async ensureDirectory() {
    try {
      await promises.access(this.getDownloadDir(), fs.constants.F_OK);
    } catch {
      await promises.mkdir(this.getDownloadDir(), { recursive: true });
    }
  }
  /**
   * 根据标题生成安全文件名
   */
  buildFileName(rawTitle) {
    const safeTitle = (rawTitle || "cover").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "-").slice(0, 40);
    const timestamp = Date.now();
    return `${safeTitle || "cover"}-${timestamp}.jpg`;
  }
}
const coverService = new CoverService();
function setupSearchHandlers() {
  electron.ipcMain.handle("search:youshu", async (_event, keyword) => {
    try {
      if (!keyword || keyword.trim().length === 0) {
        return {
          success: false,
          error: "搜索关键词不能为空"
        };
      }
      const results = await spiderService.searchYoushu(keyword.trim());
      return {
        success: true,
        data: results
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "搜索书籍失败";
      console.error("搜索书籍失败:", error);
      return {
        success: false,
        error: message
      };
    }
  });
  electron.ipcMain.handle(
    "search:youshuDetail",
    async (_event, sourceUrl) => {
      try {
        if (!sourceUrl || !sourceUrl.trim()) {
          return { success: false, error: "作品链接不能为空" };
        }
        const detail = await spiderService.fetchDetailInfo(sourceUrl);
        return {
          success: true,
          data: detail
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "获取作品详情失败";
        console.error("获取 youshu 作品详情失败:", error);
        return {
          success: false,
          error: message
        };
      }
    }
  );
  electron.ipcMain.handle(
    "search:downloadCover",
    async (_event, payload) => {
      try {
        if (!payload?.url) {
          return {
            success: false,
            error: "封面地址不能为空"
          };
        }
        const fileUrl = await coverService.download(payload.url, {
          title: payload.title
        });
        return {
          success: true,
          data: fileUrl
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "下载封面失败";
        console.error("下载封面失败:", error);
        return {
          success: false,
          error: message
        };
      }
    }
  );
}
class ExportService {
  userDataPath = electron.app.getPath("userData");
  exportDir = path.join(this.userDataPath, "exports");
  constructor() {
    this.ensureExportDir();
  }
  /**
   * 导出统计数据
   */
  async exportStatistics(options) {
    try {
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/[:-]/g, "");
      const fileName = `统计导出_${timestamp}.${options.format}`;
      const filePath = path.join(this.exportDir, fileName);
      const books = this.getBooksData(options.dateRange);
      const statistics = this.calculateStatistics(books);
      const charts = options.dataTypes?.charts ? this.prepareChartData(statistics) : null;
      if (options.format === "excel") {
        await this.exportToExcel(filePath, {
          books: options.dataTypes?.books ? books : [],
          statistics: options.dataTypes?.statistics ? statistics : null,
          charts
        });
      } else {
        await this.exportToCsv(filePath, {
          books: options.dataTypes?.books ? books : [],
          statistics: options.dataTypes?.statistics ? statistics : null
        });
      }
      const result = await electron.dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [
          { name: options.format === "excel" ? "Excel Files" : "CSV Files", extensions: [options.format] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (result.canceled || !result.filePath) {
        return { filePath, fileName };
      }
      const finalPath = result.filePath.endsWith(`.${options.format}`) ? result.filePath : `${result.filePath}.${options.format}`;
      await this.copyFile(filePath, finalPath);
      return { filePath: finalPath, fileName: finalPath.split("\\").pop() || fileName };
    } catch (error) {
      console.error("导出统计数据失败:", error);
      throw new Error(error instanceof Error ? error.message : "导出失败");
    }
  }
  /**
   * 导出年度报告
   */
  async exportYearlyReport(year) {
    try {
      const fileName = `年度阅读报告_${year}.xlsx`;
      const filePath = path.join(this.exportDir, fileName);
      const yearlyData = this.getYearlyData(year);
      await this.createYearlyReport(filePath, yearlyData, year);
      const result = await electron.dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [
          { name: "Excel Files", extensions: ["xlsx"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (result.canceled || !result.filePath) {
        return { filePath, fileName };
      }
      const finalPath = result.filePath.endsWith(".xlsx") ? result.filePath : `${result.filePath}.xlsx`;
      await this.copyFile(filePath, finalPath);
      return { filePath: finalPath, fileName: finalPath.split("\\").pop() || fileName };
    } catch (error) {
      console.error("导出年度报告失败:", error);
      throw new Error(error instanceof Error ? error.message : "导出年度报告失败");
    }
  }
  /**
   * 获取书籍数据
   */
  getBooksData(dateRange) {
    let books = databaseService.getAllBooks();
    if (dateRange) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      books = books.filter((book) => {
        if (!book.createdAt) return false;
        const addedDate = new Date(book.createdAt);
        return addedDate >= startDate && addedDate <= endDate;
      });
    }
    return books.map((book) => ({
      ID: book.id,
      书名: book.title,
      作者: book.author,
      分类: book.category || "未分类",
      平台: book.platform || "未知",
      字数: book.wordCountDisplay || 0,
      阅读状态: book.readingStatus || "未读",
      评分: book.personalRating || 0,
      添加时间: book.createdAt ? new Date(book.createdAt).toLocaleString() : "",
      简介: book.description || "",
      封面链接: book.coverUrl || ""
    }));
  }
  /**
   * 计算统计数据
   */
  calculateStatistics(books) {
    const totalBooks = books.length;
    const totalWordCount = books.reduce((sum, book) => sum + (book.wordCountDisplay || 0), 0);
    const statusStats = {
      未读: books.filter((book) => !book.readingStatus || book.readingStatus === "unread").length,
      阅读中: books.filter((book) => book.readingStatus === "reading").length,
      已读完: books.filter((book) => book.readingStatus === "finished").length,
      弃读: books.filter((book) => book.readingStatus === "dropped").length,
      待读: books.filter((book) => book.readingStatus === "to-read").length
    };
    const categoryMap = /* @__PURE__ */ new Map();
    books.forEach((book) => {
      const category = book.category || "未分类";
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    const platformMap = /* @__PURE__ */ new Map();
    books.forEach((book) => {
      const platform = book.platform || "未知平台";
      platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
    });
    const booksWithRating = books.filter((book) => book.personalRating && book.personalRating > 0);
    const averageRating = booksWithRating.length > 0 ? booksWithRating.reduce((sum, book) => sum + (book.personalRating || 0), 0) / booksWithRating.length : 0;
    return {
      总书籍数: totalBooks,
      总字数: totalWordCount,
      平均评分: Math.round(averageRating * 10) / 10,
      完成本数: statusStats.已读完,
      阅读中本数: statusStats.阅读中,
      未读本数: statusStats.未读,
      弃读本数: statusStats.弃读,
      待读本数: statusStats.待读,
      分类统计: Object.fromEntries(categoryMap),
      平台统计: Object.fromEntries(platformMap)
    };
  }
  /**
   * 准备图表数据
   */
  prepareChartData(statistics) {
    return {
      阅读状态分布: statistics.状态统计,
      分类分布: statistics.分类统计,
      平台分布: statistics.平台统计
    };
  }
  /**
   * 导出到Excel
   */
  async exportToExcel(filePath, data) {
    const workbook = XLSX__namespace.utils.book_new();
    if (data.books && data.books.length > 0) {
      const booksSheet = XLSX__namespace.utils.json_to_sheet(data.books);
      XLSX__namespace.utils.book_append_sheet(workbook, booksSheet, "书籍列表");
    }
    if (data.statistics) {
      const statsArray = Object.entries(data.statistics).map(([key, value]) => ({
        统计项: key,
        数值: typeof value === "object" ? JSON.stringify(value) : value
      }));
      const statsSheet = XLSX__namespace.utils.json_to_sheet(statsArray);
      XLSX__namespace.utils.book_append_sheet(workbook, statsSheet, "统计数据");
    }
    if (data.charts) {
      Object.entries(data.charts).forEach(([chartName, chartData]) => {
        const dataArray = Object.entries(chartData).map(([key, value]) => ({
          项目: key,
          数值: value
        }));
        const chartSheet = XLSX__namespace.utils.json_to_sheet(dataArray);
        XLSX__namespace.utils.book_append_sheet(workbook, chartSheet, chartName);
      });
    }
    XLSX__namespace.writeFile(workbook, filePath);
  }
  /**
   * 导出到CSV
   */
  async exportToCsv(filePath, data) {
    let csvContent = "";
    if (data.books && data.books.length > 0) {
      csvContent += "# 书籍列表\n";
      const headers = Object.keys(data.books[0]);
      csvContent += headers.join(",") + "\n";
      data.books.forEach((book) => {
        const row = headers.map((header) => {
          const value = book[header];
          return typeof value === "string" && (value.includes(",") || value.includes('"')) ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvContent += row.join(",") + "\n";
      });
      csvContent += "\n";
    }
    if (data.statistics) {
      csvContent += "# 统计数据\n";
      csvContent += "统计项,数值\n";
      Object.entries(data.statistics).forEach(([key, value]) => {
        const strValue = typeof value === "object" ? JSON.stringify(value) : String(value);
        csvContent += `${key},${strValue}
`;
      });
    }
    await promises.writeFile(filePath, csvContent, "utf-8");
  }
  /**
   * 获取年度数据
   */
  getYearlyData(year) {
    const books = databaseService.getAllBooks().filter((book) => {
      if (!book.addedAt) return false;
      return new Date(book.addedAt).getFullYear() === year;
    });
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthBooks = books.filter((book) => {
        if (!book.addedAt) return false;
        return new Date(book.addedAt).getMonth() + 1 === month;
      });
      monthlyData.push({
        月份: `${year}年${month}月`,
        新增书籍: monthBooks.length,
        新增字数: monthBooks.reduce((sum, book) => sum + (book.wordCount || 0), 0),
        完成书籍: monthBooks.filter((book) => book.readingStatus === "已读完").length
      });
    }
    return {
      year,
      books,
      monthlyData,
      totalBooks: books.length,
      totalWords: books.reduce((sum, book) => sum + (book.wordCount || 0), 0),
      finishedBooks: books.filter((book) => book.readingStatus === "已读完").length
    };
  }
  /**
   * 创建年度报告
   */
  async createYearlyReport(filePath, data, year) {
    const workbook = XLSX__namespace.utils.book_new();
    const overviewData = [
      { 指标: "年度", 数值: year },
      { 指标: "新增书籍总数", 数值: data.totalBooks },
      { 指标: "新增总字数", 数值: data.totalWords },
      { 指标: "完成书籍数", 数值: data.finishedBooks },
      { 指标: "完成率", 数值: data.totalBooks > 0 ? `${(data.finishedBooks / data.totalBooks * 100).toFixed(1)}%` : "0%" }
    ];
    const overviewSheet = XLSX__namespace.utils.json_to_sheet(overviewData);
    XLSX__namespace.utils.book_append_sheet(workbook, overviewSheet, "年度概览");
    if (data.monthlyData.length > 0) {
      const monthlySheet = XLSX__namespace.utils.json_to_sheet(data.monthlyData);
      XLSX__namespace.utils.book_append_sheet(workbook, monthlySheet, "月度统计");
    }
    if (data.books.length > 0) {
      const booksData = data.books.map((book) => ({
        书名: book.title,
        作者: book.author,
        分类: book.category || "未分类",
        字数: book.wordCount || 0,
        状态: book.readingStatus || "未读",
        评分: book.rating || 0,
        添加时间: book.addedAt ? new Date(book.addedAt).toLocaleDateString() : ""
      }));
      const booksSheet = XLSX__namespace.utils.json_to_sheet(booksData);
      XLSX__namespace.utils.book_append_sheet(workbook, booksSheet, "书籍详情");
    }
    XLSX__namespace.writeFile(workbook, filePath);
  }
  /**
   * 确保导出目录存在
   */
  async ensureExportDir() {
    try {
      await promises.writeFile(path.join(this.exportDir, ".gitkeep"), "", "utf-8");
    } catch (error) {
    }
  }
  /**
   * 复制文件
   */
  async copyFile(source, destination) {
    const fs2 = await import("fs/promises");
    await fs2.copyFile(source, destination);
  }
}
function registerStatsHandlers() {
  const exportService = new ExportService();
  electron.ipcMain.handle("stats:getOverview", async () => {
    try {
      const books = databaseService.getAllBooks();
      const totalBooks = books.length;
      const totalWordCount = books.reduce((sum, book) => sum + (book.wordCountDisplay || 0), 0);
      const finishedBooks = books.filter((book) => book.readingStatus === "finished").length;
      const readingBooks = books.filter((book) => book.readingStatus === "reading").length;
      const unreadBooks = books.filter((book) => book.readingStatus === "unread").length;
      const booksWithRating = books.filter((book) => book.personalRating && book.personalRating > 0);
      const averageRating = booksWithRating.length > 0 ? booksWithRating.reduce((sum, book) => sum + (book.personalRating || 0), 0) / booksWithRating.length : 0;
      const categoryMap = /* @__PURE__ */ new Map();
      books.forEach((book) => {
        const category = book.category || "未分类";
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
      const categoryStats = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: totalBooks > 0 ? Math.round(value / totalBooks * 100) : 0
      })).sort((a, b) => b.value - a.value);
      const platformMap = /* @__PURE__ */ new Map();
      books.forEach((book) => {
        const platform = book.platform || "未知平台";
        platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
      });
      const platformStats = Array.from(platformMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: totalBooks > 0 ? Math.round(value / totalBooks * 100) : 0
      })).sort((a, b) => b.value - a.value);
      const statusMap = /* @__PURE__ */ new Map();
      const statusNames = ["unread", "reading", "finished", "dropped", "to-read"];
      const statusLabels = {
        "unread": "未读",
        "reading": "阅读中",
        "finished": "已读完",
        "dropped": "弃读",
        "to-read": "待读"
      };
      statusNames.forEach((status) => {
        statusMap.set(statusLabels[status], 0);
      });
      books.forEach((book) => {
        const status = statusLabels[book.readingStatus] || "未读";
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      const statusStats = Array.from(statusMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: totalBooks > 0 ? Math.round(value / totalBooks * 100) : 0
      })).filter((item) => item.value > 0);
      const monthlyStats = getMonthlyStats(books, 12);
      const result = {
        totalBooks,
        totalWordCount,
        averageRating: Math.round(averageRating * 10) / 10,
        finishedBooks,
        readingBooks,
        unreadBooks,
        categoryStats,
        platformStats,
        statusStats,
        monthlyStats
      };
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("获取统计数据失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取统计数据失败"
      };
    }
  });
  electron.ipcMain.handle("stats:getCategoryStats", async () => {
    try {
      const books = databaseService.getAllBooks();
      const categoryMap = /* @__PURE__ */ new Map();
      books.forEach((book) => {
        const category = book.category || "未分类";
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
      const total = books.length;
      const result = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round(value / total * 100) : 0
      })).sort((a, b) => b.value - a.value);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("获取分类统计失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取分类统计失败"
      };
    }
  });
  electron.ipcMain.handle("stats:getPlatformStats", async () => {
    try {
      const books = databaseService.getAllBooks();
      const platformMap = /* @__PURE__ */ new Map();
      books.forEach((book) => {
        const platform = book.platform || "未知平台";
        platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
      });
      const total = books.length;
      const result = Array.from(platformMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round(value / total * 100) : 0
      })).sort((a, b) => b.value - a.value);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("获取平台统计失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取平台统计失败"
      };
    }
  });
  electron.ipcMain.handle("stats:getStatusStats", async () => {
    try {
      const books = databaseService.getAllBooks();
      const statusMap = /* @__PURE__ */ new Map();
      const statusNames = ["未读", "阅读中", "已读完", "弃读", "待读"];
      statusNames.forEach((status) => {
        statusMap.set(status, 0);
      });
      books.forEach((book) => {
        const status = book.readingStatus || "未读";
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      const total = books.length;
      const result = Array.from(statusMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round(value / total * 100) : 0
      })).filter((item) => item.value > 0);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("获取状态统计失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取状态统计失败"
      };
    }
  });
  electron.ipcMain.handle("stats:getMonthlyStats", async (_, months = 12) => {
    try {
      const books = databaseService.getAllBooks();
      const result = getMonthlyStats(books, months);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("获取月度统计失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取月度统计失败"
      };
    }
  });
  electron.ipcMain.handle("stats:exportData", async (_, options) => {
    try {
      const result = await exportService.exportStatistics(options);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("导出数据失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "导出数据失败"
      };
    }
  });
  electron.ipcMain.handle("stats:exportYearlyReport", async (_, year) => {
    try {
      const result = await exportService.exportYearlyReport(year);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("导出年度报告失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "导出年度报告失败"
      };
    }
  });
  electron.ipcMain.handle("stats:getYearlyStats", async (_, year) => {
    try {
      const books = databaseService.getAllBooks();
      const yearBooks = books.filter((book) => {
        if (!book.createdAt) return false;
        return new Date(book.createdAt).getFullYear() === year;
      });
      const totalBooks = yearBooks.length;
      const totalWordCount = yearBooks.reduce((sum, book) => sum + (book.wordCountDisplay || 0), 0);
      const finishedBooks = yearBooks.filter((book) => book.readingStatus === "finished").length;
      const readingBooks = yearBooks.filter((book) => book.readingStatus === "reading").length;
      const unreadBooks = yearBooks.filter((book) => book.readingStatus === "unread").length;
      const booksWithRating = yearBooks.filter((book) => book.personalRating && book.personalRating > 0);
      const averageRating = booksWithRating.length > 0 ? booksWithRating.reduce((sum, book) => sum + (book.personalRating || 0), 0) / booksWithRating.length : 0;
      const result = {
        totalBooks,
        totalWordCount,
        averageRating: Math.round(averageRating * 10) / 10,
        finishedBooks,
        readingBooks,
        unreadBooks,
        categoryStats: [],
        // 简化处理，可以按需扩展
        platformStats: [],
        statusStats: [],
        monthlyStats: getMonthlyStats(yearBooks, 12)
      };
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("获取年度统计失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取年度统计失败"
      };
    }
  });
  electron.ipcMain.handle("stats:recalculateStats", async () => {
    try {
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error("重新计算统计失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "重新计算统计失败"
      };
    }
  });
}
function getMonthlyStats(books, months = 12) {
  const monthlyData = {};
  const now = /* @__PURE__ */ new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[monthKey] = { bookCount: 0, wordCount: 0 };
  }
  books.forEach((book) => {
    if (book.createdAt) {
      const date = new Date(book.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].bookCount++;
        monthlyData[monthKey].wordCount += book.wordCountDisplay || 0;
      }
    }
  });
  const booksData = Object.entries(monthlyData).map(([month, data]) => ({
    month: formatMonth(month),
    bookCount: data.bookCount,
    wordCount: data.wordCount
  }));
  const wordsData = Object.entries(monthlyData).map(([month, data]) => ({
    month: formatMonth(month),
    bookCount: data.bookCount,
    wordCount: data.wordCount
  }));
  return {
    books: booksData,
    words: wordsData
  };
}
function formatMonth(monthStr) {
  const [year, month] = monthStr.split("-");
  return `${year}年${parseInt(month)}月`;
}
const isDev = process.env.NODE_ENV === "development" || !electron.app.isPackaged;
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  if (process.platform === "win32") {
    electron.app.setAppUserModelId("com.electron");
  }
  try {
    databaseService$1.initialize();
  } catch (error) {
    console.error("数据库初始化失败:", error);
  }
  setupBookHandlers();
  setupDocumentHandlers();
  setupSearchHandlers();
  registerStatsHandlers();
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  databaseService$1.close();
});
