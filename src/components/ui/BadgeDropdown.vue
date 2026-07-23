<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { ChevronDown } from '@lucide/vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  valueKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' },
  badgeClasses: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()
const root = ref(null)
const isOpen = ref(false)
const activeIndex = ref(0)

const normalizedOptions = computed(() =>
  props.options.map(option => {
    if (option !== null && typeof option === 'object') {
      return {
        value: option[props.valueKey],
        label: option[props.labelKey] ?? option[props.valueKey],
        disabled: Boolean(option.disabled),
      }
    }

    return { value: option, label: option, disabled: false }
  }),
)
const selectedOption = computed(
  () => normalizedOptions.value.find(option => option.value === props.modelValue) ?? {},
)
const isDisabled = computed(() => Boolean(attrs.disabled))
const wrapperClasses = computed(() => ['relative inline-block w-32', attrs.class])
const buttonAttrs = computed(() => {
  const { class: _class, disabled: _disabled, ...buttonAttributes } = attrs
  return buttonAttributes
})
const badgeClass = value => props.badgeClasses[value]
const toggle = () => {
  if (isDisabled.value) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    activeIndex.value = Math.max(
      0,
      normalizedOptions.value.findIndex(option => option.value === props.modelValue),
    )
  }
}
const selectOption = option => {
  if (option.disabled) return
  isOpen.value = false
  emit('update:modelValue', option.value)
  emit('change', { target: { value: option.value } })
}
const handleKeydown = event => {
  if (isDisabled.value) return
  const lastIndex = normalizedOptions.value.length - 1

  if (event.key === 'Escape') {
    isOpen.value = false
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) {
      toggle()
      return
    }
    const direction = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + direction + lastIndex + 1) % (lastIndex + 1)
    return
  }
  if ((event.key === 'Enter' || event.key === ' ') && isOpen.value) {
    event.preventDefault()
    selectOption(normalizedOptions.value[activeIndex.value])
  }
}
const closeOnOutsideClick = event => {
  if (!root.value?.contains(event.target)) isOpen.value = false
}

onMounted(() => document.addEventListener('pointerdown', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsideClick))
</script>

<template>
  <div ref="root" :class="wrapperClasses">
    <button
      v-bind="buttonAttrs"
      type="button"
      :disabled="isDisabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      class="relative block min-h-8 w-full rounded-full border px-8 py-1 text-[0.78rem] font-bold transition-[box-shadow,transform] duration-interaction hover:-translate-y-px hover:shadow-[0_0.2rem_0.5rem_rgba(25,42,78,0.12)] focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:transform-none"
      :class="badgeClass(modelValue)"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span class="pointer-events-none absolute inset-0 grid place-items-center text-center">{{ selectedOption.label }}</span>
      <ChevronDown :size="14" class="absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform duration-interaction" :class="isOpen && 'rotate-180'" aria-hidden="true" />
    </button>
    <div
      v-if="isOpen"
      role="listbox"
      class="absolute left-0 z-20 mt-1 grid w-full overflow-hidden rounded-control border border-admin-border-strong bg-admin-panel-muted shadow-raised"
    >
      <button
        v-for="(option, index) in normalizedOptions"
        :key="String(option.value)"
        type="button"
        role="option"
        :aria-selected="option.value === modelValue"
        :disabled="option.disabled"
        class="min-h-8 w-full border border-transparent bg-admin-panel px-3 py-1 text-center text-[0.78rem] font-bold text-admin-ink transition-[filter] duration-interaction hover:brightness-[.98] focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
        :class="[badgeClass(option.value), index === activeIndex && 'ring-1 ring-admin-focus']"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
