<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useUIStore } from './stores/ui'
import { useBookStore } from './stores/book'

const uiStore = useUIStore()
const bookStore = useBookStore()
const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'Home', label: '书籍列表', icon: '📚', path: '/' },
  { name: 'AddBook', label: '添加书籍', icon: '✍️', path: '/add' },
  { name: 'TagManagement', label: '标签管理', icon: '🏷️', path: '/tags' },
  { name: 'Statistics', label: '统计分析', icon: '📊', path: '/statistics' },
  { name: 'Settings', label: '设置', icon: '⚙️', path: '/settings' }
]

const activeRoute = computed(() => route.name)
const themeLabel = computed(() => {
  const theme = uiStore.getEffectiveTheme()
  return theme === 'dark' ? '切换为亮色' : '切换为暗色'
})

async function ensureBooksLoaded(): Promise<void> {
  if (!bookStore.books.length) {
    await bookStore.fetchBooks()
  }
}

function goToAddPage(): void {
  router.push('/add')
}

onMounted(() => {
  ensureBooksLoaded()
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
          :class="{ active: activeRoute === item.name }"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button class="primary-btn" type="button" @click="goToAddPage">
        + 添加书籍
      </button>

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
            {{ uiStore.getEffectiveTheme() === 'dark' ? '🌙' : '☀️' }}
          </button>
        </div>
      </header>

      <main class="view-wrapper">
        <RouterView v-slot="{ Component, route }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
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
  padding: 32px 24px;
  background: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition:
    width 0.2s ease,
    transform 0.2s ease;
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
