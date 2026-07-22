<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    required: true
  },
  item: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  },
  savingMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  type: 'image',
  description: '',
  media_url: '',
  file: null
})

const mediaPreview = ref(null)
const isClosing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref(null)

// Watch for item changes when editing
watch(() => props.item, (newItem) => {
  if (newItem) {
    formData.value = {
      type: newItem.type,
      description: newItem.description,
      media_url: newItem.media_url,
      file: null
    }
    mediaPreview.value = newItem.media_url
  }
}, { immediate: true })

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

const handleClose = () => {
  if (props.saving) return // Prevent closing while saving

  isClosing.value = true
  setTimeout(() => {
    emit('close')
  }, 150)
}

const validateFile = (file) => {
  const maxSize = formData.value.type === 'video' ? 50 : 100
  const maxBytes = maxSize * 1024 * 1024

  if (formData.value.type === 'image' && !file.type.startsWith('image/')) {
    alert('Please select an image file')
    return false
  }

  if (formData.value.type === 'video' && !file.type.startsWith('video/')) {
    alert('Please select a video file')
    return false
  }

  if (file.size > maxBytes) {
    alert(`${formData.value.type === 'image' ? 'Images' : 'Videos'} must be less than ${maxSize}MB`)
    return false
  }

  return true
}

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (validateFile(file)) {
    formData.value.file = file
    mediaPreview.value = URL.createObjectURL(file)
  }
}

const handleDragEnter = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false

  const file = e.dataTransfer.files[0]
  if (file && validateFile(file)) {
    formData.value.file = file
    mediaPreview.value = URL.createObjectURL(file)
  }
}

const validateForm = () => {
  if (!formData.value.description.trim()) {
    alert('Please enter a description')
    return false
  }

  if (!mediaPreview.value && !formData.value.file) {
    alert('Please select a media file')
    return false
  }

  return true
}

const handleSubmit = () => {
  if (!validateForm()) return

  emit('save', {
    ...formData.value,
    url: mediaPreview.value
  })
}

const openFilePicker = () => {
  if (!props.saving) fileInputRef.value?.click()
}

const changeMedia = () => {
  if (props.saving) return

  formData.value.file = null
  mediaPreview.value = props.item?.media_url || null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  openFilePicker()
}
</script>

<template>
  <div class="modal-backdrop" :class="{ 'modal-closing': isClosing }" @click="handleClose">
    <div class="modal-content" :class="{ 'modal-closing': isClosing }" @click.stop>
      <!-- Loading Overlay -->
      <div v-if="saving" class="saving-overlay">
        <div class="saving-content">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              stroke-width="5"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ savingMessage || (formData.file ? 'Uploading...' : 'Saving...') }}</span>
        </div>
      </div>

      <div class="modal-header">
        <h2 class="modal-title">
          {{ mode === 'add' ? 'Add Featured Item' : 'Edit Featured Item' }}
        </h2>
        <button class="close-button" @click="handleClose" aria-label="Close modal" :disabled="saving">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="featured-form">
        <div class="form-body">
          <!-- Media Type Selection -->
          <div class="form-group">
            <label for="type">Media Type</label>
            <select
              id="type"
              v-model="formData.type"
              :disabled="mode === 'edit'"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <!-- File Upload Area -->
          <div
            class="upload-area"
            :class="{ 'is-dragging': isDragging }"
            @dragenter="handleDragEnter"
            @dragover.prevent
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              :accept="formData.type === 'image' ? 'image/*' : 'video/*'"
              @change="handleFileChange"
              class="hidden-file-input"
            >

            <div v-if="!mediaPreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="upload-text">
                Drop your {{ formData.type }} here or
                <span class="browse-text" @click="openFilePicker">browse</span>
              </p>
              <p class="upload-hint">
                {{ formData.type === 'image'
                  ? 'Photos are optimized automatically before upload.'
                  : 'Maximum video size: 50MB' }}
              </p>
            </div>

            <!-- Media Preview -->
            <div v-else class="media-preview-container">
              <img
                v-if="formData.type === 'image'"
                :src="mediaPreview"
                alt="Preview"
                class="media-preview media-preview-button"
                role="button"
                tabindex="0"
                @click="openFilePicker"
                @keydown.enter.prevent="openFilePicker"
                @keydown.space.prevent="openFilePicker"
              >
              <video
                v-else
                :src="mediaPreview"
                controls
                class="media-preview"
              ></video>

              <button type="button" @click="changeMedia" class="clear-file-btn">
                Change {{ formData.type }}
              </button>
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              required
              placeholder="Enter a description for this featured item"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="handleClose" class="secondary-btn" :disabled="saving">
            Cancel
          </button>
          <button type="submit" class="save-btn" :disabled="saving">
            {{ mode === 'add' ? 'Add Item' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 21, 48, 0.58);
  backdrop-filter: blur(0.3rem);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 50;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 42rem;
  max-height: calc(100dvh - 2rem);
  display: flex;
  flex-direction: column;
  border: 1px solid #dce3ef;
  border-radius: 1rem;
  box-shadow: 0 1.5rem 4rem rgba(10, 21, 48, 0.28);
  overflow: hidden;
  position: relative;
}

