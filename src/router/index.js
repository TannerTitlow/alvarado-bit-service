/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import AdminView from '../views/AdminView.vue'
import { supabase } from '@/lib/supabaseClient'
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO,
  ROUTE_SEO,
  createCommonSchemas,
  createContactSchemas,
  createHomeSchemas,
  getCanonicalUrl,
} from '@/lib/seo'

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

const SEO_SCHEMA_ID = 'route-structured-data'

function upsertMetaTag(attribute, key, content) {
  if (!content) {
    return
  }

  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

function upsertCanonicalLink(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', href)
}

function upsertStructuredData(data) {
  const existing = document.getElementById(SEO_SCHEMA_ID)

  if (!data || (Array.isArray(data) && data.length === 0)) {
    existing?.remove()
    return
  }

  const script = existing || document.createElement('script')
  script.id = SEO_SCHEMA_ID
  script.setAttribute('type', 'application/ld+json')
  script.textContent = JSON.stringify(data)

  if (!existing) {
    document.head.appendChild(script)
  }
}

function applyRouteSeo(to) {
  if (typeof document === 'undefined') {
    return
  }

  const routeSeo = to.meta?.seo || DEFAULT_SEO
  const title = routeSeo.title || DEFAULT_SEO.title
  const description = routeSeo.description || DEFAULT_SEO.description
  const keywords = routeSeo.keywords || DEFAULT_SEO.keywords
  const canonicalUrl = getCanonicalUrl(to.path)
  const robots = to.meta?.noindex ? 'noindex, nofollow' : 'index, follow'
  const structuredData =
    typeof to.meta?.structuredData === 'function' ?
      to.meta.structuredData()
    : to.meta?.structuredData

  document.title = title

  upsertMetaTag('name', 'description', description)
  upsertMetaTag('name', 'keywords', keywords)
  upsertMetaTag('name', 'robots', robots)
  upsertMetaTag('property', 'og:type', 'website')
  upsertMetaTag('property', 'og:url', canonicalUrl)
  upsertMetaTag('property', 'og:title', title)
  upsertMetaTag('property', 'og:description', description)
  upsertMetaTag('property', 'og:image', DEFAULT_OG_IMAGE)
  upsertMetaTag('property', 'og:site_name', 'Alvarado Bit Service')
  upsertMetaTag('name', 'twitter:card', 'summary_large_image')
  upsertMetaTag('name', 'twitter:url', canonicalUrl)
  upsertMetaTag('name', 'twitter:title', title)
  upsertMetaTag('name', 'twitter:description', description)
  upsertMetaTag('name', 'twitter:image', DEFAULT_OG_IMAGE)
  upsertCanonicalLink(canonicalUrl)
  upsertStructuredData(structuredData)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
  ],
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when changing routes
    return { top: 0, behavior: 'smooth' }

    // Or if you want to use saved positions when using browser back/forward:
    // return savedPosition || { top: 0, behavior: 'smooth' }
  },
})

router.afterEach(to => {
  applyRouteSeo(to)
})

export default router
