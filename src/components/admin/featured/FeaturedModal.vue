<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { CloudUpload, LoaderCircle, X } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'

const props = defineProps({
  mode: { type: String, required: true },
  item: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  savingMessage: { type: String, default: '' },
})
const emit = defineEmits(['close', 'save'])
const formData = ref({
  type: 'image',
  description: '',
  media_url: '',
  file: null,
})
const mediaPreview = ref(null)
const isClosing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref(null)
const mediaTypes = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
]

watch(
  () => props.item,
  newItem => {
    if (newItem) {
      formData.value = {
        type: newItem.type,
        description: newItem.description,
        media_url: newItem.media_url,
        file: null,
      }
      mediaPreview.value = newItem.media_url
    }
  },
  { immediate: true },
)
onMounted(() => {
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  document.body.style.overflow = ''
})
const handleClose = () => {
  if (props.saving) return
  isClosing.value = true
  setTimeout(() => emit('close'), 150)
}
const validateFile = file => {
  const maxSize = formData.value.type === 'video' ? 50 : 100
  if (!file.type.startsWith(`${formData.value.type}/`)) {
    alert(`Please select a ${formData.value.type} file`)
    return false
  }
  if (file.size > maxSize * 1024 * 1024) {
    alert(
      `${formData.value.type === 'image' ? 'Images' : 'Videos'} must be less than ${maxSize}MB`,
    )
    return false
  }
  return true
}
const setFile = file => {
  if (file && validateFile(file)) {
    formData.value.file = file
    mediaPreview.value = URL.createObjectURL(file)
  }
}
const handleFileChange = event => setFile(event.target.files?.[0])
const handleDragEnter = event => {
  event.preventDefault()
  isDragging.value = true
}
const handleDragLeave = event => {
  event.preventDefault()
  isDragging.value = false
}
const handleDrop = event => {
  event.preventDefault()
  isDragging.value = false
  setFile(event.dataTransfer.files[0])
}
const handleSubmit = () => {
  if (!formData.value.description.trim())
    return alert('Please enter a description')
  if (!mediaPreview.value && !formData.value.file)
    return alert('Please select a media file')
  emit('save', { ...formData.value, url: mediaPreview.value })
}
const openFilePicker = () => {
  if (!props.saving) fileInputRef.value?.click()
}
const changeMedia = () => {
  if (!props.saving) {
    formData.value.file = null
    mediaPreview.value = props.item?.media_url || null
    if (fileInputRef.value) fileInputRef.value.value = ''
    openFilePicker()
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-[#0a1530]/[.58] p-4 backdrop-blur-[0.3rem] transition-opacity duration-150"
    :class="{ 'opacity-0': isClosing }"
    @click="handleClose"
  >
    <div
      class="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[42rem] flex-col overflow-hidden rounded-2xl border border-admin-border bg-admin-panel shadow-[0_1.5rem_4rem_rgba(10,21,48,0.28)] transition-opacity duration-150 max-md:max-h-[calc(100dvh-1rem)]"
      :class="{ 'opacity-0': isClosing }"
      @click.stop
    >
      <div
        v-if="saving"
        class="absolute inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm"
      >
        <div
          class="flex flex-col items-center gap-4 font-medium text-brand-navy"
        >
          <LoaderCircle :size="50" class="animate-spin" aria-hidden="true" />
          <span>{{
            savingMessage || (formData.file ? 'Uploading...' : 'Saving...')
          }}</span>
        </div>
      </div>
      <header
        class="flex items-center justify-between border-b border-admin-border bg-gradient-to-br from-white to-[#f5f8fe] px-6 py-[1.15rem]"
      >
        <h2 class="text-[1.3rem] font-bold text-brand-navy">
          {{ mode === 'add' ? 'Add Featured Item' : 'Edit Featured Item' }}
        </h2>
        <button
          class="grid h-9 w-9 place-items-center rounded-button border border-admin-border bg-admin-panel-muted text-[#666] transition-colors duration-interaction hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close modal"
          :disabled="saving"
          @click="handleClose"
        >
          <X :size="20" aria-hidden="true" />
        </button>
      </header>
      <form class="flex min-h-0 flex-col" @submit.prevent="handleSubmit">
        <div class="overflow-y-auto px-6 py-[1.35rem]">
          <div class="mb-[1.15rem]">
            <label
              for="type"
              class="mb-[0.45rem] block font-secondary text-[0.78rem] font-bold uppercase tracking-[0.04em] text-brand-navy"
              >Media Type</label
            ><BaseDropdown
              id="type"
              v-model="formData.type"
              :options="mediaTypes"
              full-width
              :disabled="mode === 'edit'"
            />
          </div>
          <div
            class="mb-[1.15rem] min-h-56 cursor-pointer rounded-xl border border-dashed border-[#afbed6] bg-[#f8faff] p-3 text-center transition-[border-color,background-color,box-shadow,transform] duration-content ease-emphasized hover:-translate-y-px hover:border-brand-navy hover:bg-[#f8fafc] hover:shadow-[0_0.65rem_1.25rem_rgba(25,42,78,0.08)]"
            :class="{
              '-translate-y-px border-brand-navy bg-[#f8fafc] shadow-[0_0.65rem_1.25rem_rgba(25,42,78,0.08)]':
                isDragging,
            }"
            @dragenter="handleDragEnter"
            @dragover.prevent
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              class="hidden"
              :accept="formData.type === 'image' ? 'image/*' : 'video/*'"
              @change="handleFileChange"
            />
            <div
              v-if="!mediaPreview"
              class="flex min-h-[12.5rem] flex-col items-center justify-center gap-3"
            >
              <CloudUpload
                :size="48"
                class="text-brand-navy"
                aria-hidden="true"
              />
              <p class="text-base text-brand-steel">
                Drop your {{ formData.type }} here or
                <button
                  type="button"
                  class="text-brand-patriot underline"
                  @click="openFilePicker"
                >
                  browse
                </button>
              </p>
              <p class="text-sm text-brand-steel/80">
                {{
                  formData.type === 'image'
                    ? 'Photos are optimized automatically before upload.'
                    : 'Maximum video size: 50MB'
                }}
              </p>
            </div>
            <div
              v-else
              class="relative grid min-h-[12.5rem] place-items-center overflow-hidden rounded-lg bg-[#edf2fa]"
            >
              <img
                v-if="formData.type === 'image'"
                :src="mediaPreview"
                alt="Preview"
                class="block max-h-72 max-w-full cursor-pointer rounded-md object-contain"
                role="button"
                tabindex="0"
                @click="openFilePicker"
                @keydown.enter.prevent="openFilePicker"
                @keydown.space.prevent="openFilePicker"
              /><video
                v-else
                :src="mediaPreview"
                controls
                class="block max-h-72 max-w-full rounded-md object-contain"
              /><BaseButton
                class="absolute right-2 top-2"
                size="sm"
                :elevated="false"
                @click="changeMedia"
                >Change {{ formData.type }}</BaseButton
              >
            </div>
          </div>
          <div class="mb-[1.15rem]">
            <label
              for="description"
              class="mb-[0.45rem] block font-secondary text-[0.78rem] font-bold uppercase tracking-[0.04em] text-brand-navy"
              >Description</label
            ><BaseTextarea
              id="description"
              v-model="formData.description"
              full-width
              required
              placeholder="Enter a description for this featured item"
            />
          </div>
        </div>
        <footer
          class="flex justify-end gap-4 border-t border-admin-border bg-[#f8faff] px-6 py-4 max-md:px-4"
        >
          <BaseButton
            variant="secondary"
            :disabled="saving"
            class="min-w-[6.5rem] max-md:flex-1"
            @click="handleClose"
            >Cancel</BaseButton
          ><BaseButton
            type="submit"
            variant="danger"
            :disabled="saving"
            class="min-w-[6.5rem] max-md:flex-1"
            >{{ mode === 'add' ? 'Add Item' : 'Save Changes' }}</BaseButton
          >
        </footer>
      </form>
    </div>
  </div>
</template>
