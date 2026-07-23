<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'

const props = defineProps({
  model: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const emptyForm = () => ({
  display_name: '',
  nominal_size: '',
  nominal_size_in: '',
  bit_type: '',
  product_line: '',
  iadc_code: '',
  connection: '',
  circulation_type: '',
  sku: '',
  manufacturer_part_number: '',
  list_price: '',
  description: '',
  active: true,
  image: null,
})

const form = ref(emptyForm())
const imageName = ref('')
const imagePreview = ref(null)
let objectUrl = null
const fieldLabelClasses =
  'block min-w-0 font-secondary text-[0.72rem] font-bold uppercase tracking-[0.04em] text-brand-navy'
const circulationOptions = [
  { value: '', label: 'Not specified' },
  { value: 'standard', label: 'Standard circulation' },
  { value: 'reverse_circulation', label: 'Reverse circulation' },
]

const parseInches = value => {
  const normalized = value?.trim()
  if (!normalized) return null

  const mixedFraction = normalized.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixedFraction)
    return (
      Number(mixedFraction[1]) +
      Number(mixedFraction[2]) / Number(mixedFraction[3])
    )

  const fraction = normalized.match(/^(\d+)\/(\d+)$/)
  if (fraction) return Number(fraction[1]) / Number(fraction[2])

  const decimal = Number(normalized)
  return Number.isFinite(decimal) && decimal > 0 ? decimal : null
}

const nominalSizeIn = computed(() => parseInches(form.value.nominal_size))

watch(
  () => props.model,
  model => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = null
    form.value = { ...emptyForm(), ...model, image: null }
    imageName.value = ''
    imagePreview.value = model?.imagePreview || null
  },
  { immediate: true },
)

const selectImage = event => {
  const [file] = event.target.files
  form.value.image = file || null
  imageName.value = file?.name || ''
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = file ? URL.createObjectURL(file) : null
  imagePreview.value = objectUrl || props.model?.imagePreview || null
}

onUnmounted(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})

