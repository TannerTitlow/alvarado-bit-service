<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  isDragTarget: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'dragstart', 'dragover', 'drop'])

const handleDragStart = (e) => {
  // Set a translucent effect during drag
  e.dataTransfer.effectAllowed = 'move'

  // Add ghost image class and store original position
  const rect = e.target.getBoundingClientRect()
  e.target.classList.add('dragging')

  // Store the initial mouse offset
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  // Set drag image offset to match cursor position
  e.dataTransfer.setDragImage(e.target, offsetX, offsetY)

  emit('dragstart', e)
}

const handleDragEnd = (e) => {
  e.target.classList.remove('dragging')
}
</script>

<template>
  <div
    class="featured-item"
    :class="{
      'is-dragging': isDragging,
      'is-drag-target': isDragTarget,
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover.prevent
    @drop="$emit('drop', $event)"
  >
    <div class="drag-handle">
      <svg xmlns="http://www.w3.org/2000/svg" class="handle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
      </svg>
    </div>

    <!-- Drop Target Indicator -->
    <div class="drop-indicator">
      <svg xmlns="http://www.w3.org/2000/svg" class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      Drop here to reorder
    </div>

    <div class="media-container">
      <img
        v-if="item.type === 'image'"
        :src="item.media_url"
        :alt="item.description"
        class="media-preview"
      >
      <video
        v-else
        :src="item.media_url"
        class="media-preview"
        controls
      ></video>
    </div>

    <div class="item-content">
      <p class="item-description">{{ item.description }}</p>
      <div class="item-metadata">
        <span class="type-badge" :class="item.type">
          {{ item.type }}
        </span>
        <span class="order-badge">
          Order: {{ item.order_index + 1 }}
        </span>
      </div>

      <div class="item-actions">
        <button @click="$emit('edit', item)" class="edit-btn">
          <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button @click="$emit('delete', item.id)" class="delete-btn">
          <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-item {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;
  transform-origin: center center;
  will-change: transform, opacity, box-shadow;
}

.featured-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.featured-item.is-dragging {
  opacity: 0.7;
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.featured-item.is-drag-target {
  position: relative;
  transform: scale(1.02);
  box-shadow: 0 0 0 2px var(--patriot-red);
}

.featured-item.is-drag-target::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(178, 34, 52, 0.1);
  z-index: 1;
  pointer-events: none;
}

.drop-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  color: var(--patriot-red);
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
  pointer-events: none;
}

.is-drag-target .drop-indicator {
  opacity: 1;
}

.drop-icon {
  width: 2rem;
  height: 2rem;
  stroke: var(--patriot-red);
  margin-bottom: 0.5rem;
}

.handle-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--navy-blue);
}

.media-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: #f3f4f6;
}

.media-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  padding: 1rem;
}

.item-description {
  color: var(--steel-gray);
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.item-metadata {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.type-badge,
.order-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
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
  background: var(--navy-blue);
  color: white;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
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
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.edit-btn {
  background: var(--navy-blue);
  color: white;
}

.edit-btn:hover {
  background-color: #141e3c;
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.delete-btn:hover {
  background-color: #b91c1c;
}

@media (max-width: 768px) {
  .item-actions {
    flex-direction: column;
  }
}
</style>
