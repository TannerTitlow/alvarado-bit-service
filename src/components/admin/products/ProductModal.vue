<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  mode: {
    type: String,
    required: true,
  },
  product: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  title: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  image: null,
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
      image_url: props.product.image_url,
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

const handleImageChange = event => {
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

  canvas.toBlob(
    blob => {
      const filename =
        originalImage.value instanceof File
          ? originalImage.value.name
          : 'cropped-image.jpg'

      const croppedFile = new File([blob], filename, {
        type: 'image/jpeg',
        lastModified: new Date().getTime(),
      })

      formData.value.image = croppedFile
      imagePreview.value = URL.createObjectURL(croppedFile)
      showCropper.value = false
    },
    'image/jpeg',
    0.9,
  )
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
  if (
    !formData.value.title ||
    !formData.value.description ||
    !formData.value.price
  ) {
    alert('Please fill in all required fields')
    return
  }

  emit('save', {
    ...formData.value,
    price: Number(formData.value.price),
  })
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
        <h2 class="modal-title">
          {{ mode === 'add' ? 'Add New Product' : 'Edit Product' }}
        </h2>
        <button
          class="close-button"
          @click="handleClose"
          aria-label="Close modal"
        >
          ×
        </button>
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
              />
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
                  />
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
                />
              </div>

              <!-- Image Preview -->
              <div
                v-if="imagePreview && !showCropper"
                class="preview-container"
              >
                <img :src="imagePreview" alt="Preview" class="image-preview" />
                <button
                  type="button"
                  @click="toggleCropper"
                  class="edit-image-btn"
                >
                  Edit Image
                </button>
              </div>

              <!-- Image Cropper -->
              <div v-if="showCropper" class="cropper-wrapper">
                <Cropper ref="cropperRef" class="cropper" :src="imagePreview" />
                <div class="cropper-actions">
                  <button type="button" @click="cropImage" class="crop-btn">
                    Apply Crop
                  </button>
                  <button
                    type="button"
                    @click="cancelCrop"
                    class="secondary-btn"
                  >
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
  background: rgba(10, 21, 48, 0.52);
  backdrop-filter: blur(0.3rem);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 50;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 58rem;
  max-height: calc(100dvh - 2rem);
  display: flex;
  flex-direction: column;
  border: 1px solid #dce3ef;
  border-radius: 1rem;
  box-shadow: 0 1.5rem 4rem rgba(10, 21, 48, 0.26);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dce3ef;
  background: linear-gradient(135deg, #ffffff, #f5f8fe);
}

.modal-title {
  color: var(--navy-blue);
  font-size: 1.25rem;
  font-weight: 700;
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
  transition:
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.close-button:hover {
  background: #edf2fb;
  color: var(--navy-blue);
  transform: rotate(4deg);
}

.product-form {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.form-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
  padding: 1.35rem 1.5rem;
  overflow-y: auto;
  min-height: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.1rem;
  border: 1px solid #e0e7f2;
  border-radius: 0.8rem;
  background: #fcfdff;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--navy-blue);
  font-family: var(--font-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

input,
select,
textarea {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid #ccd7ea;
  border-radius: 0.6rem;
  background: #fbfcff;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #8fa7d1;
  background: white;
  box-shadow: 0 0 0 0.2rem rgba(27, 43, 82, 0.1);
  outline: none;
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 7rem;
  padding: 1rem;
  background: #f5f8fe;
  border: 1px dashed #afbed6;
  border-radius: 0.6rem;
  color: var(--navy-blue);
  font-family: var(--font-secondary);
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease,
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.file-input-label:hover {
  background: #dbe6f8;
  box-shadow: 0 0.3rem 0.65rem rgba(27, 43, 82, 0.12);
  transform: translateY(-0.1rem);
}

.hidden-file-input {
  display: none;
}

.preview-container {
  position: relative;
  display: grid;
  min-height: 13rem;
  margin-top: 0.75rem;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e0e7f2;
  border-radius: 0.65rem;
  background: #eef2f8;
}

.image-preview {
  display: block;
  max-width: calc(100% - 1.5rem);
  max-height: 16rem;
  object-fit: contain;
}

.cropper-wrapper {
  margin-top: 0.75rem;
  background: #eef2f8;
  border: 1px solid #e0e7f2;
  border-radius: 0.65rem;
  overflow: hidden;
}

.cropper {
  height: 400px;
  background: #f3f4f6;
}

.cropper-actions {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8faff;
  border-top: 1px solid #dce3ef;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  justify-content: flex-end;
  border-top: 1px solid #dce3ef;
  background: #f8faff;
}

.secondary-btn,
.crop-btn,
.save-btn {
  min-width: 6.5rem;
  padding: 0.7rem 1.1rem;
  border-radius: 0.6rem;
  font-family: var(--font-secondary);
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.secondary-btn {
  background: #f7f9fd;
  border: 1px solid #ccd7ea;
}

.crop-btn,
.save-btn {
  background: linear-gradient(135deg, #c02a3d, #9f1f31);
  color: white;
  border: none;
}

.edit-image-btn {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  padding: 0.5rem 0.85rem;
  background: #e9effb;
  border: 1px solid #cfdcf2;
  border-radius: 0.6rem;
  color: var(--navy-blue);
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.secondary-btn:hover,
.edit-image-btn:hover {
  background: #e7edf8;
  box-shadow: 0 0.3rem 0.65rem rgba(27, 43, 82, 0.1);
  transform: translateY(-0.1rem);
}

.crop-btn:hover,
.save-btn:hover {
  filter: brightness(1.12);
  box-shadow: 0 0.35rem 0.75rem rgba(178, 34, 52, 0.22);
  transform: translateY(-0.1rem);
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

  .form-grid {
    padding: 1rem;
  }

  .form-section {
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
