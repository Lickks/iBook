<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUIStore } from './stores/ui'
import { useBookStore } from './stores/book'
import { useBookshelfStore } from './stores/bookshelf'
import BookshelfDialog from './components/BookshelfDialog.vue'

const uiStore = useUIStore()
const bookStore = useBookStore()
const bookshelfStore = useBookshelfStore()
const route = useRoute()
const router = useRouter()

const viewWrapperRef = ref<HTMLElement | null>(null)

const navItems = [
  { name: 'Home', label: '书籍列表', icon: '📚', path: '/' },
  { name: 'BatchImport', label: '批量导入', icon: '📦', path: '/batch-import' },
  { name: 'TagManagement', label: '标签管理', icon: '🏷️', path: '/tags' },
  { name: 'Statistics', label: '统计分析', icon: '📊', path: '/statistics' },
  { name: 'Settings', label: '设置', icon: '⚙️', path: '/settings' }
]

const activeRoute = computed(() => route.name)
const themeLabel = computed(() => {
  return uiStore.theme === 'dark' ? '切换为亮色' : '切换为暗色'
})

// 书架相关状态
const bookshelfExpanded = ref(true)
const showBookshelfDialog = ref(false)
const editingBookshelf = ref(null)

const customBookshelves = computed(() => bookshelfStore.customBookshelves)
const currentBookshelfId = computed(() => bookshelfStore.currentBookshelfId)

// 判断导航项是否应该高亮
const isNavItemActive = (itemName: string): boolean => {
  if (itemName === 'Home') {
    // 书籍列表按钮只有在默认书架时才高亮
    const defaultBookshelfId = bookshelfStore.defaultBookshelf?.id || null
    return activeRoute.value === 'Home' && currentBookshelfId.value === defaultBookshelfId
  }
  return activeRoute.value === itemName
}

// 监听路由变化，更新当前书架
watch(() => route.params.bookshelfId, (bookshelfId) => {
  if (bookshelfId) {
    const id = Number(bookshelfId)
    if (!isNaN(id)) {
      bookshelfStore.setCurrentBookshelf(id)
      bookStore.setCurrentBookshelf(id)
    }
  }
}, { immediate: true })

// 处理书籍列表按钮点击，切换到默认书架
function handleHomeClick(): void {
  const defaultBookshelfId = bookshelfStore.defaultBookshelf?.id || null
  if (bookshelfStore.currentBookshelfId !== defaultBookshelfId) {
    bookshelfStore.setCurrentBookshelf(defaultBookshelfId)
    bookStore.setCurrentBookshelf(defaultBookshelfId)
    bookStore.fetchBooks()
  }
}

async function ensureBooksLoaded(): Promise<void> {
  if (!bookStore.books.length) {
    await bookStore.fetchBooks()
  }
}

async function ensureBookshelvesLoaded(): Promise<void> {
  if (bookshelfStore.bookshelves.length === 0) {
    try {
      await bookshelfStore.fetchBookshelves()
      // 如果没有当前书架，设置为默认书架
      if (!bookshelfStore.currentBookshelfId && bookshelfStore.defaultBookshelf) {
        bookshelfStore.setCurrentBookshelf(bookshelfStore.defaultBookshelf.id)
        bookStore.setCurrentBookshelf(bookshelfStore.defaultBookshelf.id)
      }
    } catch (error: any) {
      console.error('加载书架列表失败:', error)
    }
  }
}

function handleBookshelfClick(bookshelfId: number): void {
  bookshelfStore.setCurrentBookshelf(bookshelfId)
  bookStore.setCurrentBookshelf(bookshelfId)
  bookStore.fetchBooks()
  // 如果当前不在首页，跳转到首页
  if (route.name !== 'Home') {
    router.push('/')
  }
}

function openBookshelfDialog(bookshelf = null): void {
  editingBookshelf.value = bookshelf
  showBookshelfDialog.value = true
}

function handleBookshelfSuccess(): void {
  // 刷新书架列表
  bookshelfStore.fetchBookshelves()
  // 刷新书籍列表
  bookStore.fetchBooks()
}

onMounted(() => {
  ensureBooksLoaded()
  ensureBookshelvesLoaded()
})

