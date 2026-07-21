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
  background: rgba(10, 21, 48, 0.52);
  backdrop-filter: blur(0.3rem);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 100;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 400px;
  border: 1px solid #dce3ef;
  border-radius: 0.9rem;
  box-shadow: 0 1.5rem 4rem rgba(10, 21, 48, 0.26);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dce3ef;
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
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid #dce3ef;
  border-radius: 0.5rem;
  background: #f7f9fd;
  cursor: pointer;
  color: #666;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.close-button:hover {
  background: #edf2fb;
  color: var(--navy-blue);
  transform: rotate(4deg);
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
  justify-content: flex-end;
  border-top: 1px solid #dce3ef;
  background: white;
}

.secondary-btn,
.delete-btn {
  padding: 0.7rem 1.1rem;
  border-radius: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, filter 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.secondary-btn {
  background: #f7f9fd;
  border: 1px solid #ccd7ea;
  color: var(--steel-gray);
}

.secondary-btn:hover {
  border-color: var(--steel-gray);
  box-shadow: 0 0.3rem 0.65rem rgba(25, 42, 78, 0.1);
  transform: translateY(-0.1rem);
}

.delete-btn {
  background: linear-gradient(135deg, #c02a3d, #9f1f31);
  color: white;
  border: none;
}

.delete-btn:hover {
  filter: brightness(1.12);
  box-shadow: 0 0.35rem 0.75rem rgba(178, 34, 52, 0.22);
  transform: translateY(-0.1rem);
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

  .modal-footer > button {
    flex: 1;
  }
}
</style>
