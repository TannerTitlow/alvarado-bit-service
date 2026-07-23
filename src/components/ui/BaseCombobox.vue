<script setup>
import { computed, ref, useId, watch } from 'vue'
import { ChevronDown, X } from '@lucide/vue'
import BaseInput from './BaseInput.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  valueKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' },
  getOptionSearchText: { type: Function, default: null },
  getOptionDescription: { type: Function, default: null },
  placeholder: { type: String, default: 'Search options' },
  noResultsText: { type: String, default: 'No matching options.' },
  invalidSelectionMessage: {
    type: String,
    default: 'Select an option from the results.',
  },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const query = ref('')
const open = ref(false)
const activeIndex = ref(0)
const inputRef = ref(null)
const listboxId = useId()

const optionLabel = option => String(option?.[props.labelKey] ?? '')
const selectedOption = computed(() =>
  props.options.find(option => option?.[props.valueKey] === props.modelValue),
)
const filteredOptions = computed(() => {
  const terms = query.value.trim().toLowerCase()
  if (!terms) return props.options

  return props.options.filter(option => {
    const text = props.getOptionSearchText
      ? props.getOptionSearchText(option)
      : optionLabel(option)
    return String(text || '').toLowerCase().includes(terms)
  })
})
const inputValue = computed(
  () => query.value || optionLabel(selectedOption.value),
)

watch(
  () => props.modelValue,
  value => {
    if (value) query.value = ''
  },
)

const clearValidity = () => inputRef.value?.$el?.setCustomValidity('')
const selectOption = option => {
  emit('update:modelValue', option[props.valueKey])
  query.value = ''
  open.value = false
  clearValidity()
}
const openCombobox = event => {
  open.value = true
  activeIndex.value = 0
  event.target.select()
}
const updateQuery = event => {
  query.value = event.target.value
  open.value = true
  activeIndex.value = 0
  emit('update:modelValue', '')
  event.target.setCustomValidity(props.invalidSelectionMessage)
}
const closeCombobox = () => {
  window.setTimeout(() => {
    open.value = false
    query.value = ''
  }, 100)
}
const clearCombobox = () => {
  query.value = ''
  open.value = false
  activeIndex.value = 0
  emit('update:modelValue', '')
  clearValidity()
  inputRef.value?.$el?.focus()
}
const onKeydown = event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    open.value = true
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      Math.max(filteredOptions.value.length - 1, 0),
    )
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (event.key === 'Enter' && open.value) {
    event.preventDefault()
    const option = filteredOptions.value[activeIndex.value]
    if (option) selectOption(option)
  } else if (event.key === 'Escape') {
    open.value = false
  }
}
</script>

<template>
  <div class="group relative mt-1.5 min-w-0">
    <BaseInput
      ref="inputRef"
      :model-value="inputValue"
      type="text"
      full-width
      :placeholder="placeholder"
      :required="required"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="open"
      :aria-controls="listboxId"
      :aria-activedescendant="open ? `${listboxId}-option-${activeIndex}` : undefined"
      class="pr-9"
      @focus="openCombobox"
      @blur="closeCombobox"
      @input="updateQuery"
      @keydown="onKeydown"
    />
    <ChevronDown :size="14" :class="['pointer-events-none absolute right-[0.8125rem] top-1/2 -translate-y-1/2 text-admin-ink', inputValue && 'group-hover:hidden group-focus-within:hidden']" aria-hidden="true" />
    <button
      v-if="inputValue"
      class="invisible pointer-events-none absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 cursor-pointer place-content-center rounded-[0.3rem] border-0 bg-transparent text-admin-muted transition-[background-color,color] duration-interaction hover:bg-admin-panel-tab hover:text-admin-ink focus-visible:outline-none focus-visible:shadow-focus-strong group-hover:pointer-events-auto group-hover:visible group-focus-within:pointer-events-auto group-focus-within:visible motion-reduce:transition-none"
      type="button"
      aria-label="Clear selection"
      @mousedown.prevent
      @click="clearCombobox"
    >
      <X :size="15" aria-hidden="true" />
    </button>

    <div v-if="open" :id="listboxId" class="absolute inset-x-0 z-[2] mt-[0.35rem] max-h-[17rem] overflow-y-auto rounded-control border border-admin-border-strong bg-admin-panel shadow-[0_0.8rem_1.8rem_rgba(25,42,78,0.18)] max-[520px]:max-h-[min(18rem,44dvh)]" role="listbox">
      <button
        v-for="(option, index) in filteredOptions"
        :id="`${listboxId}-option-${index}`"
        :key="String(option[valueKey])"
        :class="[
          'grid min-h-[3.6rem] w-full cursor-pointer gap-[0.2rem] border-0 border-b border-admin-border-model-action bg-admin-panel px-3 py-[0.65rem] text-left transition-colors duration-interaction last:border-b-0 hover:bg-admin-panel-selected focus-visible:outline-none focus-visible:shadow-focus-strong max-[520px]:px-[0.8rem] max-[520px]:py-[0.7rem] motion-reduce:transition-none',
          index === activeIndex && 'bg-admin-panel-selected',
          option[valueKey] === modelValue && 'bg-[#e5eefc] shadow-[inset_0_0_0_1px_#7595c8]',
        ]"
        type="button"
        role="option"
        :aria-selected="option[valueKey] === modelValue"
        @mousedown.prevent
        @mouseenter="activeIndex = index"
        @click="selectOption(option)"
      >
        <slot name="option" :option="option" :selected="option[valueKey] === modelValue">
          <span class="flex items-center gap-1.5 font-secondary font-bold text-brand-navy">{{ optionLabel(option) }}</span>
          <small v-if="getOptionDescription" class="text-[0.75rem] font-normal text-admin-muted">{{ getOptionDescription(option) }}</small>
        </slot>
      </button>
      <p v-if="!filteredOptions.length" class="m-0 p-[0.8rem] text-[0.75rem] text-admin-muted">{{ noResultsText }}</p>
    </div>
  </div>
</template>
