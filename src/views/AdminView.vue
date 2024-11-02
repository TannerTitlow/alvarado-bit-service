<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const submissions = ref([])
const loading = ref(true)
const error = ref(null)

// Filter and sort states
const statusFilter = ref('all')
const dateRange = ref('all')
const searchQuery = ref('')
const sortBy = ref('newest')

// Status options
const statusOptions = {
  new: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
}

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

// Update submission status
const updateStatus = async (submissionId, newStatus) => {
  try {
    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({ status: newStatus })
      .eq('id', submissionId)

    if (updateError) throw updateError

    // Update local state
    const submission = submissions.value.find(s => s.id === submissionId)
    if (submission) {
      submission.status = newStatus
    }
  } catch (err) {
    console.error('Error updating status:', err)
    alert('Error updating status')
  }
}

// Filter and sort logic
const filteredAndSortedSubmissions = computed(() => {
  let filtered = [...submissions.value]

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(s => s.status === statusFilter.value)
  }

  // Date range filter
  const now = new Date()
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

  switch (dateRange.value) {
    case '7days':
      filtered = filtered.filter(s => new Date(s.created_at) >= sevenDaysAgo)
      break
    case '30days':
      filtered = filtered.filter(s => new Date(s.created_at) >= thirtyDaysAgo)
      break
  }

  // Search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.message.toLowerCase().includes(query),
    )
  }

  // Sorting
  switch (sortBy.value) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'a-z':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'z-a':
      filtered.sort((a, b) => b.name.localeCompare(a.name))
      break
    default: // 'newest'
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return filtered
})

// Handle logout
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/admin/login')
}

// Format date
const formatDate = dateString => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchSubmissions()
})
</script>

<template>
  <main class="admin">
    <div class="admin-header">
      <div class="container">
        <div class="header-content">
          <h1>Contact Form Submissions</h1>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label for="status">Status</label>
            <select id="status" v-model="statusFilter" class="filter-select">
              <option value="all">All Status</option>
              <option
                v-for="(label, value) in statusOptions"
                :key="value"
                :value="value"
              >
                {{ label }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="date">Date Range</label>
            <select id="date" v-model="dateRange" class="filter-select">
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sort">Sort By</label>
            <select id="sort" v-model="sortBy" class="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">Name A-Z</option>
              <option value="z-a">Name Z-A</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="search">Search</label>
            <input
              type="text"
              id="search"
              v-model="searchQuery"
              placeholder="Search submissions..."
              class="search-input"
            />
          </div>
        </div>
      </div>

      <!-- Submissions List -->
      <div v-if="loading" class="loading">Loading submissions...</div>

      <div v-else-if="error" class="error-message">{{ error }}</div>

      <div
        v-else-if="filteredAndSortedSubmissions.length === 0"
        class="no-submissions"
      >
        No submissions found
      </div>

      <div v-else class="submissions-list">
        <div
          v-for="submission in filteredAndSortedSubmissions"
          :key="submission.id"
          class="submission-card"
        >
          <div class="submission-header">
            <div class="submission-title">
              <h3>{{ submission.name }}</h3>
              <select
                v-model="submission.status"
                @change="updateStatus(submission.id, submission.status)"
                :class="['status-select', submission.status]"
              >
                <option
                  v-for="(label, value) in statusOptions"
                  :key="value"
                  :value="value"
                >
                  {{ label }}
                </option>
              </select>
            </div>
            <span class="date">{{ formatDate(submission.created_at) }}</span>
          </div>

          <div class="submission-details">
            <p><strong>Email:</strong> {{ submission.email }}</p>
            <p v-if="submission.phone">
              <strong>Phone:</strong> {{ submission.phone }}
            </p>
            <p class="message">
              <strong>Message:</strong> {{ submission.message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin {
  padding-top: 64px;
  padding-bottom: 2rem;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-header {
  background: white;
  padding: 1.5rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  color: var(--navy-blue);
  font-size: var(--text-2xl);
}

.logout-btn {
  background: var(--patriot-red);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: #8b1a28;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  color: var(--navy-blue);
}

.filter-select,
.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  font-size: var(--text-base);
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: var(--navy-blue);
}

.submissions-list {
  display: grid;
  gap: 1.5rem;
}

.submission-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.submission-header h3 {
  color: var(--navy-blue);
  font-size: var(--text-lg);
  font-weight: var(--fw-semibold);
}

.date {
  color: var(--steel-gray);
  font-size: var(--text-sm);
}

.submission-details {
  display: grid;
  gap: 0.5rem;
}

.submission-details p {
  color: var(--steel-gray);
}

.submission-details .message {
  margin-top: 0.5rem;
  white-space: pre-line;
}

.submission-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: var(--text-sm);
  border: 1px solid #ddd;
}

.status-select.new {
  background-color: #eef2ff;
  border-color: #c7d2fe;
  color: #4338ca;
}

.status-select.in_progress {
  background-color: #fff7ed;
  border-color: #fed7aa;
  color: #c2410c;
}

.status-select.completed {
  background-color: #ecfdf5;
  border-color: #a7f3d0;
  color: #047857;
}

.status-select.archived {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #4b5563;
}

.loading,
.error-message,
.no-submissions {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #b91c1c;
}

@media (max-width: 768px) {
  .admin {
    padding-top: 109px;
  }

  .admin-header {
    padding: 1rem 0;
  }

  .header-content h1 {
    font-size: var(--text-xl);
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .submission-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
