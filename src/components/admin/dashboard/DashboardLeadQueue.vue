<script setup>
import { computed } from 'vue'
import { ArrowRight, Clock3, LoaderCircle } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  submissions: { type: Array, required: true },
  updatingId: { type: String, default: null },
})
const emit = defineEmits(['open-submissions', 'start-lead'])

const activeLeads = computed(() =>
  props.submissions
    .filter(submission => ['new', 'in_progress'].includes(submission.status))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(0, 5),
)

const age = createdAt => {
  const hours = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 3_600_000,
  )
  if (hours < 1) return 'Just received'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>

<template>
  <section
    class="rounded-panel border border-admin-border bg-admin-panel p-5 shadow-toolbar"
  >
    <header class="flex items-start justify-between gap-4">
      <div>
        <p
          class="m-0 font-secondary text-xs font-bold uppercase tracking-[0.1em] text-admin-eyebrow"
        >
          Lead queue
        </p>
        <h3 class="mb-0 mt-1 text-xl text-brand-navy">
          Leads needing follow-up
        </h3>
      </div>
      <BaseButton
        variant="secondary"
        class="shrink-0"
        @click="emit('open-submissions')"
        >View all</BaseButton
      >
    </header>

    <div v-if="activeLeads.length" class="mt-4 divide-y divide-admin-border">
      <article
        v-for="lead in activeLeads"
        :key="lead.id"
        class="flex items-center gap-3 py-3 first:pt-0 last:pb-0 max-sm:flex-wrap"
      >
        <div class="min-w-0 flex-1">
          <p class="m-0 truncate font-bold text-admin-ink">{{ lead.name }}</p>
          <p class="m-0 truncate text-sm text-admin-muted">{{ lead.email }}</p>
        </div>
        <span
          :class="[
            'rounded-full px-2 py-1 text-xs font-bold',
            lead.status === 'new'
              ? 'bg-[#eef2ff] text-[#4338ca]'
              : 'bg-[#fff7ed] text-[#c2410c]',
          ]"
          >{{ lead.status === 'new' ? 'New' : 'In progress' }}</span
        >
        <span
          class="flex items-center gap-1 whitespace-nowrap text-xs text-admin-muted"
          ><Clock3 :size="14" />{{ age(lead.created_at) }}</span
        >
        <button
          v-if="lead.status === 'new'"
          class="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-1 text-sm font-bold text-brand-navy"
          type="button"
          :disabled="updatingId === lead.id"
          @click="emit('start-lead', lead.id)"
        >
          <LoaderCircle
            v-if="updatingId === lead.id"
            :size="16"
            class="animate-spin"
          />
          <template v-else>Start <ArrowRight :size="16" /></template>
        </button>
      </article>
    </div>
    <p
      v-else
      class="mb-0 mt-5 rounded-control bg-admin-success-soft px-4 py-3 text-sm text-admin-success"
    >
      No new or in-progress leads. Your queue is clear.
    </p>
  </section>
</template>
