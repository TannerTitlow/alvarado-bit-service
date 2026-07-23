<script setup>
import { computed } from 'vue'
import { MapPin, MapPinOff, SquarePen } from '@lucide/vue'

const props = defineProps({
  unit: { type: Object, required: true },
  model: { type: Object, default: null },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'update:selected'])
const label = value =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
const specifications = computed(() =>
  [
    props.model?.iadc_code && `IADC ${props.model.iadc_code}`,
    props.model?.connection,
  ].filter(Boolean),
)
const statusStyles = {
  available: {
    row: 'shadow-status-available',
    badge: 'bg-admin-success-soft text-admin-success',
  },
  reserved: {
    row: 'shadow-status-reserved',
    badge: 'bg-admin-warning-soft text-admin-warning',
  },
  in_repair: {
    row: 'shadow-status-repair',
    badge: 'bg-admin-repair-soft text-admin-repair',
  },
  sold: {
    row: 'shadow-status-inactive',
    badge: 'bg-admin-neutral-soft text-admin-neutral',
  },
  scrapped: {
    row: 'shadow-status-inactive',
    badge: 'bg-admin-neutral-soft text-admin-neutral',
  },
}
const statusStyle = computed(
  () => statusStyles[props.unit.status] || statusStyles.sold,
)
const conditionClasses = {
  unknown: 'text-admin-warning',
  used: 'text-admin-used',
  remanufactured: 'text-admin-success',
}
const hasLocationException = computed(
  () => !props.unit.location || /inspection/i.test(props.unit.location),
)
const locationIcon = computed(() => (props.unit.location ? MapPin : MapPinOff))
const attention = computed(
  () =>
    props.unit.condition === 'unknown' ||
    props.unit.status === 'in_repair' ||
    hasLocationException.value,
)
const createdAt = computed(() =>
  props.unit.created_at
    ? new Date(props.unit.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Unknown',
)
</script>

<template>
  <tr
    :class="[
      'group transition-[background-color,box-shadow] duration-interaction motion-reduce:transition-none [&>td]:border-t [&>td]:border-admin-border-subtle [&>td]:px-3 [&>td]:py-4 [&>td]:align-middle max-[640px]:relative max-[640px]:block max-[640px]:[&>td]:grid max-[640px]:[&>td]:grid-cols-[minmax(5.5rem,36%)_minmax(0,1fr)] max-[640px]:[&>td]:items-center max-[640px]:[&>td]:gap-[0.7rem] max-[640px]:[&>td]:px-[0.85rem] max-[640px]:[&>td]:py-3 max-[640px]:[&>td::before]:font-secondary max-[640px]:[&>td::before]:text-[0.68rem] max-[640px]:[&>td::before]:font-bold max-[640px]:[&>td::before]:uppercase max-[640px]:[&>td::before]:tracking-[0.06em] max-[640px]:[&>td::before]:text-admin-muted max-[640px]:[&>td::before]:content-[attr(data-label)]',
      statusStyle.row,
      selected ? 'bg-admin-panel-selected' : 'hover:bg-admin-panel-soft',
    ]"
  >
    <td
      class="w-10 text-center max-[640px]:absolute max-[640px]:right-2 max-[640px]:top-[0.6rem] max-[640px]:block max-[640px]:w-auto max-[640px]:border-0 max-[640px]:p-0 max-[640px]:before:hidden"
      data-label="Select"
    >
      <input
        :checked="selected"
        type="checkbox"
        :aria-label="`Select ${unit.asset_tag || `Unit #${unit.id}`}`"
        class="h-4 w-4 accent-admin-link"
        @change="emit('update:selected', $event.target.checked)"
      />
    </td>
    <td
      class="max-[640px]:bg-admin-panel-muted max-[640px]:py-[0.8rem]"
      data-label="Unit"
    >
      <span
        :title="unit.asset_tag || `Unit #${unit.id}`"
        class="font-mono text-[0.87rem] font-bold text-brand-navy"
        >{{ unit.asset_tag || `Unit #${unit.id}` }}</span
      >
    </td>
    <td
      class="flex min-w-[20rem] items-start gap-[0.6rem] max-[640px]:grid max-[640px]:min-w-0 max-[640px]:grid-cols-[2.3rem_1fr] max-[640px]:before:hidden"
      data-label="Model"
    >
      <template v-if="model">
        <img
          v-if="model.imagePreview"
          :src="model.imagePreview"
          :alt="model.display_name"
          class="h-[2.3rem] w-[2.3rem] shrink-0 rounded-[0.45rem] object-cover"
        />
        <span
          v-else
          class="grid h-[2.3rem] w-[2.3rem] shrink-0 place-content-center rounded-[0.45rem] bg-admin-marker text-center text-[0.68rem] font-extrabold leading-none text-admin-link"
          >{{ model.nominal_size
          }}<small class="mt-[0.14rem] text-[0.5rem] font-bold">in</small></span
        >
        <span class="min-w-0 max-[640px]:col-start-2">
          <span class="flex items-center gap-[0.4rem] text-brand-navy"
            ><strong :title="model.display_name">{{
              model.display_name
            }}</strong
            ><b
              v-if="model.circulation_type === 'reverse_circulation'"
              class="rounded-[0.25rem] bg-admin-danger-tag px-[0.34rem] py-[0.13rem] text-[0.64rem] text-admin-danger"
              >RC</b
            ></span
          >
          <span class="mt-[0.28rem] flex flex-wrap gap-1"
            ><small
              v-for="specification in specifications"
              :key="specification"
              class="rounded-[0.25rem] border border-admin-border-tag px-[0.32rem] py-[0.12rem] text-[0.68rem] text-admin-subtle"
              >{{ specification }}</small
            ></span
          >
        </span>
      </template>
      <span v-else class="font-bold text-admin-danger">Model unavailable</span>
    </td>
    <td data-label="Status">
      <span
        :class="[
          'inline-flex items-center gap-[0.32rem] rounded-full px-[0.52rem] py-[0.27rem] text-[0.78rem] font-bold capitalize transition-[background-color,color] duration-interaction motion-reduce:transition-none',
          statusStyle.badge,
        ]"
        ><i class="h-[0.38rem] w-[0.38rem] shrink-0 rounded-full bg-current"></i
        >{{ label(unit.status) }}</span
      >
    </td>
    <td data-label="Condition">
      <span
        :class="[
          'text-[0.78rem] font-bold text-admin-subtle transition-colors duration-interaction motion-reduce:transition-none',
          conditionClasses[unit.condition],
        ]"
        >{{ label(unit.condition) }}</span
      >
    </td>
    <td data-label="Location">
      <span
        :class="[
          'flex items-center gap-[0.35rem]',
          hasLocationException && 'font-bold text-admin-warning',
        ]"
        :title="unit.location || 'Not assigned'"
        ><component
          :is="locationIcon"
          :size="15"
          :class="
            hasLocationException
              ? 'text-admin-status-reserved'
              : 'text-admin-muted'
          "
          aria-hidden="true"
        />{{ unit.location || 'Not assigned' }}</span
      >
    </td>
    <td data-label="Notes">
      <span
        v-if="unit.notes"
        :class="[
          'inline-block max-w-[14rem] truncate text-[0.72rem] italic text-admin-muted',
          attention && 'font-bold text-admin-warning',
        ]"
        :title="unit.notes"
        >{{ unit.notes }}</span
      ><span v-else class="text-[0.75rem] italic text-admin-disabled"
        >None</span
      >
    </td>
    <td class="whitespace-nowrap" data-label="Created">
      <time
        :datetime="unit.created_at"
        :title="createdAt"
        class="block text-[0.74rem] text-admin-subtle"
        >{{ createdAt }}</time
      >
    </td>
    <td class="text-center" data-label="Actions">
      <button
        class="inline-grid h-8 w-8 cursor-pointer place-content-center rounded-[0.4rem] border border-transparent bg-transparent text-admin-link opacity-[0.78] transition-[background-color,border-color,color,opacity] duration-interaction group-hover:border-admin-border-strong group-hover:bg-admin-panel-muted group-hover:opacity-100 focus-visible:border-admin-border-strong focus-visible:bg-admin-panel-muted focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-focus-strong max-[640px]:opacity-100 motion-reduce:transition-none"
        type="button"
        :aria-label="`Edit ${unit.asset_tag || `Unit #${unit.id}`}`"
        :title="`Edit ${unit.asset_tag || `Unit #${unit.id}`}`"
        @click="emit('edit', unit)"
      >
        <SquarePen :size="16" aria-hidden="true" />
      </button>
    </td>
  </tr>
</template>