const save = () => {
  emit('save', {
    ...form.value,
    nominal_size_in: nominalSizeIn.value,
    list_price:
      form.value.list_price === '' ? null : Number(form.value.list_price),
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-[100] grid place-items-center bg-[rgba(10,21,48,0.52)] p-4 backdrop-blur-[0.3rem] max-[520px]:p-0"
    @click.self="emit('close')"
  >
    <section
      class="flex max-h-[calc(100dvh-2rem)] w-full max-w-[68rem] flex-col overflow-hidden rounded-[1rem] border border-admin-border bg-admin-panel text-admin-ink shadow-[0_1.5rem_4rem_rgba(10,21,48,0.26)] max-[768px]:h-[calc(100dvh-2rem)] max-[520px]:h-dvh max-[520px]:max-h-none max-[520px]:rounded-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-modal-title"
    >
      <header
        class="flex items-center justify-between gap-4 border-b border-admin-border bg-gradient-to-br from-admin-panel to-[#f5f8fe] px-6 py-4 max-[520px]:px-4 max-[520px]:py-[0.9rem]"
      >
        <div>
          <p
            class="mb-1 mt-0 font-secondary text-[0.7rem] font-bold uppercase tracking-[0.11em] text-admin-danger"
          >
            Catalog configuration
          </p>
          <h2 id="model-modal-title" class="m-0 text-[1.25rem] text-brand-navy">
            {{ model ? 'Edit Drill Bit Model' : 'Add Drill Bit Model' }}
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
          class="grid flex-1 grid-cols-[minmax(0,1.15fr)_minmax(25rem,1fr)] items-start gap-5 overflow-y-auto px-6 py-[1.35rem] max-[1100px]:grid-cols-1 max-[768px]:px-4 max-[768px]:py-4"
        >
          <section
            class="rounded-toolbar border border-admin-border-subtle bg-gradient-to-br from-admin-panel to-admin-panel-soft p-5 max-[520px]:p-4"
          >
            <div class="mb-[1.1rem]">
              <h3 class="m-0 text-[1rem] text-brand-navy">
                Core model details
              </h3>
              <p
                class="mb-0 mt-[0.28rem] text-[0.78rem] leading-[1.4] text-admin-muted"
              >
                Define the physical configuration used to identify this bit.
              </p>
            </div>
            <div class="grid grid-cols-2 gap-[0.9rem] max-[440px]:grid-cols-1">
              <label
                :class="[
                  fieldLabelClasses,
                  'col-span-full max-[440px]:col-auto',
                ]"
                ><span
                  >Display name
                  <b class="text-admin-danger" aria-hidden="true">*</b></span
                ><BaseInput
                  full-width
                  v-model.trim="form.display_name"
                  class="mt-1.5"
                  required
                  placeholder="e.g. 8 3/4 in. Tricone Bit"
              /></label>
              <label
                :class="[
                  fieldLabelClasses,
                  'relative col-span-full flex min-h-[8.75rem] cursor-pointer flex-col justify-center overflow-hidden rounded-[0.7rem] border border-dashed border-[#9db2d5] bg-gradient-to-br from-[#edf3fc] to-admin-panel-soft px-3 py-[0.65rem] transition-[border-color,background-color,box-shadow] duration-interaction hover:border-admin-link hover:bg-admin-panel-selected hover:shadow-[inset_0_0_0_1px_rgba(49,81,139,0.08)] max-[440px]:col-auto',
                  imagePreview &&
                    'pl-[8.8rem] max-[440px]:px-3 max-[440px]:pt-32',
                ]"
              >
                <span>Model image</span>
                <input
                  class="absolute inset-0 z-[1] m-0 h-full w-full cursor-pointer opacity-0"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="selectImage"
                />
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Selected drill-bit model image preview"
                  class="absolute bottom-3 top-3 left-[0.85rem] h-[calc(100%_-_1.5rem)] w-[6.75rem] rounded-control border-2 border-admin-panel bg-admin-panel object-contain shadow-[0_0.5rem_1rem_rgba(25,42,78,0.16)] max-[440px]:bottom-auto max-[440px]:left-auto max-[440px]:right-3 max-[440px]:h-[6.25rem] max-[440px]:w-auto"
                />
                <strong
                  class="mt-[0.55rem] w-fit rounded-[0.38rem] bg-brand-navy px-[0.6rem] py-[0.38rem] text-[0.76rem] leading-none normal-case tracking-normal text-white"
                  >{{
                    imageName ||
                    (imagePreview ? 'Replace image' : 'Add model image')
                  }}</strong
                >
                <small
                  class="mt-[0.2rem] text-[0.72rem] font-normal normal-case tracking-normal text-admin-muted"
                  >{{
                    imageName
                      ? 'Ready to upload when changes are saved'
                      : 'JPEG, PNG, or WebP. Maximum file size 10 MB.'
                  }}</small
                >
              </label>
              <label :class="fieldLabelClasses"
                >Nominal size<BaseInput
                  full-width
                  v-model.trim="form.nominal_size"
                  class="mt-1.5"
                  placeholder="8 3/4"
              /></label>
              <div
                class="min-w-0 rounded-control border border-admin-border-tag bg-gradient-to-br from-[#eef3fb] to-[#f8faff] px-[0.6rem] py-[0.6rem] font-secondary text-[0.72rem] font-bold uppercase tracking-[0.04em] text-brand-navy"
                role="status"
              >
                <span>Calculated size</span>
                <strong
                  class="mt-[0.3rem] block text-[1rem] normal-case tracking-normal"
                  >{{
                    nominalSizeIn
                      ? `${nominalSizeIn.toFixed(3)} in.`
                      : 'Enter a size'
                  }}</strong
                >
                <small
                  class="mt-[0.1rem] block text-[0.72rem] font-normal normal-case tracking-normal text-admin-muted"
                  >Derived from nominal size</small
                >
              </div>
              <label :class="fieldLabelClasses"
                >Bit type<BaseInput
                  full-width
                  v-model.trim="form.bit_type"
                  class="mt-1.5"
                  placeholder="Tricone"
              /></label>
              <label :class="fieldLabelClasses"
                >IADC code<BaseInput
                  full-width
                  v-model.trim="form.iadc_code"
                  class="mt-1.5"
                  placeholder="517"
              /></label>
              <label :class="fieldLabelClasses"
                >Connection<BaseInput
                  full-width
                  v-model.trim="form.connection"
                  class="mt-1.5"
                  placeholder="4 1/2 REG"
              /></label>
              <label :class="fieldLabelClasses"
                >Circulation type<BaseDropdown
                  full-width
                  v-model="form.circulation_type"
                  :options="circulationOptions"
                  class="mt-1.5"
              /></label>
            </div>
          </section>

          <section
            class="rounded-toolbar border border-admin-border-subtle bg-gradient-to-br from-admin-panel to-admin-panel-soft p-5 max-[520px]:p-4"
          >
            <div class="mb-[1.1rem]">
              <h3 class="m-0 text-[1rem] text-brand-navy">
                Catalog &amp; publishing
              </h3>
              <p
                class="mb-0 mt-[0.28rem] text-[0.78rem] leading-[1.4] text-admin-muted"
              >
                Manage commercial identifiers and model availability.
              </p>
            </div>
            <div class="grid grid-cols-2 gap-[0.9rem] max-[440px]:grid-cols-1">
              <label
                class="col-span-full flex items-center gap-[0.7rem] rounded-control border border-[#d8e2f1] bg-[#f5f8fd] p-3 normal-case tracking-normal max-[440px]:col-auto"
              >
                <BaseCheckbox v-model="form.active" />
                <span class="grid gap-[0.12rem]">
                  <strong class="text-[0.82rem] text-brand-navy"
                    >Active model</strong
                  >
                  <small class="text-[0.75rem] font-normal text-admin-muted"
                    >Available for inventory and catalog workflows.</small
                  >
                </span>
              </label>
              <label :class="fieldLabelClasses"
                >Product line<BaseInput
                  full-width
                  v-model.trim="form.product_line"
                  class="mt-1.5"
                  placeholder="e.g. RockForce"
              /></label>
              <label :class="fieldLabelClasses"
                >SKU<BaseInput
                  full-width
                  v-model.trim="form.sku"
                  class="mt-1.5"
                  placeholder="Internal SKU"
              /></label>
              <label :class="fieldLabelClasses"
                >Manufacturer Part #<BaseInput
                  full-width
                  v-model.trim="form.manufacturer_part_number"
                  class="mt-1.5"
                  placeholder="Part number"
              /></label>
              <label :class="fieldLabelClasses"
                >List price<BaseInput
                  full-width
                  v-model.number="form.list_price"
                  class="mt-1.5"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
              /></label>
              <label
                :class="[
                  fieldLabelClasses,
                  'col-span-full max-[440px]:col-auto',
                ]"
                >Description<BaseTextarea
                  full-width
                  v-model.trim="form.description"
                  class="mt-1.5 w-full"
                  rows="3"
                  placeholder="Cutter configuration, intended formation, or operating characteristics"
                />
              </label>
            </div>
          </section>
        </div>

        <footer
          class="flex justify-end gap-4 border-t border-admin-border bg-[#f8faff] px-6 py-4 max-[768px]:px-4 max-[768px]:py-4 max-[768px]:[&>*]:flex-1"
        >
          <BaseButton
            variant="secondary"
            class="min-w-[6.5rem]"
            @click="emit('close')"
            >Cancel</BaseButton
          >
          <BaseButton variant="danger" type="submit" class="min-w-[6.5rem]">
            {{ model ? 'Save Changes' : 'Add Model' }}
          </BaseButton>
        </footer>
      </form>
    </section>
  </div>
</template>
