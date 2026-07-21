<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator(value) {
      return value.id && value.order_index !== undefined
    },
  },
  index: {
    type: Number,
    required: true,
  },
  isDragged: {
    type: Boolean,
    default: false,
  },
  isDragTarget: {
    type: Boolean,
    default: false,
  },
  dropPosition: {
    type: String,
    default: null,
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
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
  // Create a custom drag image element
  const dragImage = document.createElement('div')
  dragImage.style.cssText = `
    width: 40px;
    height: 40px;
    background: var(--navy-blue);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  `

  dragImage.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="1" fill="white" />
      <circle cx="12" cy="12" r="1" fill="white" />
      <circle cx="12" cy="17" r="1" fill="white" />
      <circle cx="7" cy="7" r="1" fill="white" />
      <circle cx="7" cy="12" r="1" fill="white" />
      <circle cx="7" cy="17" r="1" fill="white" />
      <circle cx="17" cy="7" r="1" fill="white" />
      <circle cx="17" cy="12" r="1" fill="white" />
      <circle cx="17" cy="17" r="1" fill="white" />
    </svg>
  `

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
  const mouseY = e.clientY - rect.top
  const isBottomHalf = mouseY > rect.height / 2

  emit('dragover', {
    index: props.index,
    position: isBottomHalf ? 'after' : 'before',
  })
}

const handleDragHandleMouseDown = () => {
  dragHandlePressed.value = true
}

const handleDragHandleMouseUp = () => {
  dragHandlePressed.value = false
}

const moveUp = () => {
  emit('moveUp', props.index)
}

const moveDown = () => {
  emit('moveDown', props.index)
}
</script>

<template>
  <div
    class="featured-item-shell"
    :class="{
      'is-dragged': isDragged,
      'is-drag-target': isDragTarget,
      'drop-before': dropPosition === 'before',
      'drop-after': dropPosition === 'after',
      'handle-pressed': dragHandlePressed,
    }"
    @dragover="handleDragOver"
    @dragenter.prevent
  >
    <div class="featured-item">
      <div class="item-content">
      <!-- Desktop Drag Handle -->
      <div
        class="drag-handle desktop-only"
        draggable="true"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        @mousedown="handleDragHandleMouseDown"
        @mouseup="handleDragHandleMouseUp"
        @mouseleave="handleDragHandleMouseUp"
        title="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="handle-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
          <circle cx="7" cy="7" r="1" fill="currentColor" />
          <circle cx="7" cy="12" r="1" fill="currentColor" />
          <circle cx="7" cy="17" r="1" fill="currentColor" />
          <circle cx="17" cy="7" r="1" fill="currentColor" />
          <circle cx="17" cy="12" r="1" fill="currentColor" />
          <circle cx="17" cy="17" r="1" fill="currentColor" />
        </svg>
      </div>

      <!-- Mobile Reorder Controls -->
      <div class="mobile-reorder mobile-only">
        <button
          class="reorder-btn up"
          @click="moveUp"
          :disabled="isFirst"
          title="Move up"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="reorder-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
        <button
          class="reorder-btn down"
          @click="moveDown"
          :disabled="isLast"
          title="Move down"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="reorder-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <!-- Media Container -->
      <div class="media-container">
        <img
          v-if="item.type === 'image'"
          :src="item.media_url"
          :alt="item.description"
          class="media-preview"
        />
        <video
          v-else
          :src="item.media_url"
          class="media-preview"
          controls
        ></video>
      </div>

      <!-- Item Details -->
        <div class="item-details">
        <p class="item-description">{{ item.description }}</p>
          <div class="item-metadata">
            <span class="type-badge" :class="item.type">
              {{ item.type === 'image' ? 'Image' : 'Video' }}
            </span>
          <span class="order-badge">Order: {{ item.order_index + 1 }}</span>
        </div>

        <div class="item-actions">
          <button @click="$emit('edit', item)" class="edit-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button @click="$emit('delete', item.id)" class="delete-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="action-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-item-shell {
  height: 100%;
  position: relative;
}

.featured-item {
  height: 100%;
  background: white;
  border-radius: 0.85rem;
  overflow: hidden;
  box-shadow: 0 0.6rem 1.5rem rgba(25, 42, 78, 0.06);
  will-change: transform;
  transition: border-color 220ms ease, box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  border: 1px solid #dce3ef;
}

.featured-item:hover {
  border-color: #c6d3e8;
  transform: translateY(-0.25rem);
  box-shadow: 0 1.1rem 2.2rem rgba(25, 42, 78, 0.14);
}

.featured-item-shell.is-dragged .featured-item {
  transform: scale(1.02);
  border-color: var(--navy-blue);
  z-index: 10;
}

.drag-handle {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: grab;
  box-shadow: 0 0.2rem 0.5rem rgba(10, 21, 48, 0.12);
  transition: background-color 180ms ease, box-shadow 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.drag-handle:hover {
  background: white;
  box-shadow: 0 0.45rem 0.9rem rgba(10, 21, 48, 0.18);
  transform: scale(1.06);
}

.featured-item-shell.is-dragged .drag-handle {
  cursor: grabbing;
}

.handle-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--navy-blue);
  pointer-events: none;
}

/* Media Container */
.media-container {
  position: relative;
  padding-top: 56.25%;
  background: #eaf0fb;
  overflow: hidden;
}

.media-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Item Details */
.item-details {
  display: flex;
  flex-direction: column;
  min-height: 10.5rem;
  padding: 1.1rem;
}

.item-description {
  color: #5d6b83;
  min-height: 3rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.item-metadata {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5eaf3;
}

.type-badge,
.order-badge {
  display: inline-block;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-family: var(--font-secondary);
  font-weight: 600;
  transition: background-color 180ms ease, box-shadow 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.featured-item:hover .type-badge,
.featured-item:hover .order-badge {
  box-shadow: 0 0.2rem 0.45rem rgba(25, 42, 78, 0.1);
  transform: translateY(-0.05rem);
}

.type-badge.image {
  background-color: #dbeafe;
  color: #1e40af;
}

.type-badge.video {
  background-color: #fce7f3;
  color: #9d174d;
}

.order-badge {
  background: #e9effb;
  border: 1px solid #cfdcf2;
  color: var(--navy-blue);
}

/* Action Buttons */
.item-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.action-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.edit-btn,
.delete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-family: var(--font-secondary);
  font-weight: 600;
  transition: background-color 180ms ease, box-shadow 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.edit-btn {
  background: var(--navy-blue);
  color: white;
}

.edit-btn:hover {
  background-color: #2a4073;
  box-shadow: 0 0.3rem 0.65rem rgba(27, 43, 82, 0.22);
  transform: translateY(-0.1rem);
}

.delete-btn {
  background: var(--patriot-red);
  color: white;
}

.delete-btn:hover {
  background-color: #c83a4d;
  box-shadow: 0 0.3rem 0.65rem rgba(178, 34, 52, 0.22);
  transform: translateY(-0.1rem);
}

/* Mobile Reorder Controls */
.mobile-reorder {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 10;
}

.reorder-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--navy-blue);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: background-color 180ms ease, box-shadow 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.reorder-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reorder-btn:not(:disabled):hover {
  background: white;
  box-shadow: 0 0.4rem 0.85rem rgba(10, 21, 48, 0.16);
  transform: scale(1.08);
}

.reorder-btn:not(:disabled):active {
  transform: scale(0.95);
}

.reorder-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Responsive Display */
.desktop-only {
  display: none;
}

.mobile-only {
  display: none;
}

@media (min-width: 769px) {
  .desktop-only {
    display: flex;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .item-details {
    min-height: 0;
  }

  .item-description {
    min-height: 0;
  }

  .item-actions {
    flex-direction: column;
  }

  .drag-handle {
    top: 1rem;
    left: 1rem;
  }

  .mobile-only {
    display: flex;
  }

  .item-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
