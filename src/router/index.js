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

const ADMIN_SUBDOMAIN_HOST = 'admin.alvaradobitservice.com'

function isAdminSubdomain() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.location.hostname === ADMIN_SUBDOMAIN_HOST
}

const LoginView = () => import('../views/LoginView.vue')

async function requireAuth(to, from, next) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    next({ name: 'login' })
    return
  }

  next()
}

const publicRoutes = [
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
]

const adminPathRoutes = [
  {
    path: '/admin/login',
    name: 'login',
    component: LoginView,
    meta: {
      seo: ROUTE_SEO.adminLogin,
      noindex: true,
      isAdmin: true,
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
      isAdmin: true,
    },
  },
]

const adminSubdomainRoutes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      seo: ROUTE_SEO.adminLogin,
      noindex: true,
      isAdmin: true,
    },
  },
  {
    path: '/',
    name: 'admin',
    component: AdminView,
    beforeEnter: requireAuth,
    meta: {
      seo: ROUTE_SEO.admin,
      noindex: true,
      isAdmin: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const routes = isAdminSubdomain() ? adminSubdomainRoutes : [...publicRoutes, ...adminPathRoutes]

export const routerOptions = {
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
}
