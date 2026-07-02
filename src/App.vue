<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { DEFAULT_OG_IMAGE, DEFAULT_SEO, getCanonicalUrl } from '@/lib/seo'

const route = useRoute()

const isAdminRoute = computed(() => {
  return route.meta?.isAdmin === true
})

const routeSeo = computed(() => route.meta?.seo || DEFAULT_SEO)
const title = computed(() => routeSeo.value.title || DEFAULT_SEO.title)
const description = computed(() => {
  return routeSeo.value.description || DEFAULT_SEO.description
})
const keywords = computed(() => {
  if (route.meta?.noindex) {
    return routeSeo.value.keywords || ''
  }

  return routeSeo.value.keywords || DEFAULT_SEO.keywords
})
const canonicalUrl = computed(() => {
  if (route.meta?.noindex) {
    return null
  }

  return getCanonicalUrl(route.path)
})
const robots = computed(() => {
  return route.meta?.noindex ? 'noindex, nofollow' : 'index, follow'
})
const structuredData = computed(() => {
  const data =
    typeof route.meta?.structuredData === 'function' ?
      route.meta.structuredData()
    : route.meta?.structuredData

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null
  }

  return data
})

useHead(() => {
  const meta = [
    { name: 'title', content: title.value },
    { name: 'description', content: description.value },
    { name: 'robots', content: robots.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { property: 'og:image', content: DEFAULT_OG_IMAGE },
    { property: 'og:site_name', content: 'Alvarado Bit Service' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title.value },
    { name: 'twitter:description', content: description.value },
    { name: 'twitter:image', content: DEFAULT_OG_IMAGE },
  ]

  if (canonicalUrl.value) {
    meta.push(
      { property: 'og:url', content: canonicalUrl.value },
      { name: 'twitter:url', content: canonicalUrl.value },
    )
  }

  if (keywords.value) {
    meta.push({ name: 'keywords', content: keywords.value })
  }

  return {
    title: title.value,
    meta,
    link: canonicalUrl.value ? [{ rel: 'canonical', href: canonicalUrl.value }] : [],
    script:
      structuredData.value ?
        [
          {
            id: 'route-structured-data',
            type: 'application/ld+json',
            textContent: JSON.stringify(structuredData.value),
          },
        ]
      : [],
  }
})

</script>

<template>
  <div class="app">
    <header v-if="!isAdminRoute" class="header">
      <nav class="nav">
        <div class="company-name">
          <RouterLink to="/">
            <img src="@/assets/abs-logo.png" alt="ABS Logo" class="logo" />
            <span>Alvarado Bit Service</span>
          </RouterLink>
        </div>
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          <RouterLink to="/about" class="nav-link">About</RouterLink>
          <RouterLink to="/contact" class="nav-link">Contact</RouterLink>
        </div>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style>
@import './assets/fonts.css';
.app {
  min-height: 100vh;
  font-family: var(--font-primary);
  background-color: #f5f5f5;
}

.header {
  background: var(--pure-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-name a {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--font-logo);
  font-weight: var(--fw-semibold);
  font-size: var(--text-2xl);
  color: var(--navy-blue);
  text-decoration: none;
  line-height: var(--leading-tight);
}

.logo {
  height: 40px;
  width: 40px;
  border-radius: 50%;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--steel-gray);
  text-decoration: none;
  font-size: var(--text-base);
  transition: color 0.2s ease;
  font-weight: var(--fw-medium);
  line-height: var(--leading-normal);
}

.nav-link:hover {
  color: var(--patriot-red);
}

.router-link-active {
  color: var(--patriot-red);
  font-weight: var(--fw-semibold);
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .company-name a {
    font-size: var(--text-lg); /* Slightly smaller on mobile */
  }

  .nav-link {
    font-size: var(--text-sm); /* Slightly smaller on mobile */
  }
}
</style>
