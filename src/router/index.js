/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import AdminView from '../views/AdminView.vue'
import { supabase } from '@/lib/supabaseClient'

// Auth guard
async function requireAuth(to, from, next) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    next('/admin/login')
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/admin/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      beforeEnter: requireAuth,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when changing routes
    return { top: 0, behavior: 'smooth' }

    // Or if you want to use saved positions when using browser back/forward:
    // return savedPosition || { top: 0, behavior: 'smooth' }
  },
})

export default router
