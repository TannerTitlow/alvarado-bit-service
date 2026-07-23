<script setup>
import { computed } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  href: { type: String, default: null },
  icon: { type: [Object, Function], required: true },
  variant: {
    type: String,
    default: 'section',
    validator: value => ['section', 'footer'].includes(value),
  },
})

const emit = defineEmits(['click'])

const isLink = computed(() => Boolean(props.href))
const classes = computed(() => {
  const shared =
    'flex w-full cursor-pointer items-center gap-3 rounded-[0.65rem] px-4 text-left text-white/80 transition-[background-color,color,border-color,transform] duration-interaction ease-emphasized hover:text-white motion-reduce:transform-none motion-reduce:transition-none'

  if (props.variant === 'footer') {
    return `${shared} border border-white/20 py-3 font-secondary text-base no-underline hover:translate-x-[0.2rem] hover:bg-white/10`
  }

  return `${shared} border-0 bg-transparent py-[0.85rem] font-secondary text-[0.95rem] font-semibold ${
    props.active
      ? 'bg-gradient-to-br from-[#c02a3d] to-[#9f1f31] !text-white shadow-[0_0.75rem_1.5rem_rgba(0,0,0,0.18)] hover:from-[#c02a3d] hover:to-[#9f1f31]'
      : 'hover:translate-x-[0.2rem] hover:bg-white/10'
  }`
})
</script>

<template>
  <a v-if="isLink" :href="href" :class="classes" @click="emit('click', $event)">
    <component :is="icon" :size="20" class="shrink-0" aria-hidden="true" />
    <slot />
  </a>
  <button v-else type="button" :class="classes" @click="emit('click', $event)">
    <component :is="icon" :size="20" class="shrink-0" aria-hidden="true" />
    <slot />
  </button>
</template>
