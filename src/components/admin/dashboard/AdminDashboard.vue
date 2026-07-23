<script setup>
import { computed } from 'vue'
import { Boxes, Image, ImagePlus, Mail, MailPlus } from '@lucide/vue'
import { useDashboard } from '@/composables/useDashboard'
import DashboardMetricCard from './DashboardMetricCard.vue'
import DashboardLeadQueue from './DashboardLeadQueue.vue'
import DashboardInventoryAlerts from './DashboardInventoryAlerts.vue'

const emit = defineEmits(['navigate'])
const { submissions, loading, errorMessage, updatingId, attentionUnits, lowStockModels, metrics, startLead } =
  useDashboard()

const metricCards = computed(() => [
  {
    label: 'New leads',
    icon: Mail,
    value: metrics.value.newLeadCount,
    detail: 'awaiting first response',
    tone: 'attention',
  },
  {
    label: 'Available units',
    icon: Boxes,
    value: metrics.value.availableUnitCount,
    detail: 'ready to sell or allocate',
    tone: 'success',
  },
  {
    label: 'Needs attention',
    icon: Boxes,
    value: metrics.value.attentionCount,
    detail: 'condition, repair, or location issue',
    tone: 'attention',
  },
  {
    label: 'Homepage carousel',
    icon: Image,
    value: metrics.value.carouselItemCount,
    detail: metrics.value.carouselDetail,
    tone: metrics.value.carouselNeedsAttention ? 'attention' : 'default',
  },
])
</script>

<template>
  <section class="p-4 min-[961px]:p-[clamp(1rem,2.5vw,2rem)]">
    <header
      class="flex items-start justify-between gap-6 rounded-panel border border-admin-border bg-workspace-header p-[clamp(1.25rem,3vw,2rem)] shadow-panel max-[640px]:flex-col max-[640px]:items-stretch"
    >
      <div>
        <p
          class="m-0 font-secondary text-xs font-bold uppercase tracking-[0.11em] text-admin-eyebrow"
        >
          Operations overview
        </p>
        <h2 class="mb-0 mt-1 text-[clamp(1.5rem,2.6vw,2rem)] text-brand-navy">
          Good to see you
        </h2>
        <p class="mb-0 mt-2 text-admin-muted">
          Prioritize new leads, inventory exceptions, and homepage updates from
          one place.
        </p>
      </div>
    </header>

    <p
      v-if="errorMessage"
      class="mt-5 rounded-control bg-admin-danger-soft px-4 py-3 text-admin-danger"
    >
      {{ errorMessage }}
    </p>
    <div
      v-if="loading"
      class="mt-5 rounded-panel border border-dashed border-admin-border bg-admin-panel p-10 text-center text-admin-muted"
    >
      Loading dashboard...
    </div>
    <template v-else>
      <div
        class="mt-5 grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1"
      >
        <DashboardMetricCard
          v-for="metric in metricCards"
          :key="metric.label"
          v-bind="metric"
        />
      </div>
      <div class="mt-5 grid grid-cols-2 gap-5 max-[960px]:grid-cols-1">
        <DashboardLeadQueue
          :submissions="submissions"
          :updating-id="updatingId"
          @open-submissions="emit('navigate', 'submissions')"
          @start-lead="startLead"
        />
        <DashboardInventoryAlerts
          :attention-units="attentionUnits"
          :low-stock-models="lowStockModels"
          @open-inventory="emit('navigate', 'inventory')"
        />
      </div>
      <section
        class="mt-5 rounded-panel border border-admin-border bg-admin-panel p-5 shadow-toolbar"
      >
        <p
          class="m-0 font-secondary text-xs font-bold uppercase tracking-[0.1em] text-admin-eyebrow"
        >
          Quick actions
        </p>
        <div class="mt-4 grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
          <button
            class="flex cursor-pointer items-center gap-3 rounded-control border border-admin-border bg-white px-4 py-4 text-left text-admin-ink transition-colors hover:bg-admin-marker"
            type="button"
            @click="emit('navigate', 'submissions')"
          >
            <MailPlus :size="20" class="text-brand-red" /><span
              ><strong class="block">Review lead inbox</strong
              ><small class="text-admin-muted"
                >Follow up on customer requests</small
              ></span
            >
          </button>
          <button
            class="flex cursor-pointer items-center gap-3 rounded-control border border-admin-border bg-white px-4 py-4 text-left text-admin-ink transition-colors hover:bg-admin-marker"
            type="button"
            @click="emit('navigate', 'inventory')"
          >
            <Boxes :size="20" class="text-brand-red" /><span
              ><strong class="block">Manage inventory</strong
              ><small class="text-admin-muted"
                >Resolve exceptions or update stock</small
              ></span
            >
          </button>
          <button
            class="flex cursor-pointer items-center gap-3 rounded-control border border-admin-border bg-white px-4 py-4 text-left text-admin-ink transition-colors hover:bg-admin-marker"
            type="button"
            @click="emit('navigate', 'featured')"
          >
            <ImagePlus :size="20" class="text-brand-red" /><span
              ><strong class="block">Update homepage media</strong
              ><small class="text-admin-muted"
                >Add or reorder carousel items</small
              ></span
            >
          </button>
        </div>
      </section>
    </template>
  </section>
</template>
