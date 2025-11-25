# youshu.me 书籍详情页 HTML 结构分析

根据 `spider.ts` 中的解析逻辑和抓取结果，以下是 `https://www.youshu.me/book/145` 页面中各个信息字段所在的 HTML 结构：

## 1. 标题（Title）

### 主要选择器
- `<span style="font-size: 20px; font-weight: bold;">遮天</span>`
- 或者 `<span style="font-size:20px">遮天</span>`（无空格）

### 备选选择器（按优先级）
1. `h1`
2. `.book-title`
3. `.work-title`
4. `.title`
5. `.bookname`
6. `.workname`
7. `.c_subject`
8. `<title>` 标签（需要清理）

### 解析逻辑
```typescript
// 优先从大号字体 span 中提取
$('span[style*="font-size: 20px"], span[style*="font-size:20px"]').each(...)
```

---

## 2. 作者（Author）

### 主要结构
```html
<span>作者： <a href="/modules/article/authorarticle.php?author=辰东">辰东</a></span>
```

### 提取方法
- 查找包含"作者："的 `<span>` 元素
- 在 span 内查找 `<a>` 标签，获取链接文本

### 备选选择器
- `.bookinfo .author`
- `.workinfo .author`
- `.bookinfo a[href*="author"]`
- `.workinfo a[href*="author"]`
- `.author-name`
- `.book-author`
- `.work-author`
- `a[href*="/author/"]`

### 正则匹配模式
```javascript
/作者[：:]\s*([^\s，。；;|]+)/i
```

---

## 3. 封面（Cover）

### 主要选择器
```html
<a class="book-detail-img">
  <img src="https://qidian.qpic.cn/qdbimg/349573/1735921/300" alt="遮天" />
</a>
```

### 备选选择器
- `.book-cover img`
- `.work-cover img`
- `.cover img`
- `.bookimg img`
- `.bookinfo img`
- `.workinfo img`
- `img[alt*="封面"]`
- `img[alt*="cover"]`
- `.fl img`（列表页结构）

---

## 4. 简介（Description）

### 主要结构 - Tab 标签页
页面使用标签页结构，简介在"内容介绍"标签页（第一个 `.tabvalue`）：

```html
<div class="tabcontent">
  <!-- 内容介绍标签页 -->
  <div class="tabvalue" style="height:180px;">
    <div style="padding: 3px; ...">
      冰冷与黑暗并存的宇宙深处，九具庞大的龙尸拉着一口青铜古棺，亘古长存...
    </div>
  </div>
  
  <!-- 作品信息标签页 -->
  <div class="tabvalue" style="display:none;">
    <!-- 作品信息表格 -->
  </div>
</div>
```

### 提取逻辑
1. 找到 `.tabcontent` 容器
2. 获取第一个 `.tabvalue`（内容介绍）
3. 在 tabvalue 内部查找第一个 `<div>`，提取文本
4. 排除包含表格关键词的内容（如"作品分类"、"首发网站"等）

### 备选选择器
- `.book-desc`
- `.work-desc`
- `.description`
- `.intro`
- `.bookintro`
- `.c_description`
- `meta[name="description"]`

---

## 5. 作品信息表格（Book Info Table）

### 主要结构
作品信息在第二个 `.tabvalue` 的 `<table>` 中：

```html
<div class="tabvalue" style="display:none;">
  <table>
    <tr>
      <td>作品分类：仙侠</td>
      <td>连载状态：已完结</td>
      <td>最后更新：2021-05-01</td>
    </tr>
    <tr>
      <td>作品性质：免费</td>
      <td>授权级别：转载作品</td>
      <td>首发网站：起点</td>
    </tr>
    <tr>
      <td>全文字数：6353300</td>
      <td>章 节 数：0</td>
      <td>收 藏 数：13</td>
    </tr>
    <tr>
      <td>总点击数：83517</td>
      <td>本月点击：211</td>
      <td>本周点击：35</td>
    </tr>
    <tr>
      <td>总推荐数：3138</td>
      <td>本月推荐：0</td>
      <td>本周推荐：0</td>
    </tr>
  </table>
</div>
```

### 关键字段提取

#### 作品分类（Category）
```html
<td>作品分类：仙侠</td>
```
**正则匹配：** `/作品分类[：:]\s*([^\s，。；;|]+)/`

#### 首发网站/平台（Platform）
```html
<td>首发网站：起点</td>
```
**正则匹配：** `/首发网站[：:]\s*([^\s，。；;|]+)/`

#### 全文字数（Word Count）
```html
<td>全文字数：6353300</td>
```
**正则匹配：** `/全文字数[：:]\s*([^\s，。；;|]+)/`

**解析逻辑：**
- 支持数字格式：`6353300`、`635,3300`
- 支持中文格式：`635.3万` → 转换为 `6353000`

---

## 6. 评分信息（Rating）

### 平均评分
```html
平均
7.2
<img src="/images/star-on-16.png" />
<img src="/images/star-on-16.png" />
<img src="/images/star-on-16.png" />
<img src="/images/star-half-16.png" />
<img src="/images/star-off-16.png" />
2032 评分次数
```

