<script setup>
import { computed } from 'vue'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps({
  currentTab: { type: String, required: true },
  search: { type: String, required: true },
  unitSearch: { type: String, required: true },
  status: { type: String, required: true },
  statuses: { type: Array, default: () => [] },
  attentionOnly: { type: Boolean, default: false },
})
const emit = defineEmits([
  'update:search',
  'update:unit-search',
  'update:status',
  'update:attention-only',
])
const label = value =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())

const statusOptions = computed(() => [
  { value: 'all', label: 'All inventory statuses' },
  ...props.statuses.map(value => ({ value, label: label(value) })),
])
</script>

<template>
  <div
    class="flex flex-row gap-3 rounded-toolbar border border-admin-border bg-admin-panel p-3 shadow-toolbar max-[640px]:flex-col"
  >
    <BaseInput
      v-if="currentTab === 'models'"
      :model-value="search"
      type="search"
      placeholder="Search model, size, IADC, connection, SKU, or product line"
      class="flex-1"
      aria-label="Search drill-bit models"
      @update:model-value="emit('update:search', $event)"
    /><BaseInput
      v-else
      :model-value="unitSearch"
      type="search"
      placeholder="Search asset tag, model, location, or notes"
      class="flex-1"
      aria-label="Search physical inventory"
      @update:model-value="emit('update:unit-search', $event)"
    /><BaseDropdown
      :model-value="status"
      :options="statusOptions"
      class="w-[15rem] max-[640px]:w-full"
      aria-label="Filter by inventory status"
      @update:model-value="emit('update:status', $event)"
    />
    <button
      v-if="currentTab === 'inventory'"
      :class="[
        'min-h-control cursor-pointer whitespace-nowrap rounded-control border border-admin-border-strong bg-admin-panel-soft px-filter-inline py-filter-block font-secondary text-[0.78rem] font-bold leading-[normal] text-admin-subtle transition-[background-color,border-color,color,box-shadow] duration-interaction focus-visible:outline-none focus-visible:shadow-focus-strong motion-reduce:transition-none',
        attentionOnly &&
          'border-admin-warning-border bg-admin-warning-soft text-admin-warning-strong',
      ]"
      type="button"
      :aria-pressed="attentionOnly"
      @click="emit('update:attention-only', !attentionOnly)"
    >
      Needs attention
    </button>
  </div>
</template>
