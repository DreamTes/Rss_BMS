import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { 
        title: '登录',
        requiresAuth: false  // 不需要登录就可以访问
      }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { 
        title: '首页',
        requiresAuth: true  // 需要登录才能访问
      }
    },
    {
      path: '/rss-sources',
      name: 'rssSources',
      component: () => import('../views/RssSourcesView.vue'),
      meta: { 
        title: 'RSS源管理',
        requiresAuth: true
      }
    },
    {
      path: '/rss-articles',
      name: 'rssArticles',
      component: () => import('../views/RssArticlesView.vue'),
      meta: { 
        title: 'RSS文章管理',
        requiresAuth: true
      }
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/CategoriesView.vue'),
      meta: { 
        title: '分类管理',
        requiresAuth: true
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { 
        title: '系统设置',
        requiresAuth: true
      }
    }
  ],
})

// 导航守卫，控制路由访问权限
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `RSS管理系统 - ${to.meta.title}`
  }
  
  // 判断是否需要登录才能访问
  if (to.meta.requiresAuth) {
    // 检查是否有token
    const token = localStorage.getItem('token')
    if (!token) {
      // 如果没有token，重定向到登录页
      ElMessage.warning('请先登录')
      next({ 
        path: '/login', 
        query: { redirect: to.fullPath } // 保存原本要去的路径，便于登录后重定向
      })
    } else {
      // 有token，允许访问
      next()
    }
  } else {
    // 不需要登录的页面，直接访问
    next()
  }
})

export default router
