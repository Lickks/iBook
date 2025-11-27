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
  ]
})

export default router

