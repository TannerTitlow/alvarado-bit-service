<script setup>
import { computed, useAttrs } from 'vue'
import { ChevronDown } from '@lucide/vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  modelModifiers: { type: Object, default: () => ({}) },
  fullWidth: { type: Boolean, default: false },
  options: { type: Array, default: () => [] },
  valueKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' },
  optionClasses: { type: Object, default: () => ({}) },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md'].includes(value),
  },
  variant: {
    type: String,
    default: 'default',
    validator: value => ['default', 'compact'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

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

const classes = computed(() => [
  'block box-border w-full min-w-0 appearance-none rounded-control border border-admin-border-strong pr-7 font-secondary text-admin-ink transition-[border-color,box-shadow,background-color] duration-interaction focus:border-admin-focus focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:border-admin-border disabled:bg-admin-panel-muted disabled:text-admin-disabled motion-reduce:transition-none',
  props.size === 'sm'
    ? 'h-control-sm px-2 py-[0.4rem] text-[0.8rem]'
    : 'h-control p-control-block',
  props.variant === 'compact' ? 'bg-admin-panel' : 'bg-admin-panel-soft',
])
const wrapperClasses = computed(() => [
  'relative inline-block min-w-0',
  props.fullWidth && 'block w-full',
  attrs.class,
])
const selectAttrs = computed(() => {
  const { class: _class, ...inputAttrs } = attrs
  return inputAttrs
})

const handleChange = event => {
  const value = event.target.value
  emit(
    'update:modelValue',
    props.modelModifiers.number && value !== '' ? Number(value) : value,
  )
  emit('change', event)
}
</script>

<template>
  <div :class="wrapperClasses">
    <select v-bind="selectAttrs" :value="modelValue" :class="classes" @change="handleChange">
      <option
        v-for="option in normalizedOptions"
        :key="String(option.value)"
        :value="option.value"
        :disabled="option.disabled"
        :class="optionClasses[option.value]"
      >
        {{ option.label }}
      </option>
    </select>
    <ChevronDown :size="14" class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-ink" aria-hidden="true" />
  </div>
</template>
