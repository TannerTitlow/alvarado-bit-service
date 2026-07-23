<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: value =>
      ['primary', 'accent', 'secondary', 'danger', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value),
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  elevated: { type: Boolean, default: true },
  icon: { type: [Object, Function], default: null },
  iconPosition: {
    type: String,
    default: 'start',
    validator: value => ['start', 'end'].includes(value),
  },
  iconSize: { type: [String, Number], default: 16 },
})

const variantClasses = {
  primary: 'border-0 bg-gradient-to-br from-admin-primary-from to-admin-primary-to text-white',
  accent: 'border-0 bg-admin-link text-white',
  secondary:
    'border border-admin-border-strong bg-admin-panel-soft text-admin-subtle',
  danger: 'border border-admin-danger bg-admin-danger text-white',
  ghost:
    'border border-transparent bg-transparent text-admin-link enabled:hover:bg-admin-panel-tab enabled:hover:text-admin-link-hover',
}

const sizeClasses = {
  sm: 'h-control-sm px-[0.65rem] py-[0.4rem] text-[0.8rem]',
  md: 'h-control px-button-inline py-button-block text-[0.88rem]',
  lg: 'h-12 px-5 py-3 text-base',
}

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-button font-secondary font-bold leading-[normal] transition-[transform,box-shadow,background-color,border-color,color] duration-interaction focus-visible:outline-none focus-visible:shadow-focus-strong enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-[0.65] motion-reduce:transform-none motion-reduce:transition-none',
  props.elevated && 'enabled:hover:-translate-y-[0.1rem] enabled:hover:shadow-button',
  sizeClasses[props.size],
  variantClasses[props.variant],
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <component
      :is="icon"
      v-if="icon && iconPosition === 'start'"
      :size="iconSize"
      class="shrink-0"
      aria-hidden="true"
    />
    <slot />
    <component
      :is="icon"
      v-if="icon && iconPosition === 'end'"
      :size="iconSize"
      class="shrink-0"
      aria-hidden="true"
    />
  </button>
</template>
