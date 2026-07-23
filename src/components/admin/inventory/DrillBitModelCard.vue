<script setup>
import { computed } from 'vue'
import { SquarePen, Trash2 } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  model: { type: Object, required: true },
  available: { type: Number, required: true },
  unitCount: { type: Number, required: true },
  price: { type: String, required: true },
})

const emit = defineEmits(['edit', 'delete'])

const specifications = computed(() =>
  [
    props.model.iadc_code && `IADC ${props.model.iadc_code}`,
    props.model.connection,
  ].filter(Boolean),
)
const catalogMeta = computed(() =>
  [props.model.product_line, props.model.sku].filter(Boolean).join(' | '),
)
const availabilityLabel = computed(() => `${props.available} available`)
const unitLabel = computed(
  () => `${props.unitCount} physical unit${props.unitCount === 1 ? '' : 's'}`,
)
const stockState = computed(() => {
  if (!props.available) {
    return {
      label: 'Out of stock',
      classes: 'bg-admin-danger-soft text-admin-danger',
    }
  }

  if (props.available === 1) {
    return {
      label: 'Low stock',
      classes: 'bg-admin-warning-soft text-admin-warning-strong',
    }
  }

  return {
    label: 'In stock',
    classes: 'bg-admin-success-soft text-admin-success',
  }
})
</script>

<template>
  <article
    class="flex min-h-full flex-col overflow-hidden rounded-panel border border-admin-border bg-admin-panel shadow-card transition-[transform,box-shadow] duration-interaction hover:-translate-y-[0.15rem] hover:shadow-raised motion-reduce:transform-none motion-reduce:transition-none"
  >
    <div class="flex flex-1 flex-col gap-4 p-4">
      <div class="grid grid-cols-12 gap-4 max-[640px]:gap-3">
        <div class="col-span-3">
          <div
            class="relative h-[4.25rem] w-full overflow-hidden rounded-button bg-model-placeholder max-[640px]:h-[3.75rem]"
          >
            <img
              v-if="model.imagePreview"
              :src="model.imagePreview"
              :alt="model.display_name"
              class="h-full w-full object-cover"
            />
            <span
              v-else
              class="grid h-full w-full place-content-center px-1 text-center font-bold leading-tight text-white"
              >{{ model.nominal_size
              }}<small class="text-[0.65rem]">in.</small></span
            >
            <span
              v-if="model.imagePreview"
              class="absolute inset-x-1 bottom-1 rounded-[0.25rem] bg-brand-navy/85 px-1 py-[0.1rem] text-center text-[0.61rem] font-bold text-white"
              >{{ model.nominal_size }} in.</span
            >
          </div>
        </div>

        <div class="col-span-9 flex min-w-0 flex-col">
          <h3 class="m-0 text-[1rem] font-bold leading-snug text-brand-navy">
            <button
              type="button"
              class="line-clamp-2 cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] text-inherit transition-colors duration-interaction hover:text-admin-link focus-visible:rounded-[0.2rem] focus-visible:outline-none focus-visible:shadow-focus-strong motion-reduce:transition-none"
              :aria-label="`Edit ${model.display_name}`"
              @click="emit('edit', model)"
            >
              {{ model.display_name }}
            </button>
          </h3>
          <p
            v-if="
              specifications.length ||
              model.circulation_type === 'reverse_circulation'
            "
            class="mb-0 mt-1 min-h-[1.25rem] text-[0.78rem] text-admin-subtle"
          >
            {{ specifications.join(' | ')
            }}<span
              v-if="model.circulation_type === 'reverse_circulation'"
              :class="specifications.length && 'ml-2'"
              class="inline-block rounded-[0.25rem] bg-admin-danger-tag px-[0.35rem] py-[0.14rem] text-[0.66rem] font-bold text-admin-danger"
              >R.C.</span
            >
          </p>
          <span v-else class="mt-1 min-h-[1.25rem]"></span>
          <p
            v-if="catalogMeta"
            class="mb-0 mt-1 min-h-[1.1rem] truncate text-[0.75rem] text-admin-muted"
            :title="catalogMeta"
          >
            {{ catalogMeta }}
          </p>
          <span v-else class="mt-1 min-h-[1.1rem]"></span>
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-3 rounded-control border border-admin-border bg-admin-panel-muted px-3 py-2.5"
      >
        <div>
          <span
            :class="[
              'inline-flex rounded-[0.25rem] px-1.5 py-[0.15rem] text-[0.68rem] font-bold',
              stockState.classes,
            ]"
            >{{ stockState.label }}</span
          >
          <p class="mb-0 mt-1 text-[0.72rem] text-admin-subtle">
            {{ availabilityLabel }} of {{ unitLabel }}
          </p>
        </div>
        <div class="text-right">
          <p
            class="m-0 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-admin-faint"
          >
            List price
          </p>
          <strong class="whitespace-nowrap text-[1rem] text-brand-navy">{{
            price
          }}</strong>
        </div>
      </div>
    </div>

    <footer
      class="flex items-center justify-between gap-2 border-t border-admin-border-model-action px-4 py-3"
    >
      <BaseButton
        :icon="SquarePen"
        variant="danger"
        size="sm"
        :elevated="false"
        @click="emit('edit', model)"
        >Edit details</BaseButton
      >
      <button
        type="button"
        class="inline-grid h-control-sm w-[2.25rem] cursor-pointer place-content-center rounded-button border border-transparent bg-transparent text-admin-danger transition-[background-color,border-color,color] duration-interaction hover:border-admin-danger-border hover:bg-admin-danger-soft focus-visible:outline-none focus-visible:shadow-focus-strong motion-reduce:transition-none"
        :aria-label="`Delete ${model.display_name}`"
        :title="`Delete ${model.display_name}`"
        @click="emit('delete', model)"
      >
        <Trash2 :size="16" aria-hidden="true" />
      </button>
    </footer>
  </article>
</template>
