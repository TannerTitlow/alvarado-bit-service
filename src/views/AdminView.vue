<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import ContactSubmissions from '@/components/ContactSubmissions.vue'
import ManageProducts from '@/components/ManageProducts.vue'
import ManageFeatured from '@/components/ManageFeatured.vue'

const router = useRouter()
const submissions = ref([])
const loading = ref(true)
const error = ref(null)
const currentSection = ref('submissions')
const isSidenavOpen = ref(false)

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
  router.push('/admin/login')
}

// Toggle sidenav for mobile
const toggleSidenav = () => {
  isSidenavOpen.value = !isSidenavOpen.value
}

// Close sidenav when changing sections (mobile)
const handleSectionChange = (section) => {
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
          currentSection === 'submissions' ? 'Contact Submissions' :
          currentSection === 'products' ? 'Manage Products' :
          'Featured Content'
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
        <img src="@/assets/abs-logo.png" alt="ABS Logo" class="sidenav-logo" />
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
          @click="handleSectionChange('products')"
          :class="['nav-item', { active: currentSection === 'products' }]"
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
          <span>Manage Products</span>
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
      </nav>

      <div class="sidenav-footer">
        <div class="footer-buttons">
          <RouterLink to="/" class="home-btn">
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
          </RouterLink>

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
            currentSection === 'submissions' ? 'Contact Submissions' :
            currentSection === 'products' ? 'Manage Products' :
            'Featured Content'
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
        <ManageProducts
          v-if="currentSection === 'products'"
        />
        <ManageFeatured
          v-if="currentSection === 'featured'"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  display: flex;
  background-color: #f5f5f5;
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  padding: 0 1rem;
  z-index: 40;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.menu-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--navy-blue);
}

.menu-icon {
  width: 24px;
  height: 24px;
}

.mobile-title {
  margin-left: 1rem;
  font-size: 1.25rem;
  color: var(--navy-blue);
}

/* Sidenav */
.sidenav {
  width: 280px;
  background: var(--navy-blue);
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
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidenav-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.sidenav-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.sidenav-menu {
  flex: 1;
  padding: 1.5rem 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  text-align: left;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: var(--patriot-red);
  color: white;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidenav-footer {
  padding: 1.5rem;
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
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  text-decoration: none;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
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
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  font-family: var(--font-primary);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-header {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
}

.content-header h1 {
  color: var(--navy-blue);
  font-size: 1.5rem;
  font-weight: 600;
}

.content-body {
  flex: 1;
  background: #f5f5f5;
}

@media (max-width: 768px) {
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
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .sidenav-overlay:has(+ .sidenav.is-open) {
    opacity: 1;
    pointer-events: auto;
  }

  .main-content {
    margin-left: 0;
    padding-top: 60px;
  }
}
</style>
