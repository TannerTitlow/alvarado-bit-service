<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  detail: { type: String, required: true },
  tone: { type: String, default: 'default' },
  icon: { type: [Object, Function], default: null },
})

const tones = {
  default: 'border-admin-border bg-admin-panel text-brand-navy',
  attention: 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]',
  success: 'border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]',
}
</script>

<template>
  <article :class="['rounded-panel border p-5 shadow-toolbar', tones[tone]]">
    <p
      class="m-0 inline-flex items-center gap-1.5 font-secondary text-xs font-bold uppercase tracking-[0.1em] opacity-70"
    >
      {{ label }}
      <component
        :is="icon"
        v-if="icon"
        :size="14"
        class="shrink-0"
        aria-hidden="true"
      />
    </p>
    <p class="mb-1 mt-3 text-[clamp(1.7rem,3vw,2.3rem)] font-bold leading-none">
      {{ value }}
    </p>
    <p class="m-0 text-sm opacity-75">{{ detail }}</p>
  </article>
</template>
