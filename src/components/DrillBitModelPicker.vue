<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  models: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const query = ref('')
const open = ref(false)
const activeIndex = ref(0)
const pickerInput = ref(null)

const modelDetails = model =>
  [
    model.nominal_size && `${model.nominal_size} in.`,
    model.iadc_code && `IADC ${model.iadc_code}`,
    model.connection,
  ]
    .filter(Boolean)
    .join(' · ') || 'Specifications pending'

const selectedModel = computed(() =>
  props.models.find(model => model.id === props.modelValue),
)
const filteredModels = computed(() => {
  const terms = query.value.trim().toLowerCase()
  if (!terms) return props.models

  return props.models.filter(model =>
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
      .toLowerCase()
      .includes(terms),
  )
})

watch(
  () => props.modelValue,
  () => {
    query.value = ''
  },
)

const selectModel = model => {
  emit('update:modelValue', model.id)
  query.value = ''
  open.value = false
  pickerInput.value?.setCustomValidity('')
}

const openPicker = event => {
  open.value = true
  event.target.select()
}

const updateQuery = event => {
  query.value = event.target.value
  open.value = true
  activeIndex.value = 0
  emit('update:modelValue', '')
  event.target.setCustomValidity('Select a drill-bit model from the results.')
}

const closePicker = () => {
  window.setTimeout(() => {
    open.value = false
    query.value = ''
  }, 100)
}

const onKeydown = event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    open.value = true
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      filteredModels.value.length - 1,
    )
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (event.key === 'Enter' && open.value) {
    event.preventDefault()
    const model = filteredModels.value[activeIndex.value]
    if (model) selectModel(model)
  } else if (event.key === 'Escape') {
    open.value = false
  }
}
</script>

<template>
  <div class="model-picker">
    <input
      ref="pickerInput"
      :value="query || selectedModel?.display_name || ''"
      type="search"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="open"
      aria-controls="model-options"
      :aria-activedescendant="open ? `model-option-${activeIndex}` : undefined"
      placeholder="Search by model, size, IADC, or connection"
      required
      @focus="openPicker"
      @blur="closePicker"
      @input="updateQuery"
      @keydown="onKeydown"
    />
    <div v-if="open" id="model-options" class="model-options" role="listbox">
      <button
        v-for="(model, index) in filteredModels"
        :id="`model-option-${index}`"
        :key="model.id"
        :class="{
          active: index === activeIndex,
          selected: model.id === modelValue,
        }"
        type="button"
        role="option"
        :aria-selected="model.id === modelValue"
        @mousedown.prevent
        @mouseenter="activeIndex = index"
        @click="selectModel(model)"
      >
        <span class="model-name">
          {{ model.display_name }}
          <b v-if="model.circulation_type === 'reverse_circulation'">RC</b>
        </span>
        <small>{{ modelDetails(model) }}</small>
      </button>
      <p v-if="!filteredModels.length">No matching drill-bit models.</p>
    </div>
  </div>
</template>

<style scoped>
.model-picker {
  position: relative;
}
.model-picker::after {
  position: absolute;
  top: 1.35rem;
  right: 0.85rem;
  width: 0.45rem;
  height: 0.45rem;
  border-right: 2px solid #60708a;
  border-bottom: 2px solid #60708a;
  content: '';
  pointer-events: none;
  transform: rotate(45deg);
}
.model-picker input {
  box-sizing: border-box;
  width: 100%;
  min-height: 2.65rem;
  margin-top: 0.4rem;
  padding: 0.6rem 2.25rem 0.6rem 0.6rem;
  border: 1px solid #ccd7ea;
  border-radius: 0.5rem;
  background: #fbfcff;
  color: #263854;
  font: inherit;
}
.model-picker input:focus {
  border-color: #8fa7d1;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(27, 43, 82, 0.1);
}
.model-options {
  position: absolute;
  z-index: 2;
  right: 0;
  left: 0;
  max-height: 17rem;
  margin-top: 0.35rem;
  overflow-y: auto;
  border: 1px solid #ccd7ea;
  border-radius: 0.55rem;
  background: #fff;
  box-shadow: 0 0.8rem 1.8rem rgba(25, 42, 78, 0.18);
}
.model-options button {
  display: grid;
  width: 100%;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
  border: 0;
  border-bottom: 1px solid #edf0f6;
  background: #fff;
  color: #263854;
  cursor: pointer;
  text-align: left;
}
.model-options button:last-child {
  border-bottom: 0;
}
.model-options button:hover,
.model-options button.active {
  background: #edf3fd;
}
.model-options button.selected {
  box-shadow: inset 0 0 0 1px #7595c8;
  background: #e5eefc;
}
.model-options button.selected .model-name::before {
  content: 'Selected';
  padding: 0.11rem 0.3rem;
  border-radius: 999px;
  background: #31518b;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.model-name {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--navy-blue);
  font-weight: 700;
}
.model-name b {
  padding: 0.12rem 0.32rem;
  border-radius: 0.25rem;
  background: #f9dde1;
  color: #a51f34;
  font-size: 0.64rem;
}
.model-options small,
.model-options p {
  margin: 0;
  color: #60708a;
  font-size: 0.75rem;
  font-weight: 400;
}
.model-options p {
  padding: 0.8rem;
}
@media (max-width: 520px) {
  .model-options {
    max-height: min(18rem, 44dvh);
  }
  .model-options button {
    min-height: 3.6rem;
    padding: 0.7rem 0.8rem;
  }
  .model-name {
    flex-wrap: wrap;
  }
}
</style>
