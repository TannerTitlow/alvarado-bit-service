<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const props = defineProps({
  submissions: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
})

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

// Update submission status
const updateStatus = async (submissionId, newStatus) => {
  try {
    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({ status: newStatus })
      .eq('id', submissionId)

    if (updateError) throw updateError

    // Emit event to parent to refresh data
    emit('refresh-data')
  } catch (err) {
    console.error('Error updating status:', err)
    alert('Error updating status')
  }
}

// Filter and sort logic
const filteredAndSortedSubmissions = computed(() => {
  let filtered = [...props.submissions]

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(s => s.status === statusFilter.value)
  } else {
    filtered = filtered.filter(s => s.status !== 'archived')
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

// Format date
const formatDate = dateString => {
  return new Date(dateString).toLocaleString()
}

const emit = defineEmits(['refresh-data'])
</script>

<template>
  <div class="contact-submissions">
    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="filter-group">
          <label for="status">Status</label>
          <select id="status" v-model="statusFilter" class="filter-select">
            <option value="all">All</option>
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
</template>

<style scoped>
.contact-submissions {
  height: 100%;
  padding: clamp(1rem, 2.5vw, 2rem);
}

.filters-section {
  background: white;
  padding: clamp(1rem, 2.5vw, 1.75rem);
  border: 1px solid #dce3ef;
  border-radius: 1rem;
  box-shadow: 0 0.75rem 2rem rgba(25, 42, 78, 0.06);
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(14rem, 1.35fr);
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--navy-blue);
}

.filter-select,
.search-input {
  min-height: 2.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid #ccd7ea;
  border-radius: 0.6rem;
  background: #fbfcff;
  font-size: var(--text-base);
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.filter-select:focus,
.search-input:focus {
  border-color: #8fa7d1;
  background: white;
  box-shadow: 0 0 0 0.2rem rgba(27, 43, 82, 0.1);
  outline: none;
}

.submissions-list {
  display: grid;
  gap: 1rem;
}

.submission-card {
  background: white;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  border: 1px solid #dce3ef;
  border-left: 0.3rem solid var(--navy-blue);
  border-radius: 0.85rem;
  box-shadow: 0 0.5rem 1.5rem rgba(25, 42, 78, 0.05);
  transition: border-color 180ms ease, box-shadow 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.submission-card:hover {
  border-color: #c6d3e8;
  box-shadow: 0 0.9rem 1.8rem rgba(25, 42, 78, 0.1);
  transform: translateY(-0.15rem);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.submission-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.submission-title h3 {
  color: var(--navy-blue);
  font-size: 1.1rem;
  font-weight: 700;
}

.date {
  color: var(--steel-gray);
  font-size: 0.8rem;
  white-space: nowrap;
}

.submission-details {
  display: grid;
  gap: 0.65rem;
}

.submission-details p {
  color: var(--steel-gray);
}

.submission-details .message {
  margin-top: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: 0.6rem;
  background: #f5f8fd;
  border: 1px solid #e2e9f5;
  white-space: pre-line;
}

.status-select {
  min-height: 2rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1px solid #ccd7ea;
  cursor: pointer;
  transition: box-shadow 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.status-select:hover {
  box-shadow: 0 0.2rem 0.5rem rgba(25, 42, 78, 0.12);
  transform: translateY(-0.05rem);
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
.no-submissions {
  text-align: center;
  padding: 2rem;
  background: white;
  border: 1px dashed #c5d1e5;
  border-radius: 0.85rem;
  box-shadow: 0 0.5rem 1.5rem rgba(25, 42, 78, 0.04);
}

@media (max-width: 960px) {
  .contact-submissions {
    padding: 1rem;
  }

  .filters-section {
    padding: 1rem;
  }

  .filters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .submission-card {
    padding: 1rem;
  }

}

@media (max-width: 600px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .submission-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .submission-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .status-select {
    width: 100%;
  }

  .date {
    font-size: 0.875rem;
  }
}
</style>
