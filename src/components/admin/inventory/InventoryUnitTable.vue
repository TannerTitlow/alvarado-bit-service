<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import InventoryUnitRow from './InventoryUnitRow.vue'

const props = defineProps({
  units: { type: Array, default: () => [] },
  models: { type: Array, default: () => [] },
  statuses: { type: Array, default: () => [] },
  conditions: { type: Array, default: () => [] },
  sortKey: { type: String, required: true },
  sortDirection: { type: String, required: true },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'sort', 'bulk-update'])
const selectedIds = ref([])
const bulkStatus = ref('')
const bulkCondition = ref('')
const bulkLocation = ref('')
const label = value =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
const modelFor = id => props.models.find(model => model.id === id)
const allSelected = computed(
  () =>
    props.units.length > 0 &&
    props.units.every(unit => selectedIds.value.includes(unit.id)),
)
const toggleAll = () => {
  selectedIds.value = allSelected.value ? [] : props.units.map(unit => unit.id)
}
const updateSelection = (id, selected) => {
  selectedIds.value = selected
    ? [...new Set([...selectedIds.value, id])]
    : selectedIds.value.filter(selectedId => selectedId !== id)
}
const bulkPayload = computed(() => {
  const payload = {}
  if (bulkStatus.value) payload.status = bulkStatus.value
  if (bulkCondition.value) payload.condition = bulkCondition.value
  if (bulkLocation.value.trim()) payload.location = bulkLocation.value.trim()
  return payload
})
const hasBulkChanges = computed(() => Object.keys(bulkPayload.value).length > 0)
const applyBulkUpdate = () => {
  if (!selectedIds.value.length || !hasBulkChanges.value) return
  emit('bulk-update', { ids: selectedIds.value, payload: bulkPayload.value })
  selectedIds.value = []
  bulkStatus.value = ''
  bulkCondition.value = ''
  bulkLocation.value = ''
}
const columns = [
  ['unit', 'Unit'],
  ['model', 'Model'],
  ['status', 'Status'],
  ['condition', 'Condition'],
  ['location', 'Location'],
]
const bulkStatusOptions = computed(() => [
  { value: '', label: 'Keep status' },
  ...props.statuses.map(value => ({ value, label: label(value) })),
])
const bulkConditionOptions = computed(() => [
  { value: '', label: 'Keep condition' },
  ...props.conditions.map(value => ({ value, label: label(value) })),
])
const sortIconClasses = key => [
  "relative ml-[0.4rem] h-[0.9rem] w-[0.7rem] shrink-0 text-admin-sort before:absolute before:left-[0.15rem] before:top-[0.05rem] before:h-[0.36rem] before:w-[0.36rem] before:rotate-[225deg] before:border-b-[0.1rem] before:border-r-[0.1rem] before:border-current before:content-[''] before:transition-[opacity,color] before:duration-interaction after:absolute after:bottom-[0.05rem] after:left-[0.15rem] after:h-[0.36rem] after:w-[0.36rem] after:rotate-45 after:border-b-[0.1rem] after:border-r-[0.1rem] after:border-current after:content-[''] after:transition-[opacity,color] after:duration-interaction motion-reduce:before:transition-none motion-reduce:after:transition-none",
  props.sortKey === key && 'text-admin-link',
  props.sortKey === key && props.sortDirection !== 'desc' && 'after:opacity-25',
  props.sortKey === key &&
    props.sortDirection === 'desc' &&
    'before:opacity-25',
]
</script>

