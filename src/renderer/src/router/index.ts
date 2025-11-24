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
      component: () => import('../views/StatisticsNew.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue')
    }
  ]
})

export default router

