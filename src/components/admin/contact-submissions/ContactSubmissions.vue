<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import ContactSubmissionCard from './ContactSubmissionCard.vue'

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
const statusDropdownOptions = Object.entries(statusOptions).map(
  ([value, label]) => ({ value, label }),
)
const statusFilterOptions = [
  { value: 'all', label: 'All' },
  ...statusDropdownOptions,
]
const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
]
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'a-z', label: 'Name A-Z' },
  { value: 'z-a', label: 'Name Z-A' },
]
const statusBadgeClasses = {
  new: 'border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca]',
  in_progress: 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]',
  completed: 'border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]',
  archived: 'border-[#d1d5db] bg-[#f3f4f6] text-[#4b5563]',
}
const statusOptionClasses = {
  new: 'bg-[#eef2ff] text-[#4338ca] font-bold',
  in_progress: 'bg-[#fff7ed] text-[#c2410c] font-bold',
  completed: 'bg-[#ecfdf5] text-[#047857] font-bold',
  archived: 'bg-[#f3f4f6] text-[#4b5563] font-bold',
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

const emit = defineEmits(['refresh-data'])
</script>

<template>
  <div class="h-full p-[clamp(1rem,2.5vw,2rem)] max-[960px]:p-4">
    <!-- Filters and Search -->
    <div
      class="mb-6 rounded-2xl border border-[#dce3ef] bg-white p-[clamp(1rem,2.5vw,1.75rem)] shadow-[0_0.75rem_2rem_rgba(25,42,78,0.06)] max-[960px]:p-4"
    >
      <div
        class="grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(14rem,1.35fr)] gap-4 max-[960px]:grid-cols-2 max-[600px]:grid-cols-1"
      >
        <div class="flex flex-col gap-2">
          <label
            for="status"
            class="text-xs font-bold uppercase tracking-[0.06em] text-brand-navy"
            >Status</label
          >
          <BaseDropdown
            id="status"
            v-model="statusFilter"
            :options="statusFilterOptions"
            :option-classes="statusOptionClasses"
            full-width
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="date"
            class="text-xs font-bold uppercase tracking-[0.06em] text-brand-navy"
            >Date Range</label
          >
          <BaseDropdown
            id="date"
            v-model="dateRange"
            :options="dateRangeOptions"
            full-width
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="sort"
            class="text-xs font-bold uppercase tracking-[0.06em] text-brand-navy"
            >Sort By</label
          >
          <BaseDropdown
            id="sort"
            v-model="sortBy"
            :options="sortOptions"
            full-width
          />
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="search"
            class="text-xs font-bold uppercase tracking-[0.06em] text-brand-navy"
            >Search</label
          >
          <BaseInput
            id="search"
            v-model="searchQuery"
            placeholder="Search submissions..."
            full-width
          />
        </div>
      </div>
    </div>

    <!-- Submissions List -->
    <div
      v-if="loading"
      class="rounded-[0.85rem] border border-dashed border-[#c5d1e5] bg-white p-8 text-center shadow-[0_0.5rem_1.5rem_rgba(25,42,78,0.04)]"
    >
      Loading submissions...
    </div>

    <div
      v-else-if="filteredAndSortedSubmissions.length === 0"
      class="rounded-[0.85rem] border border-dashed border-[#c5d1e5] bg-white p-8 text-center shadow-[0_0.5rem_1.5rem_rgba(25,42,78,0.04)]"
    >
      No submissions found
    </div>

    <div v-else class="grid gap-4">
      <ContactSubmissionCard
        v-for="submission in filteredAndSortedSubmissions"
        :key="submission.id"
        :submission="submission"
        :status-options="statusDropdownOptions"
        :status-badge-classes="statusBadgeClasses"
        @status-change="updateStatus"
      />
    </div>
  </div>
</template>
