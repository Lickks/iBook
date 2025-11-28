import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/book/:id',
      name: 'BookDetail',
      component: () => import('../views/BookDetail.vue')
    },
    {
      path: '/add',
      name: 'AddBook',
      component: () => import('../views/AddBook.vue')
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('../views/Statistics.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue')
    },
    {
      path: '/tags',
      name: 'TagManagement',
      component: () => import('../views/TagManagement.vue')
    },
    {
      path: '/batch-import',
      name: 'BatchImport',
      component: () => import('../views/BatchImport.vue')
    },
    {
      path: '/bookshelves',
      name: 'BookshelfManagement',
      component: () => import('../views/BookshelfManagement.vue')
    },
    {
      path: '/txt-to-epub',
      name: 'TxtToEpub',
      component: () => import('../views/TxtToEpub.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      // 从列表页进入详情页时，确保滚动到顶部
      if (from.name === 'Home' && to.name === 'BookDetail') {
        // 使用多个 requestAnimationFrame 确保 DOM 已完全渲染
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const scrollContainer = document.querySelector('.view-wrapper') as HTMLElement
            if (scrollContainer) {
              scrollContainer.scrollTop = 0
            }
            resolve({ top: 0 })
          })
        })
        return
      }

      // 从详情页返回列表页时，不设置滚动位置，让 Home 组件自行恢复
      if (from.name === 'BookDetail' && to.name === 'Home') {
        // 不设置滚动位置，完全交给 Home 组件处理
        // 使用一个很长的延迟，确保 Home 组件先执行恢复逻辑
        setTimeout(() => {
          resolve({ top: 0 })
        }, 200)
        return
      }

      // 其他情况：使用浏览器保存的位置，或滚动到顶部
      requestAnimationFrame(() => {
        const scrollContainer = document.querySelector('.view-wrapper') as HTMLElement
        if (savedPosition && scrollContainer) {
          scrollContainer.scrollTop = savedPosition.top || 0
          resolve({ ...savedPosition, el: scrollContainer })
        } else if (scrollContainer) {
          scrollContainer.scrollTop = 0
          resolve({ top: 0, el: scrollContainer })
        } else {
          resolve({ top: 0 })
        }
      })
    })
  }
})

export default router