### 评分分布表格
```html
<table>
  <tr><td>5 星</td><td>35%</td></tr>
  <tr><td>4 星</td><td>27%</td></tr>
  <tr><td>3 星</td><td>18%</td></tr>
  <tr><td>2 星</td><td>7%</td></tr>
  <tr><td>1 星</td><td>13%</td></tr>
</table>
```

---

## 7. 标签（Tags）

```html
<strong>标签：</strong> 
<a href="/tagarticle/仙侠/1.html">仙侠</a> 
<a href="/tagarticle/修真文明/1.html">修真文明</a>
```

### 选择器
- 查找包含"标签："的文本节点
- 查找其后所有 `<a>` 标签，提取链接文本

---

## 8. 其他信息

### 状态信息（可能位于页面顶部）
```html
起点仙侠已完结6353300字
```

这个信息可能出现在：
- 标题附近
- 作者信息下方
- 独立的段落或 div 中

### 封面链接和操作按钮
```html
<a href="https://qidian.qpic.cn/qdbimg/349573/1735921/300">
  <img src="..." />
</a>
- <a href="https://book.qidian.com/info/1735921">点击阅读</a>
- 推荐本书
- <a href="...">作者专栏</a>
- 收入书单
- 加入书架
```

---

## 9. 列表页结构（用于对比）

当搜索结果直接跳转到详情页时，也可能显示为列表页结构：

```html
<div class="c_row">
  <div class="fl">
    <img src="封面URL" />
  </div>
  <div class="c_subject">
    <a href="/book/145">遮天</a>
  </div>
  <div class="c_tag">
    <span class="c_label">作者</span>
    <span class="c_value">辰东</span>
  </div>
  <div class="c_tag">
    <span class="c_label">分类</span>
    <span class="c_value">仙侠</span>
  </div>
  <div class="c_tag">
    <span class="c_label">字数</span>
    <span class="c_value">6353300</span>
  </div>
  <div class="c_description">
    简介内容...
  </div>
</div>
```

### 列表页信息提取
- `.c_row` - 每个结果项
- `.c_subject a` - 标题链接
- `.fl img` - 封面图片
- `.c_tag` - 元信息标签
  - `.c_label` - 标签名（如"作者"、"分类"、"字数"）
  - `.c_value` - 标签值
- `.c_description` - 简介

---

## 10. 完整的页面结构示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>遮天 - youshu.me</title>
  <meta charset="gbk" />
</head>
<body>
  <!-- 导航栏 -->
  <div class="nav">
    <a href="/sort/0/1.html">全部</a> | ...
  </div>

  <!-- 书籍详情区域 -->
  <div class="book-detail">
    <!-- 封面 -->
    <a class="book-detail-img">
      <img src="封面URL" />
    </a>

    <!-- 标题和作者 -->
    <span style="font-size: 20px; font-weight: bold;">遮天</span>
    <span>作者： <a href="...">辰东</a></span>

    <!-- 状态信息 -->
    起点仙侠已完结6353300字

    <!-- 标签页导航 -->
    <ul class="tabs">
      <li>内容介绍</li>
      <li>作品信息</li>
      <li>本书公告</li>
    </ul>

    <!-- 标签页内容 -->
    <div class="tabcontent">
      <!-- 内容介绍 -->
      <div class="tabvalue">
        <div>
          简介内容...
        </div>
      </div>

      <!-- 作品信息 -->
      <div class="tabvalue" style="display:none;">
        <table>
          <tr>
            <td>作品分类：仙侠</td>
            <td>连载状态：已完结</td>
            <td>最后更新：2021-05-01</td>
          </tr>
          <!-- 更多行... -->
        </table>
      </div>
    </div>

    <!-- 标签 -->
    <strong>标签：</strong>
    <a href="...">仙侠</a>
    <a href="...">修真文明</a>
  </div>

  <!-- 评分区域 -->
  <div class="rating">
    <h4>youshu.me评分</h4>
    平均 7.2
    <!-- 星星图标 -->
    2032 评分次数
    <!-- 评分分布表格 -->
  </div>

  <!-- 书评区域 -->
  <div class="reviews">
    <h4>最新书评</h4>
    <!-- 书评列表 -->
  </div>
</body>
</html>
```

---

## 注意事项

1. **编码问题：** 页面使用 GBK/GB2312 编码，需要使用 `iconv-lite` 解码
2. **URL 规范化：** 相对链接需要转换为绝对链接（如 `/book/145` → `https://www.youshu.me/book/145`）
3. **重定向：** 搜索时可能会重定向到详情页
4. **列表页 vs 详情页：** 需要判断当前页面是列表页还是详情页
5. **表格数据提取：** 作品信息在表格的 `<td>` 中，需要通过正则匹配提取
6. **文本清理：** 提取的文本需要去除多余的空白字符：`.replace(/\s+/g, ' ').trim()`

---

## 相关文件

- `src/main/services/spider.ts` - 爬虫服务实现
- `src/main/ipc/searchHandler.ts` - IPC 处理器

