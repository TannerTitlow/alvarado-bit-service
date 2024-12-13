<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  mode: {
    type: String,
    required: true
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  title: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  image: null
})

const imagePreview = ref(null)
const showCropper = ref(false)
const cropperRef = ref(null)
const originalImage = ref(null)
const isClosing = ref(false)

onMounted(() => {
  if (props.product) {
    formData.value = {
      ...props.product,
      image_url: props.product.image_url
    }
    imagePreview.value = props.product.image_url
    if (props.product.image_url) {
      originalImage.value = props.product.image_url
    }
  }

  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

const handleClose = () => {
  isClosing.value = true
  setTimeout(() => {
    emit('close')
  }, 150)
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    originalImage.value = file
    const reader = new FileReader()
    reader.onload = () => {
      imagePreview.value = reader.result
      showCropper.value = true
    }
    reader.readAsDataURL(file)
  }
}

const cropImage = () => {
  if (!cropperRef.value) return

  const { coordinates, canvas } = cropperRef.value.getResult()

  canvas.toBlob((blob) => {
    const filename = originalImage.value instanceof File
      ? originalImage.value.name
      : 'cropped-image.jpg'

    const croppedFile = new File([blob], filename, {
      type: 'image/jpeg',
      lastModified: new Date().getTime()
    })

    formData.value.image = croppedFile
    imagePreview.value = URL.createObjectURL(croppedFile)
    showCropper.value = false
  }, 'image/jpeg', 0.9)
}

const toggleCropper = () => {
  if (imagePreview.value) {
    showCropper.value = !showCropper.value
  }
}

const cancelCrop = () => {
  showCropper.value = false
}

const handleSubmit = () => {
  if (!formData.value.title || !formData.value.description || !formData.value.price) {
    alert('Please fill in all required fields')
    return
  }

  emit('save', {
    ...formData.value,
    price: Number(formData.value.price)
  })
}
</script>

<template>
  <div class="modal-backdrop" :class="{ 'modal-closing': isClosing }" @click="handleClose">
    <div class="modal-content" :class="{ 'modal-closing': isClosing }" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ mode === 'add' ? 'Add New Product' : 'Edit Product' }}</h2>
        <button class="close-button" @click="handleClose" aria-label="Close modal">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="product-form">
        <div class="form-grid">
          <!-- Left Column - Basic Info -->
          <div class="form-section">
            <h3 class="section-title">Basic Information</h3>
            <div class="form-group">
              <label for="title">Title</label>
              <input
                type="text"
                id="title"
                v-model="formData.title"
                required
                placeholder="Enter product title"
              >
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="formData.description"
                required
                rows="3"
                placeholder="Enter product description"
              ></textarea>
            </div>

            <div class="form-fields-row">
              <div class="form-group">
                <label for="price">Price</label>
                <div class="price-input-wrapper">
                  <span class="price-symbol">$</span>
                  <input
                    type="number"
                    id="price"
                    v-model="formData.price"
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="category">Category</label>
                <select id="category" v-model="formData.category" required>
                  <option value="" disabled>Select category</option>
                  <option value="drill-bits">Drill Bits</option>
                  <option value="accessories">Accessories</option>
                  <option value="parts">Parts</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Right Column - Image -->
          <div class="form-section">
            <h3 class="section-title">Product Image</h3>
            <div class="image-upload-section">
              <div class="form-group">
                <label for="image" class="file-input-label">
                  Choose Image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  @change="handleImageChange"
                  class="hidden-file-input"
                >
              </div>

              <!-- Image Preview -->
              <div v-if="imagePreview && !showCropper" class="preview-container">
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="image-preview"
                >
                <button type="button" @click="toggleCropper" class="edit-image-btn">
                  Edit Image
                </button>
              </div>

              <!-- Image Cropper -->
              <div v-if="showCropper" class="cropper-wrapper">
                <Cropper
                  ref="cropperRef"
                  class="cropper"
                  :src="imagePreview"
                />
                <div class="cropper-actions">
                  <button type="button" @click="cropImage" class="crop-btn">
                    Apply Crop
                  </button>
                  <button type="button" @click="cancelCrop" class="secondary-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="handleClose" class="secondary-btn">
            Cancel
          </button>
          <button type="submit" class="save-btn">
            {{ mode === 'add' ? 'Add Product' : 'Save Changes' }}
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
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 50;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
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

.product-form {
  display: flex;
  flex-direction: column;
  height: calc(90vh - 60px);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1.5rem;
  overflow-y: auto;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.price-input-wrapper {
  position: relative;
}

.price-symbol {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

.price-input-wrapper input {
  padding-left: 1.5rem;
}

.file-input-label {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  cursor: pointer;
}

.hidden-file-input {
  display: none;
}

.preview-container {
  margin-top: 1rem;
  text-align: center;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  margin-bottom: 1rem;
}

.cropper-wrapper {
  margin-top: 1rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  overflow: hidden;
}

.cropper {
  height: 400px;
  background: #f3f4f6;
}

.cropper-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.secondary-btn, .crop-btn, .save-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
}

.secondary-btn {
  background: white;
  border: 1px solid #ddd;
}

.crop-btn, .save-btn {
  background: var(--patriot-red);
  color: white;
  border: none;
}

.edit-image-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .modal-content {
    height: calc(100vh - 2rem);
    max-height: calc(100vh - 2rem);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .cropper {
    height: 300px;
  }
}
</style>
