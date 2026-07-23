<script setup>
import { ref, watch } from 'vue'
import BadgeDropdown from '@/components/ui/BadgeDropdown.vue'

const props = defineProps({
  submission: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
  statusBadgeClasses: { type: Object, required: true },
})

const emit = defineEmits(['status-change'])

const selectedStatus = ref(props.submission.status)
watch(
  () => props.submission.status,
  status => {
    selectedStatus.value = status
  },
)
const formatDate = dateString => new Date(dateString).toLocaleString()
const handleStatusChange = event =>
  emit('status-change', props.submission.id, event.target.value)
</script>

<template>
  <article
    class="rounded-[0.85rem] border border-[#dce3ef] border-l-[0.3rem] [border-left-color:#c6d3e8] bg-white p-[clamp(1rem,2.5vw,1.5rem)] shadow-[0_0.5rem_1.5rem_rgba(25,42,78,0.05)] transition-[border-color,box-shadow,transform] duration-[220ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[0.15rem] hover:border-[#c6d3e8] hover:[border-left-color:#1b2b52] hover:shadow-[0_0.9rem_1.8rem_rgba(25,42,78,0.1)] max-[960px]:p-4"
  >
    <div
      class="mb-4 flex items-start justify-between max-[600px]:flex-col max-[600px]:gap-2"
    >
      <div
        class="flex items-center gap-4 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-2"
      >
        <h3 class="text-[1.1rem] font-bold text-brand-navy">
          {{ submission.name }}
        </h3>
        <BadgeDropdown
          v-model="selectedStatus"
          :options="statusOptions"
          :badge-classes="statusBadgeClasses"
          class="max-[600px]:w-full"
          @change="handleStatusChange"
        />
      </div>
      <span
        class="whitespace-nowrap text-[0.8rem] text-brand-steel max-[600px]:text-sm"
        >{{ formatDate(submission.created_at) }}</span
      >
    </div>

    <div class="grid gap-[0.65rem] text-brand-steel">
      <p><strong>Email:</strong> {{ submission.email }}</p>
      <p v-if="submission.phone">
        <strong>Phone:</strong> {{ submission.phone }}
      </p>
      <p
        class="mt-[0.35rem] whitespace-pre-line rounded-[0.6rem] border border-[#e2e9f5] bg-[#f5f8fd] px-4 py-[0.85rem]"
      >
        <strong>Message:</strong> {{ submission.message }}
      </p>
    </div>
  </article>
</template>
