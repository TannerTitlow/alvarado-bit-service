<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  modelModifiers: { type: Object, default: () => ({}) },
  type: { type: String, default: 'text' },
  fullWidth: { type: Boolean, default: false },
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

const emit = defineEmits(['update:modelValue', 'input'])

const classes = computed(() => [
  'block box-border min-w-0 appearance-none rounded-control border border-admin-border-strong font-secondary text-admin-ink placeholder:text-admin-muted placeholder:opacity-100 transition-[border-color,box-shadow,background-color] duration-interaction focus:border-admin-focus focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:border-admin-border disabled:bg-admin-panel-muted disabled:text-admin-disabled motion-reduce:transition-none',
  props.fullWidth && 'w-full',
  props.size === 'sm'
    ? 'h-control-sm px-2 py-[0.4rem] text-[0.8rem]'
    : 'h-control px-control-inline py-control-block',
  props.variant === 'compact' ? 'bg-admin-panel' : 'bg-admin-panel-soft',
])

const handleInput = event => {
  const value = props.modelModifiers.trim
    ? event.target.value.trim()
    : event.target.value
  emit(
    'update:modelValue',
    props.modelModifiers.number && value !== '' ? Number(value) : value,
  )
  emit('input', event)
}
</script>

<template>
  <input :value="modelValue" :type="type" :class="classes" @input="handleInput" />
</template>
