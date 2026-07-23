<script setup>
defineProps({
  metrics: { type: Array, default: () => [] },
})
</script>

<template>
  <div
    class="my-4 grid grid-cols-2 gap-3 max-[360px]:grid-cols-1 min-[641px]:my-5 min-[641px]:gap-4 tablet:grid-cols-4"
  >
    <article
      v-for="metric in metrics"
      :key="metric.label"
      :class="[
        'min-h-[6.9rem] rounded-panel border p-[0.9rem] shadow-card min-[641px]:min-h-0 min-[641px]:p-[1.1rem]',
        metric.tone === 'attention' &&
          'border-admin-danger-border bg-admin-danger-subtle [&>strong]:text-admin-danger',
        metric.tone !== 'attention' && 'border-admin-border bg-admin-panel',
      ]"
    >
      <span
        class="block font-secondary text-[0.64rem] font-bold uppercase tracking-[0.06em] text-admin-muted min-[641px]:text-[0.7rem]"
        >{{ metric.label }}</span
      ><strong
        class="my-[0.35rem] block [overflow-wrap:anywhere] text-[clamp(1.35rem,6vw,1.75rem)] text-brand-navy min-[641px]:my-[0.45rem] min-[641px]:text-[clamp(1.6rem,2.8vw,2.2rem)]"
        >{{ metric.value }}</strong
      ><small
        class="block font-secondary text-[0.64rem] font-normal normal-case tracking-normal text-admin-muted min-[641px]:text-[0.7rem]"
        >{{ metric.detail }}</small
      >
    </article>
  </div>
</template>
