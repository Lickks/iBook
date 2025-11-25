-- iBook 数据库结构
-- SQLite 数据库

-- ============================================
-- 书籍信息表
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '书名',
    author VARCHAR(100) COMMENT '作者',
    cover_url VARCHAR(500) COMMENT '封面URL或本地路径',
    platform VARCHAR(100) COMMENT '所在平台（如：起点中文网）',
    category VARCHAR(50) COMMENT '类型（如：玄幻、都市、言情）',
    description TEXT COMMENT '简介/描述',
    
    -- 字数相关字段
    word_count_source VARCHAR(20) DEFAULT 'search' COMMENT '字数来源: search/document/manual',
    word_count_search INTEGER COMMENT '检索到的字数',
    word_count_document INTEGER COMMENT '文档计算出的字数',
    word_count_manual INTEGER COMMENT '手动输入的字数',
    word_count_display INTEGER COMMENT '显示的字数（用户选择的主字数源）',
    
    isbn VARCHAR(50) COMMENT 'ISBN编号',
    source_url VARCHAR(500) COMMENT '来源网址',
    
    -- 阅读状态
    reading_status VARCHAR(20) DEFAULT 'unread' COMMENT '阅读状态: unread/reading/finished/dropped/to-read',
    personal_rating DECIMAL(2,1) COMMENT '个人评分 (0.0-5.0)',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- ============================================
-- 文档表
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL COMMENT '关联的书籍ID',
    file_name VARCHAR(200) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    file_type VARCHAR(20) NOT NULL COMMENT '文件类型（txt/epub/pdf/docx等）',
    file_size INTEGER COMMENT '文件大小（字节）',
    word_count INTEGER COMMENT '计算出的字数',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ============================================
-- 阅读进度表
-- ============================================
CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL COMMENT '关联的书籍ID',
    current_chapter VARCHAR(200) COMMENT '当前章节名称',
    current_page INTEGER COMMENT '当前页数',
    progress_percentage DECIMAL(5,2) COMMENT '阅读百分比 (0.00-100.00)',
    last_read_at DATETIME COMMENT '最后阅读时间',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ============================================
-- 笔记表
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL COMMENT '关联的书籍ID',
    note_type VARCHAR(20) COMMENT '笔记类型: review(书评)/note(笔记)/excerpt(摘抄)',
    content TEXT COMMENT '笔记内容',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ============================================
-- 标签表
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_name VARCHAR(50) UNIQUE NOT NULL COMMENT '标签名称',
    color VARCHAR(20) COMMENT '标签颜色（十六进制）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- ============================================
-- 书籍标签关联表
-- ============================================
CREATE TABLE IF NOT EXISTS book_tags (
    book_id INTEGER NOT NULL COMMENT '书籍ID',
    tag_id INTEGER NOT NULL COMMENT '标签ID',
    PRIMARY KEY (book_id, tag_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================
-- 创建索引
-- ============================================

-- 书籍表索引
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(reading_status);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_updated_at ON books(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(personal_rating);
-- 复合索引：用于类型和平台筛选
CREATE INDEX IF NOT EXISTS idx_books_category_platform ON books(category, platform);
-- 复合索引：用于搜索优化（title和author）
CREATE INDEX IF NOT EXISTS idx_books_title_author ON books(title, author);

-- 文档表索引
CREATE INDEX IF NOT EXISTS idx_documents_book_id ON documents(book_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(file_type);

-- 阅读进度表索引
CREATE INDEX IF NOT EXISTS idx_progress_book_id ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_progress_last_read ON reading_progress(last_read_at DESC);

-- 笔记表索引
CREATE INDEX IF NOT EXISTS idx_notes_book_id ON notes(book_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(note_type);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- 标签表索引
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(tag_name);

-- 书籍标签关联表索引（优化关联查询）
CREATE INDEX IF NOT EXISTS idx_book_tags_book_id ON book_tags(book_id);
CREATE INDEX IF NOT EXISTS idx_book_tags_tag_id ON book_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_book_tags_composite ON book_tags(book_id, tag_id);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_books_timestamp 
AFTER UPDATE ON books
BEGIN
    UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- 视图：书籍详情视图（包含文档和进度信息）
-- ============================================
CREATE VIEW IF NOT EXISTS v_book_details AS
SELECT 
    b.id,
    b.title,
    b.author,
    b.cover_url,
    b.platform,
    b.category,
    b.description,
    b.word_count_display,
    b.reading_status,
    b.personal_rating,
    b.created_at,
    b.updated_at,
    d.file_name AS document_name,
    d.file_type AS document_type,
    d.file_path AS document_path,
    rp.progress_percentage,
    rp.current_chapter,
    rp.last_read_at,
    GROUP_CONCAT(t.tag_name, ',') AS tags
FROM books b
LEFT JOIN documents d ON b.id = d.book_id
LEFT JOIN reading_progress rp ON b.id = rp.book_id
LEFT JOIN book_tags bt ON b.id = bt.book_id
LEFT JOIN tags t ON bt.tag_id = t.id
GROUP BY b.id;

-- ============================================
-- 视图：阅读统计视图
-- ============================================
CREATE VIEW IF NOT EXISTS v_reading_stats AS
SELECT 
    COUNT(*) AS total_books,
    SUM(CASE WHEN reading_status = 'finished' THEN 1 ELSE 0 END) AS finished_books,
    SUM(CASE WHEN reading_status = 'reading' THEN 1 ELSE 0 END) AS reading_books,
    SUM(CASE WHEN reading_status = 'to-read' THEN 1 ELSE 0 END) AS to_read_books,
    SUM(CASE WHEN reading_status = 'dropped' THEN 1 ELSE 0 END) AS dropped_books,
    SUM(word_count_display) AS total_words,
    AVG(personal_rating) AS avg_rating
FROM books
WHERE reading_status IS NOT NULL;

-- ============================================
-- 视图：按类型统计
-- ============================================
CREATE VIEW IF NOT EXISTS v_category_stats AS
SELECT 
    category,
    COUNT(*) AS book_count,
    SUM(word_count_display) AS total_words,
    AVG(personal_rating) AS avg_rating
FROM books
WHERE category IS NOT NULL
GROUP BY category
ORDER BY book_count DESC;

-- ============================================
-- 视图：按平台统计
-- ============================================
CREATE VIEW IF NOT EXISTS v_platform_stats AS
SELECT 
    platform,
    COUNT(*) AS book_count,
    SUM(word_count_display) AS total_words
FROM books
WHERE platform IS NOT NULL
GROUP BY platform
ORDER BY book_count DESC;

-- ============================================
-- 视图：月度阅读统计
-- ============================================
CREATE VIEW IF NOT EXISTS v_monthly_stats AS
SELECT 
    strftime('%Y-%m', created_at) AS month,
    COUNT(*) AS books_added,
    SUM(word_count_display) AS total_words
FROM books
GROUP BY strftime('%Y-%m', created_at)
ORDER BY month DESC;

