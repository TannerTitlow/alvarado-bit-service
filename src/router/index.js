import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import AdminView from '../views/AdminView.vue'
import { supabase } from '@/lib/supabaseClient'
import {
  ROUTE_SEO,
  createCommonSchemas,
  createContactSchemas,
  createHomeSchemas,
} from '@/lib/seo'

async function requireAuth(to, from, next) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    next('/admin/login')
    return
  }

  next()
}

export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      seo: ROUTE_SEO.home,
      structuredData: () => createHomeSchemas(),
    },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      seo: ROUTE_SEO.about,
      structuredData: () => createCommonSchemas(),
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView,
    meta: {
      seo: ROUTE_SEO.contact,
      structuredData: () => createContactSchemas(),
    },
  },
  {
    path: '/admin/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      seo: ROUTE_SEO.adminLogin,
      noindex: true,
    },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    beforeEnter: requireAuth,
    meta: {
      seo: ROUTE_SEO.admin,
      noindex: true,
    },
  },
]

export const routerOptions = {
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
}