.saving-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.saving-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--navy-blue);
  font-weight: 500;
}

.spinner {
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

.spinner circle {
  stroke: currentColor;
  stroke-dasharray: 150;
  stroke-dashoffset: 75;
  transform-origin: center;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 125;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -125;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid #dce3ef;
  background: linear-gradient(135deg, #ffffff, #f5f8fe);
}

.modal-title {
  color: var(--navy-blue);
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

.close-button {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  font-size: 1.35rem;
  background: #f7f9fd;
  border: 1px solid #dce3ef;
  border-radius: 0.55rem;
  cursor: pointer;
  color: #666;
  transition: color 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.close-button:hover:not(:disabled) {
  color: var(--navy-blue);
  transform: rotate(4deg);
}

.close-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.featured-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.form-body {
  padding: 1.35rem 1.5rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.15rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.45rem;
  font-family: var(--font-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--navy-blue);
}

select,
textarea {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid #ccd7ea;
  border-radius: 0.6rem;
  background: #fbfcff;
  font-size: 1rem;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

select:focus,
textarea:focus {
  outline: none;
  border-color: var(--navy-blue);
  box-shadow: 0 0 0 0.2rem rgba(27, 43, 82, 0.1);
}

.upload-area {
  min-height: 14rem;
  border: 1px dashed #afbed6;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: #f8faff;
  text-align: center;
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
}

.upload-area:hover,
.upload-area.is-dragging {
  border-color: var(--navy-blue);
  background: #f8fafc;
  box-shadow: 0 0.65rem 1.25rem rgba(25, 42, 78, 0.08);
  transform: translateY(-0.1rem);
}

.hidden-file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 12.5rem;
  justify-content: center;
  gap: 0.75rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: var(--navy-blue);
}

.upload-text {
  color: var(--steel-gray);
  font-size: 1rem;
}

.browse-text {
  color: var(--patriot-red);
  text-decoration: underline;
  cursor: pointer;
}

.upload-hint {
  color: var(--steel-gray);
  font-size: 0.875rem;
  opacity: 0.8;
}

.media-preview-container {
  position: relative;
  display: grid;
  min-height: 12.5rem;
  place-items: center;
  overflow: hidden;
  border-radius: 0.5rem;
  background: #edf2fa;
}

.media-preview {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 18rem;
  object-fit: contain;
  border-radius: 0.375rem;
}

.media-preview-button {
  cursor: pointer;
}

.clear-file-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(27, 43, 82, 0.9);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.clear-file-btn:hover {
  background: #2a4073;
  transform: translateY(-0.1rem);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #dce3ef;
  background: #f8faff;
}

.secondary-btn,
.save-btn {
  min-width: 6.5rem;
  padding: 0.7rem 1.1rem;
  border-radius: 0.6rem;
  font-family: var(--font-secondary);
  font-weight: 700;
  cursor: pointer;
  transition: background-color 180ms ease, box-shadow 180ms ease, filter 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.secondary-btn {
  background: white;
  border: 1px solid #ccd7ea;
  color: #52627b;
}

.secondary-btn:hover:not(:disabled) {
  border-color: var(--steel-gray);
  box-shadow: 0 0.3rem 0.65rem rgba(25, 42, 78, 0.1);
  transform: translateY(-0.1rem);
}

.save-btn {
  background: var(--patriot-red);
  color: white;
  border: none;
}

.save-btn:hover:not(:disabled) {
  background-color: #c83a4d;
  box-shadow: 0 0.35rem 0.75rem rgba(178, 34, 52, 0.22);
  transform: translateY(-0.1rem);
}

.secondary-btn:disabled,
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
    max-height: calc(100dvh - 1rem);
  }

  .upload-area {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }

  .modal-footer > button {
    flex: 1;
  }
}
</style>