onUnmounted(() => {
  // 清理逻辑
})
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ collapsed: uiStore.sidebarCollapsed }">
      <div class="brand">
        <div class="logo">iBook</div>
        <p>本地网络小说管理器</p>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="nav-link"
          :class="{ active: isNavItemActive(item.name) }"
          @click="item.name === 'Home' ? handleHomeClick() : undefined"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </RouterLink>

        <!-- 自定义书架 -->
        <div class="bookshelf-section">
          <button
            class="nav-link bookshelf-header"
            @click="bookshelfExpanded = !bookshelfExpanded"
          >
            <span class="icon">📖</span>
            <span class="label">自定义书架</span>
            <span class="expand-icon" :class="{ expanded: bookshelfExpanded }">▼</span>
          </button>
          <Transition name="bookshelf-list">
            <div v-if="bookshelfExpanded" class="bookshelf-list">
              <button
                v-for="bookshelf in customBookshelves"
                :key="bookshelf.id"
                class="bookshelf-item"
                :class="{ active: activeRoute === 'Home' && currentBookshelfId === bookshelf.id }"
                @click="handleBookshelfClick(bookshelf.id)"
              >
                <span class="bookshelf-icon">📚</span>
                <span class="bookshelf-name">{{ bookshelf.name }}</span>
              </button>
              <button
                class="bookshelf-item create-bookshelf"
                @click="openBookshelfDialog(null)"
              >
                <span class="bookshelf-icon">➕</span>
                <span class="bookshelf-name">创建书架</span>
              </button>
            </div>
          </Transition>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="ghost-btn" type="button" @click="uiStore.toggleSidebar">
          {{ uiStore.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏' }}
        </button>
      </div>
    </aside>
    <button
      v-if="uiStore.sidebarCollapsed"
      class="sidebar-toggle"
      type="button"
      @click="uiStore.toggleSidebar"
    >
      <span class="icon">☰</span>
      <span>展开菜单</span>
    </button>

    <div class="workspace">
      <header class="topbar">
        <div class="topbar-left">
          <button class="ghost-btn mobile-only" type="button" @click="uiStore.toggleSidebar">
            {{ uiStore.sidebarCollapsed ? '☰' : '✕' }}
          </button>
          <h1>阅读记录</h1>
        </div>
        <div class="topbar-actions">
          <button class="ghost-btn" type="button" :title="themeLabel" @click="uiStore.toggleTheme">
            {{ uiStore.theme === 'dark' ? '🌙' : '☀️' }}
          </button>
        </div>
      </header>

      <main ref="viewWrapperRef" class="view-wrapper">
        <RouterView v-slot="{ Component, route }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <!-- 书架对话框 -->
    <BookshelfDialog
      v-model="showBookshelfDialog"
      :bookshelf="editingBookshelf"
      @success="handleBookshelfSuccess"
    />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-soft) 100%);
  position: relative;
}

.sidebar {
  width: 240px;
  height: 100vh;
  padding: 0;
  background: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  overflow: hidden;
  transition:
    width 0.2s ease,
    transform 0.2s ease;
}

.sidebar > .brand {
  padding: 32px 24px 20px 24px;
  flex-shrink: 0;
}

.sidebar > .nav {
  padding: 0 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar > .sidebar-footer {
  padding: 20px 24px 32px 24px;
  flex-shrink: 0;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.brand .logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-accent);
}

.brand p {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  transition: background 0.2s ease;
  color: var(--color-text-secondary);
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.nav-link:hover:not(.active) {
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
}

.nav-link .icon {
  margin-right: 10px;
  font-size: 16px;
}

.nav-link.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}

/* 书架部分样式 */
.bookshelf-section {
  margin-top: 8px;
}

.bookshelf-header {
  width: 100%;
  justify-content: space-between;
  cursor: pointer;
}

.expand-icon {
  font-size: 10px;
  transition: transform 0.2s ease;
  color: var(--color-text-tertiary);
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.bookshelf-list {
  margin-top: 4px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bookshelf-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.bookshelf-item:hover {
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
}

.bookshelf-item.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}

.bookshelf-item.create-bookshelf {
  color: var(--color-accent);
  font-weight: 500;
}

.bookshelf-item.create-bookshelf:hover {
  background: var(--color-accent-soft);
}

.bookshelf-icon {
  margin-right: 8px;
  font-size: 14px;
}

.bookshelf-name {
  flex: 1;
}

/* 书架列表展开/收起动画 */
.bookshelf-list-enter-active,
.bookshelf-list-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.bookshelf-list-enter-from,
.bookshelf-list-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

.bookshelf-list-enter-to,
.bookshelf-list-leave-from {
  max-height: 500px;
  opacity: 1;
}

.primary-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.primary-btn:hover {
  background: var(--color-accent-strong);
}

.ghost-btn {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.ghost-btn:hover {
  background: var(--color-bg-muted);
}

.sidebar-footer {
  margin-top: auto;
}

.sidebar-toggle {
  position: fixed;
  top: 24px;
  left: 16px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, background 0.2s ease;
}

.sidebar-toggle:hover {
  background: var(--color-accent-strong);
  transform: translateY(-1px);
}

.sidebar-toggle .icon {
  font-size: 16px;
}

.workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.dark .topbar {
  background: rgba(15, 23, 42, 0.6);
}

.topbar h1 {
  font-size: 20px;
  margin: 0;
  color: var(--color-text-primary);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-actions {
  display: flex;
  gap: 8px;
}

.view-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-soft) 40%, var(--color-bg) 100%);
}

.mobile-only {
  display: none;
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 10;
  }

  .sidebar.collapsed {
    transform: translateX(-110%);
  }

  .workspace {
    margin-left: 0;
  }

  .mobile-only {
    display: inline-flex;
  }

  .sidebar-toggle {
    display: none;
  }

  .view-wrapper {
    padding: 16px;
  }
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .sidebar {
    transition: none;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
