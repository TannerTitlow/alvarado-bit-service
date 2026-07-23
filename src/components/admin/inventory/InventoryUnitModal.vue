<script setup>
import { ref, watch } from 'vue'
import { X } from '@lucide/vue'
import DrillBitModelPicker from './DrillBitModelPicker.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'

const props = defineProps({
  unit: {
    type: Object,
    default: null,
  },
  models: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save'])

const emptyForm = () => ({
  model_id: '',
  asset_tag: '',
  status: 'available',
  condition: 'unknown',
  location: '',
  notes: '',
})

const form = ref(emptyForm())
const statuses = ['available', 'reserved', 'in_repair', 'sold', 'scrapped']
const conditions = ['unknown', 'new', 'used', 'remanufactured']
const fieldLabelClasses =
  'block min-w-0 font-secondary text-[0.72rem] font-bold uppercase tracking-[0.04em] text-brand-navy'
const label = value =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
const statusOptions = statuses.map(value => ({ value, label: label(value) }))
const conditionOptions = conditions.map(value => ({
  value,
  label: label(value),
}))

watch(
  () => props.unit,
  unit => {
    form.value = { ...emptyForm(), ...unit }
  },
  { immediate: true },
)

const save = () => {
  emit('save', {
    ...form.value,
    model_id: form.value.model_id || null,
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-[100] grid place-items-center bg-[rgba(10,21,48,0.52)] p-4 backdrop-blur-[0.3rem] max-[520px]:p-0"
    @click.self="emit('close')"
  >
    <section
      class="flex max-h-[calc(100dvh-2rem)] w-full max-w-[38rem] flex-col overflow-hidden rounded-[1rem] border border-admin-border bg-admin-panel text-admin-ink shadow-[0_1.5rem_4rem_rgba(10,21,48,0.26)] max-[520px]:h-dvh max-[520px]:max-h-none max-[520px]:rounded-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unit-modal-title"
    >
      <header
        class="flex items-center justify-between gap-4 border-b border-admin-border bg-gradient-to-br from-admin-panel to-[#f5f8fe] px-6 py-4 max-[520px]:px-4 max-[520px]:py-[0.9rem]"
      >
        <div>
          <p
            class="mb-1 mt-0 font-secondary text-[0.7rem] font-bold uppercase tracking-[0.11em] text-admin-danger"
          >
            Physical inventory
          </p>
          <h2 id="unit-modal-title" class="m-0 text-[1.25rem] text-brand-navy">
            {{ unit ? 'Edit Inventory Unit' : 'Add Inventory Unit' }}
          </h2>
        </div>
        <button
          class="grid h-control-sm w-[2.25rem] cursor-pointer place-items-center rounded-control border border-admin-border bg-admin-panel-muted text-admin-neutral transition-[background-color,border-color,color] duration-interaction hover:border-admin-border-strong hover:bg-admin-panel-tab hover:text-admin-ink focus-visible:outline-none focus-visible:shadow-focus-strong motion-reduce:transition-none"
          type="button"
          aria-label="Close modal"
          @click="emit('close')"
        >
          <X :size="20" aria-hidden="true" />
        </button>
      </header>

      <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="save">
        <div
          class="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-y-auto px-6 py-[1.35rem] max-[520px]:grid-cols-1 max-[520px]:px-4 max-[520px]:py-4"
        >
          <label :class="fieldLabelClasses"
            >Drill bit model<DrillBitModelPicker
              v-model="form.model_id"
              :models="models"
          /></label>
          <label :class="fieldLabelClasses"
            >Asset tag<BaseInput
              v-model.trim="form.asset_tag"
              full-width
              class="mt-1.5"
              placeholder="Yard or serial tag"
          /></label>
          <label :class="fieldLabelClasses"
            >Status<BaseDropdown
              v-model="form.status"
              full-width
              :options="statusOptions"
              class="mt-1.5"
          /></label>
          <label :class="fieldLabelClasses"
            >Condition<BaseDropdown
              v-model="form.condition"
              full-width
              :options="conditionOptions"
              class="mt-1.5"
          /></label>
          <label
            :class="[fieldLabelClasses, 'col-span-full max-[520px]:col-auto']"
            >Location<BaseInput
              v-model.trim="form.location"
              full-width
              class="mt-1.5"
              placeholder="Yard, rack, or job site"
          /></label>
          <label
            :class="[fieldLabelClasses, 'col-span-full max-[520px]:col-auto']"
            >Notes<BaseTextarea
              v-model.trim="form.notes"
              full-width
              class="mt-1.5"
              rows="4"
              placeholder="Inspection, customer, or service note"
          /></label>
        </div>
        <footer
          class="flex justify-end gap-4 border-t border-admin-border bg-[#f8faff] px-6 py-4 max-[520px]:px-4 max-[520px]:[&>*]:flex-1"
        >
          <BaseButton
            variant="secondary"
            class="min-w-[6.5rem]"
            @click="emit('close')"
            >Cancel</BaseButton
          >
          <BaseButton variant="danger" type="submit" class="min-w-[6.5rem]">{{
            unit ? 'Save Changes' : 'Add Unit'
          }}</BaseButton>
        </footer>
      </form>
    </section>
  </div>
</template>
