<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Boxes, House, Image, LogOut, Mail, Menu } from '@lucide/vue'
import { supabase } from '@/lib/supabaseClient'
import { SITE_URL } from '@/lib/seo'
import ContactSubmissions from '@/components/admin/contact-submissions/ContactSubmissions.vue'
import ManageDrillBitInventory from '@/components/admin/inventory/ManageDrillBitInventory.vue'
import ManageFeatured from '@/components/admin/featured/ManageFeatured.vue'
import AdminNavItem from '@/components/ui/AdminNavItem.vue'

const ADMIN_SUBDOMAIN_HOST = 'admin.alvaradobitservice.com'

const router = useRouter()
const submissions = ref([])
const loading = ref(true)
const error = ref(null)
const currentSection = ref('submissions')
const isSidenavOpen = ref(false)
const publicSiteHref = computed(() => {
  if (typeof window === 'undefined') return SITE_URL

  return window.location.hostname === ADMIN_SUBDOMAIN_HOST ? SITE_URL : '/'
})

const currentTitle = computed(() => {
  if (currentSection.value === 'submissions') return 'Contact Submissions'
  if (currentSection.value === 'inventory') return 'Drill Bit Inventory'
  return 'Featured Content'
})

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

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push({ name: 'login' })
}

const toggleSidenav = () => {
  isSidenavOpen.value = !isSidenavOpen.value
}

const handleSectionChange = section => {
  currentSection.value = section
  isSidenavOpen.value = false
}

onMounted(() => {
  fetchSubmissions()
})
</script>

<template>
  <main
    class="flex min-h-screen bg-[#f3f6fb] [&_button]:font-secondary [&_input]:font-secondary [&_select]:font-secondary [&_textarea]:font-secondary motion-reduce:[&_*]:!animate-none motion-reduce:[&_*]:![animation-iteration-count:1] motion-reduce:[&_*]:!scroll-auto"
  >
    <header
      class="fixed inset-x-0 top-0 z-40 hidden h-[4.5rem] items-center border-b border-admin-border bg-white/[0.96] px-5 shadow-[0_0.25rem_1rem_rgba(21,38,77,0.06)] max-[960px]:flex"
    >
      <button
        class="grid size-10 cursor-pointer place-items-center rounded-button border border-[#dce5f5] bg-admin-marker p-0 text-[var(--navy-blue)]"
        type="button"
        aria-label="Toggle navigation"
        @click="toggleSidenav"
      >
        <Menu :size="24" aria-hidden="true" />
      </button>
      <h1 class="ml-[0.85rem] text-[1.05rem] text-[var(--navy-blue)]">{{ currentTitle }}</h1>
    </header>

    <div
      v-if="isSidenavOpen"
      class="fixed inset-0 z-[45] bg-[rgba(10,21,48,0.48)]"
      @click="toggleSidenav"
    ></div>

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex h-screen w-[17.5rem] flex-col bg-[linear-gradient(165deg,#182b59_0%,#101c3d_72%)] text-white transition-transform duration-300 ease-in-out max-[960px]:-translate-x-full',
        { 'max-[960px]:translate-x-0': isSidenavOpen },
      ]"
    >
      <div class="flex items-center gap-4 border-b border-white/10 px-6 py-7">
        <img
          src="@/assets/abs-logo.webp"
          alt="Alvarado Bit Service logo"
          class="size-11 rounded-full border-2 border-white/[0.22]"
        />
        <h2 class="text-[1.1rem] font-bold">Admin Dashboard</h2>
      </div>

      <nav class="flex-1 px-[0.9rem] py-6">
        <AdminNavItem
          :active="currentSection === 'submissions'"
          :icon="Mail"
          @click="handleSectionChange('submissions')"
        >
          Contact Submissions
        </AdminNavItem>
        <AdminNavItem
          :active="currentSection === 'featured'"
          :icon="Image"
          @click="handleSectionChange('featured')"
        >
          Featured Content
        </AdminNavItem>
        <AdminNavItem
          :active="currentSection === 'inventory'"
          :icon="Boxes"
          @click="handleSectionChange('inventory')"
        >
          Drill Bit Inventory
        </AdminNavItem>
      </nav>

      <div class="border-t border-white/10 px-6 pb-6 pt-5">
        <div class="flex flex-col gap-3">
          <AdminNavItem :href="publicSiteHref" :icon="House" variant="footer">
            Back to Home
          </AdminNavItem>
          <AdminNavItem :icon="LogOut" variant="footer" @click="handleLogout">
            Logout
          </AdminNavItem>
        </div>
      </div>
    </aside>

    <div class="ml-[17.5rem] flex min-h-screen flex-1 flex-col max-[960px]:ml-0 max-[960px]:pt-[4.5rem]">
      <header class="border-b border-admin-border bg-white/[0.94] px-[clamp(1.25rem,3vw,2.5rem)] py-6 max-[960px]:hidden">
        <h1 class="text-[clamp(1.35rem,2vw,1.75rem)] font-bold text-[var(--navy-blue)]">
          {{ currentTitle }}
        </h1>
      </header>

      <div class="flex-1 bg-[#f3f6fb]">
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
