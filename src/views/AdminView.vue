<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { SITE_URL } from '@/lib/seo'
import ContactSubmissions from '@/components/admin/contact-submissions/ContactSubmissions.vue'
import ManageDrillBitInventory from '@/components/admin/inventory/ManageDrillBitInventory.vue'
import ManageFeatured from '@/components/admin/featured/ManageFeatured.vue'

const ADMIN_SUBDOMAIN_HOST = 'admin.alvaradobitservice.com'

const router = useRouter()
const submissions = ref([])
const loading = ref(true)
const error = ref(null)
const currentSection = ref('submissions')
const isSidenavOpen = ref(false)
const publicSiteHref = computed(() => {
  if (typeof window === 'undefined') {
    return SITE_URL
  }

  return window.location.hostname === ADMIN_SUBDOMAIN_HOST ? SITE_URL : '/'
})

// Fetch submissions
const fetchSubmissions = async () => {
  loading.value = true
  try {
    const { data, error: fetchError } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    submissions.value = data
  } catch (err) {
    error.value = 'Error fetching submissions'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Handle logout
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push({ name: 'login' })
}

// Toggle sidenav for mobile
const toggleSidenav = () => {
  isSidenavOpen.value = !isSidenavOpen.value
}

// Close sidenav when changing sections (mobile)
const handleSectionChange = section => {
  currentSection.value = section
  isSidenavOpen.value = false
}

onMounted(() => {
  fetchSubmissions()
})
</script>

<template>
  <main class="admin">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="menu-toggle" @click="toggleSidenav">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="menu-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <h1 class="mobile-title">
        {{
          currentSection === 'submissions'
            ? 'Contact Submissions'
            : currentSection === 'inventory'
              ? 'Drill Bit Inventory'
              : 'Featured Content'
        }}
      </h1>
    </header>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidenavOpen"
      class="sidenav-overlay"
      @click="toggleSidenav"
    ></div>

    <!-- Side Navigation -->
    <aside :class="['sidenav', { 'is-open': isSidenavOpen }]">
      <div class="sidenav-header">
        <img
          src="@/assets/abs-logo.webp"
          alt="Alvarado Bit Service logo"
          class="sidenav-logo"
        />
        <h2>Admin Dashboard</h2>
      </div>

      <nav class="sidenav-menu">
        <button
          @click="handleSectionChange('submissions')"
          :class="['nav-item', { active: currentSection === 'submissions' }]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Contact Submissions</span>
        </button>

        <button
          @click="handleSectionChange('featured')"
          :class="['nav-item', { active: currentSection === 'featured' }]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Featured Content</span>
        </button>

        <button
          @click="handleSectionChange('inventory')"
          :class="['nav-item', { active: currentSection === 'inventory' }]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span>Drill Bit Inventory</span>
        </button>
      </nav>

      <div class="sidenav-footer">
        <div class="footer-buttons">
          <a :href="publicSiteHref" class="home-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Back to Home</span>
          </a>

          <button @click="handleLogout" class="logout-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <header class="content-header desktop-only">
        <h1>
          {{
            currentSection === 'submissions'
              ? 'Contact Submissions'
              : currentSection === 'inventory'
                ? 'Drill Bit Inventory'
                : 'Featured Content'
          }}
        </h1>
      </header>

      <!-- Dynamic Content -->
      <div class="content-body">
        <ContactSubmissions
          v-if="currentSection === 'submissions'"
          :submissions="submissions"
          :loading="loading"
          @refresh-data="fetchSubmissions"
        />
        <ManageDrillBitInventory v-if="currentSection === 'inventory'" />
        <ManageFeatured v-if="currentSection === 'featured'" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  display: flex;
  background: #f3f6fb;
}

/* Keep the display face for headings; controls need a cleaner working UI typeface. */
.admin :deep(button),
.admin :deep(input),
.admin :deep(select),
.admin :deep(textarea) {
  font-family: var(--font-secondary);
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4.5rem;
  background: rgba(255, 255, 255, 0.96);
  padding: 0 1.25rem;
  z-index: 40;
  border-bottom: 1px solid #dce3ef;
  box-shadow: 0 0.25rem 1rem rgba(21, 38, 77, 0.06);
  align-items: center;
}

.menu-toggle {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #edf2fb;
  border: 1px solid #dce5f5;
  border-radius: 0.6rem;
  padding: 0;
  cursor: pointer;
  color: var(--navy-blue);
}

.menu-icon {
  width: 24px;
  height: 24px;
}

.mobile-title {
  margin-left: 0.85rem;
  font-size: 1.05rem;
  color: var(--navy-blue);
}

/* Sidenav */
.sidenav {
  width: 17.5rem;
  background: linear-gradient(165deg, #182b59 0%, #101c3d 72%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 50;
  transition: transform 0.3s ease;
}

.sidenav-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 45;
}

.sidenav-header {
  padding: 1.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidenav-logo {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.22);
}

.sidenav-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
}

.sidenav-menu {
  flex: 1;
  padding: 1.5rem 0.9rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: none;
  border-radius: 0.65rem;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item:hover:not(.active) {
  transform: translateX(0.2rem);
}

.nav-item.active {
  background: linear-gradient(135deg, #c02a3d, #9f1f31);
  color: white;
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.18);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidenav-footer {
  padding: 1.25rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.65rem;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  font-size: 1rem;
  text-decoration: none;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(0.2rem);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.65rem;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  font-size: 1rem;
  font-family: var(--font-primary);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(0.2rem);
}

@media (prefers-reduced-motion: reduce) {
  .admin :deep(*),
  .admin :deep(*::before),
  .admin :deep(*::after) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 17.5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-header {
  background: rgba(255, 255, 255, 0.94);
  padding: 1.5rem clamp(1.25rem, 3vw, 2.5rem);
  border-bottom: 1px solid #dce3ef;
}

.content-header h1 {
  color: var(--navy-blue);
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 700;
}

.content-body {
  flex: 1;
  background: #f3f6fb;
}

@media (max-width: 960px) {
  .mobile-header {
    display: flex;
  }

  .desktop-only {
    display: none;
  }

  .sidenav {
    transform: translateX(-100%);
  }

  .sidenav.is-open {
    transform: translateX(0);
  }

  .sidenav-overlay {
    display: block;
    background: rgba(10, 21, 48, 0.48);
  }

  .main-content {
    margin-left: 0;
    padding-top: 4.5rem;
  }
}
</style>
