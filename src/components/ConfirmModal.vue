<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Delete',
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: 'Delete',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const isClosing = ref(false)

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

const handleClose = () => {
  isClosing.value = true
  setTimeout(() => {
    emit('cancel')
  }, 150)
}

const handleConfirm = () => {
  isClosing.value = true
  setTimeout(() => {
    emit('confirm')
  }, 150)
}
</script>

<template>
  <div
    class="modal-backdrop"
    :class="{ 'modal-closing': isClosing }"
    @click="handleClose"
  >
    <div
      class="modal-content"
      :class="{ 'modal-closing': isClosing }"
      @click.stop
    >
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button
          class="close-button"
          @click="handleClose"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      <div class="modal-body">
        <p class="confirm-message">{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="secondary-btn">
          {{ cancelText }}
        </button>
        <button @click="handleConfirm" class="delete-btn">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 100;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  color: var(--navy-blue);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  padding: 0.5rem;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.confirm-message {
  color: var(--steel-gray);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.secondary-btn,
.delete-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn {
  background: white;
  border: 1px solid #ddd;
  color: var(--steel-gray);
}

.secondary-btn:hover {
  border-color: var(--steel-gray);
}

.delete-btn {
  background: #dc2626;
  color: white;
  border: none;
}

.delete-btn:hover {
  background-color: #b91c1c;
}

.modal-closing {
  animation: fadeOut 0.15s ease-out forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .modal-content {
    margin: 0 1rem;
  }
}
</style>