<template>
  <div
    class="mt-5 overflow-x-auto rounded-panel border border-admin-border bg-admin-panel shadow-panel max-[640px]:overflow-visible max-[640px]:border-0 max-[640px]:bg-transparent max-[640px]:shadow-none"
  >
    <p v-if="!units.length" class="m-0 px-4 py-10 text-center text-admin-muted">
      No physical units match this search.
    </p>
    <template v-else>
      <Transition
        enter-active-class="grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-expand ease-emphasized motion-reduce:transition-none"
        enter-from-class="grid-rows-[0fr] -translate-y-[0.4rem] opacity-0"
        enter-to-class="grid-rows-[1fr]"
        leave-active-class="grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-expand ease-emphasized motion-reduce:transition-none"
        leave-from-class="grid-rows-[1fr]"
        leave-to-class="grid-rows-[0fr] -translate-y-[0.4rem] opacity-0"
      >
        <div v-if="selectedIds.length" class="grid grid-rows-[1fr]">
          <div class="min-h-0">
            <div
              class="flex items-center gap-[0.6rem] border-b border-admin-border bg-admin-panel-selected px-3 py-button-block max-[640px]:flex-wrap"
            >
              <strong
                class="mr-auto text-[0.82rem] text-brand-navy max-[640px]:mr-0 max-[640px]:w-[calc(100%_-_3rem)]"
                >{{ selectedIds.length }} selected</strong
              >
              <BaseDropdown
                v-model="bulkStatus"
                :options="bulkStatusOptions"
                size="sm"
                variant="compact"
                class="max-[640px]:flex-[1_1_9rem]"
                aria-label="Set status for selected units"
              />
              <BaseDropdown
                v-model="bulkCondition"
                :options="bulkConditionOptions"
                size="sm"
                variant="compact"
                class="max-[640px]:flex-[1_1_9rem]"
                aria-label="Set condition for selected units"
              />
              <BaseInput
                v-model="bulkLocation"
                size="sm"
                variant="compact"
                class="max-[640px]:flex-[1_1_9rem]"
                aria-label="Set location for selected units"
                placeholder="Set location"
              />
              <BaseButton
                variant="accent"
                size="sm"
                :disabled="saving || !hasBulkChanges"
                :elevated="false"
                :class="saving && 'disabled:cursor-wait'"
                @click="applyBulkUpdate"
                >Apply changes</BaseButton
              >
              <BaseButton
                variant="secondary"
                size="sm"
                :elevated="false"
                @click="selectedIds = []"
                >Clear</BaseButton
              >
            </div>
          </div>
        </div>
      </Transition>
      <table
        class="w-full min-w-[70rem] border-collapse max-[640px]:block max-[640px]:min-w-0"
      >
        <thead class="max-[640px]:hidden">
          <tr>
            <th
              class="w-10 bg-admin-panel-muted px-3 py-[0.8rem] text-center text-[0.7rem] uppercase tracking-[0.06em] text-admin-muted"
            >
              <input
                :checked="allSelected"
                type="checkbox"
                aria-label="Select all visible inventory units"
                class="h-4 w-4 accent-admin-link"
                @change="toggleAll"
              />
            </th>
            <th
              v-for="[key, title] in columns"
              :key="key"
              class="bg-admin-panel-muted p-0 text-left text-[0.7rem] uppercase tracking-[0.06em] text-admin-muted"
            >
              <button
                class="flex min-h-12 w-full cursor-pointer items-center justify-between border-0 bg-transparent px-3 py-[0.8rem] text-inherit [font:inherit] uppercase tracking-[inherit] transition-colors duration-interaction hover:text-admin-link focus-visible:outline-none focus-visible:shadow-focus-strong motion-reduce:transition-none"
                type="button"
                :aria-label="`Sort by ${title.toLowerCase()}`"
                @click="emit('sort', key)"
              >
                {{ title
                }}<span :class="sortIconClasses(key)" aria-hidden="true"></span>
              </button>
            </th>
            <th
              class="bg-admin-panel-muted px-3 py-[0.8rem] text-left text-[0.7rem] uppercase tracking-[0.06em] text-admin-muted"
            >
              Notes
            </th>
            <th
              class="bg-admin-panel-muted p-0 text-left text-[0.7rem] uppercase tracking-[0.06em] text-admin-muted"
            >
              <button
                class="flex min-h-12 w-full cursor-pointer items-center justify-between border-0 bg-transparent px-3 py-[0.8rem] text-inherit [font:inherit] uppercase tracking-[inherit] transition-colors duration-interaction hover:text-admin-link focus-visible:outline-none focus-visible:shadow-focus-strong motion-reduce:transition-none"
                type="button"
                aria-label="Sort by created"
                @click="emit('sort', 'created_at')"
              >
                Created<span
                  :class="sortIconClasses('created_at')"
                  aria-hidden="true"
                ></span>
              </button>
            </th>
            <th
              class="bg-admin-panel-muted px-3 py-[0.8rem] text-left text-[0.7rem] uppercase tracking-[0.06em] text-admin-muted"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          class="max-[640px]:grid max-[640px]:gap-[0.8rem] max-[640px]:[&>tr]:relative max-[640px]:[&>tr]:overflow-hidden max-[640px]:[&>tr]:rounded-[0.75rem] max-[640px]:[&>tr]:border max-[640px]:[&>tr]:border-admin-border max-[640px]:[&>tr]:bg-admin-panel max-[640px]:[&>tr]:shadow-card"
        >
          <InventoryUnitRow
            v-for="unit in units"
            :key="unit.id"
            :unit="unit"
            :model="modelFor(unit.model_id)"
            :selected="selectedIds.includes(unit.id)"
            @edit="emit('edit', $event)"
            @update:selected="updateSelection(unit.id, $event)"
          />
        </tbody>
      </table>
    </template>
  </div>
</template>
