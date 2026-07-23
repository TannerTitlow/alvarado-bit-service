<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { ChevronDown, ChevronUp, Grip, SquarePen, Trash2 } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator: value => value.id && value.order_index !== undefined,
  },
  index: { type: Number, required: true },
  isDragged: { type: Boolean, default: false },
  isDragTarget: { type: Boolean, default: false },
  dropPosition: { type: String, default: null },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
})

const lastDragOverTime = ref(0)
const dragHandlePressed = ref(false)
const emit = defineEmits([
  'dragstart',
  'dragend',
  'dragover',
  'edit',
  'delete',
  'moveUp',
  'moveDown',
])

const handleDragStart = e => {
  const dragImage = document.createElement('div')
  dragImage.style.cssText =
    'width:40px;height:40px;background:var(--navy-blue);border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 8px rgba(0,0,0,.2)'
  dragImage.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="1" fill="white"/><circle cx="12" cy="12" r="1" fill="white"/><circle cx="12" cy="17" r="1" fill="white"/><circle cx="7" cy="7" r="1" fill="white"/><circle cx="7" cy="12" r="1" fill="white"/><circle cx="7" cy="17" r="1" fill="white"/><circle cx="17" cy="7" r="1" fill="white"/><circle cx="17" cy="12" r="1" fill="white"/><circle cx="17" cy="17" r="1" fill="white"/></svg>'
  document.body.appendChild(dragImage)
  e.dataTransfer.setDragImage(dragImage, 20, 20)
  setTimeout(() => document.body.removeChild(dragImage), 0)
  emit('dragstart', props.index, props.item.id)
}
const handleDragEnd = () => {
  dragHandlePressed.value = false
  emit('dragend')
}
const handleDragOver = e => {
  e.preventDefault()
  const now = Date.now()
  if (now - lastDragOverTime.value < 50) return
  lastDragOverTime.value = now
  const rect = e.currentTarget.getBoundingClientRect()
  emit('dragover', {
    index: props.index,
    position: e.clientY - rect.top > rect.height / 2 ? 'after' : 'before',
  })
}
const handleDragHandleMouseDown = () => {
  dragHandlePressed.value = true
}
const handleDragHandleMouseUp = () => {
  dragHandlePressed.value = false
}
const moveUp = () => emit('moveUp', props.index)
const moveDown = () => emit('moveDown', props.index)
</script>

<template>
  <div
    class="group relative h-full"
    :class="{ 'z-10': isDragged }"
    @dragover="handleDragOver"
    @dragenter.prevent
  >
    <div
      class="relative h-full overflow-hidden rounded-panel border border-admin-border bg-admin-panel shadow-card transition-[border-color,box-shadow,transform] duration-[320ms] ease-emphasized will-change-transform hover:-translate-y-1 hover:border-[#c6d3e8] hover:shadow-raised"
      :class="{ 'scale-[1.02] border-brand-navy': isDragged }"
    >
      <div
        class="absolute left-3 top-3 z-10 hidden h-10 w-10 cursor-grab items-center justify-center rounded-[6px] bg-white/95 p-2 shadow-[0_0.2rem_0.5rem_rgba(10,21,48,0.12)] transition-[background-color,box-shadow,transform] duration-interaction ease-emphasized hover:scale-105 hover:bg-white hover:shadow-[0_0.45rem_0.9rem_rgba(10,21,48,0.18)] active:cursor-grabbing md:flex"
        draggable="true"
        title="Drag to reorder"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        @mousedown="handleDragHandleMouseDown"
        @mouseup="handleDragHandleMouseUp"
        @mouseleave="handleDragHandleMouseUp"
      >
        <Grip
          :size="20"
          class="pointer-events-none text-brand-navy"
          aria-hidden="true"
        />
      </div>
      <div
        class="absolute right-3 top-3 z-10 hidden flex-col gap-1 max-md:flex"
      >
        <button
          class="flex h-10 w-10 items-center justify-center rounded-[6px] bg-white/95 text-brand-navy shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition-[background-color,box-shadow,transform] duration-interaction ease-emphasized enabled:hover:scale-[1.08] enabled:hover:bg-white enabled:hover:shadow-[0_0.4rem_0.85rem_rgba(10,21,48,0.16)] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isFirst"
          title="Move up"
          @click="moveUp"
        >
          <ChevronUp :size="20" aria-hidden="true" />
        </button>
        <button
          class="flex h-10 w-10 items-center justify-center rounded-[6px] bg-white/95 text-brand-navy shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition-[background-color,box-shadow,transform] duration-interaction ease-emphasized enabled:hover:scale-[1.08] enabled:hover:bg-white enabled:hover:shadow-[0_0.4rem_0.85rem_rgba(10,21,48,0.16)] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLast"
          title="Move down"
          @click="moveDown"
        >
          <ChevronDown :size="20" aria-hidden="true" />
        </button>
      </div>
      <div class="relative overflow-hidden bg-admin-panel-tab pt-[56.25%]">
        <img
          v-if="item.type === 'image'"
          :src="item.media_url"
          :alt="item.description"
          class="absolute inset-0 h-full w-full object-cover"
        /><video
          v-else
          :src="item.media_url"
          class="absolute inset-0 h-full w-full object-cover"
          controls
        />
      </div>
      <div class="flex min-h-[10.5rem] flex-col p-[1.1rem] max-md:min-h-0">
        <p
          class="mb-3 min-h-12 line-clamp-2 text-sm leading-6 text-admin-subtle max-md:min-h-0"
        >
          {{ item.description }}
        </p>
        <div
          class="mb-3 flex items-center justify-between gap-3 border-t border-admin-border-subtle pt-3"
        >
          <span
            class="inline-block rounded-full px-[0.55rem] py-[0.3rem] font-secondary text-xs font-semibold transition-[box-shadow,transform] duration-interaction ease-emphasized group-hover:-translate-y-[0.05rem] group-hover:shadow-[0_0.2rem_0.45rem_rgba(25,42,78,0.1)]"
            :class="
              item.type === 'image'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-pink-100 text-pink-800'
            "
            >{{ item.type === 'image' ? 'Image' : 'Video' }}</span
          >
          <span
            class="inline-block rounded-full border border-[#cfdcf2] bg-[#e9effb] px-[0.55rem] py-[0.3rem] font-secondary text-xs font-semibold text-brand-navy transition-[box-shadow,transform] duration-interaction ease-emphasized group-hover:-translate-y-[0.05rem] group-hover:shadow-[0_0.2rem_0.45rem_rgba(25,42,78,0.1)]"
            >Order: {{ item.order_index + 1 }}</span
          >
        </div>
        <div class="mt-auto flex gap-2 max-md:flex-col">
          <BaseButton
            class="flex-1"
            :icon="SquarePen"
            variant="primary"
            size="sm"
            @click="$emit('edit', item)"
            >Edit</BaseButton
          ><BaseButton
            class="flex-1"
            :icon="Trash2"
            variant="danger"
            size="sm"
            @click="$emit('delete', item.id)"
            >Delete</BaseButton
          >
        </div>
      </div>
    </div>
  </div>
</template>
