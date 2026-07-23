<script setup>
import BaseCombobox from '@/components/ui/BaseCombobox.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  models: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const modelDetails = model =>
  [
    model.nominal_size && `${model.nominal_size} in.`,
    model.iadc_code && `IADC ${model.iadc_code}`,
    model.connection,
  ]
    .filter(Boolean)
    .join(' · ') || 'Specifications pending'

const modelSearchText = model =>
  [
    model.display_name,
    model.nominal_size,
    model.bit_type,
    model.iadc_code,
    model.connection,
    model.product_line,
    model.sku,
    model.manufacturer_part_number,
    model.circulation_type === 'reverse_circulation'
      ? 'reverse circulation rc'
      : '',
  ]
    .filter(Boolean)
    .join(' ')
</script>

<template>
  <BaseCombobox
    :model-value="modelValue"
    :options="models"
    value-key="id"
    label-key="display_name"
    :get-option-search-text="modelSearchText"
    :get-option-description="modelDetails"
    placeholder="Search by model, size, IADC, or connection"
    no-results-text="No matching drill-bit models."
    invalid-selection-message="Select a drill-bit model from the results."
    required
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #option="{ option, selected }">
      <span class="flex flex-wrap items-center gap-[0.35rem] font-secondary font-bold text-brand-navy">
        <span v-if="selected" class="rounded-full bg-admin-link px-[0.3rem] py-[0.11rem] text-[0.6rem] uppercase tracking-[0.03em] text-white">Selected</span>
        {{ option.display_name }}
        <b v-if="option.circulation_type === 'reverse_circulation'" class="rounded-[0.25rem] bg-admin-danger-tag px-[0.32rem] py-[0.12rem] text-[0.64rem] text-admin-danger">RC</b>
      </span>
      <small class="text-[0.75rem] font-normal text-admin-muted">{{ modelDetails(option) }}</small>
    </template>
  </BaseCombobox>
</template>
