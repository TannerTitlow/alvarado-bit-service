<script setup>
import { ArrowRight, MapPin, Wrench } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps({
  attentionUnits: { type: Array, required: true },
  lowStockModels: { type: Array, required: true },
})
const emit = defineEmits(['open-inventory'])
</script>

<template>
  <section class="rounded-panel border border-admin-border bg-admin-panel p-5 shadow-toolbar">
    <header class="flex items-start justify-between gap-4">
      <div>
        <p class="m-0 font-secondary text-xs font-bold uppercase tracking-[0.1em] text-admin-eyebrow">Inventory watch</p>
        <h3 class="mb-0 mt-1 text-xl text-brand-navy">Exceptions and availability</h3>
      </div>
      <BaseButton variant="secondary" class="shrink-0" @click="emit('open-inventory')">Manage</BaseButton>
    </header>

    <div class="mt-4 grid gap-3">
      <article v-for="unit in attentionUnits.slice(0, 3)" :key="unit.id" class="flex items-center gap-3 rounded-control bg-admin-danger-soft px-3 py-3 text-admin-danger">
        <Wrench :size="18" class="shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="m-0 truncate text-sm font-bold">{{ unit.model?.display_name || `Unit #${unit.id}` }}</p>
          <p class="m-0 truncate text-xs opacity-80">{{ unit.asset_tag || 'No asset tag' }} · {{ unit.reason }}</p>
        </div>
      </article>
      <p v-if="!attentionUnits.length" class="m-0 rounded-control bg-admin-success-soft px-4 py-3 text-sm text-admin-success">No inventory units need attention.</p>
    </div>

    <div v-if="lowStockModels.length" class="mt-5 border-t border-admin-border pt-4">
      <p class="m-0 text-sm font-bold text-admin-ink">Low or unavailable models</p>
      <div class="mt-2 grid gap-2">
        <div v-for="model in lowStockModels.slice(0, 3)" :key="model.id" class="flex items-center justify-between gap-3 text-sm text-admin-muted">
          <span class="min-w-0 truncate">{{ model.display_name }}</span>
          <span class="flex items-center gap-1 whitespace-nowrap font-bold text-admin-danger"><MapPin :size="14" />{{ model.available }} available</span>
        </div>
      </div>
      <button class="mt-3 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-bold text-brand-navy" type="button" @click="emit('open-inventory')">Review inventory <ArrowRight :size="16" /></button>
    </div>
  </section>
</template>
