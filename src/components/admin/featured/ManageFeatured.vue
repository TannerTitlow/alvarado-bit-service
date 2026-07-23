<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import FeaturedItem from './FeaturedItem.vue'
import FeaturedModal from './FeaturedModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const featuredItems = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingItem = ref(null)
const modalMode = ref('add')
const showDeleteModal = ref(false)
const deletingItemId = ref(null)
const savingMessage = ref('')
const MAX_IMAGE_DIMENSION = 2048
const TARGET_IMAGE_SIZE = 1.2 * 1024 * 1024
const dragState = ref({
  isDragging: false,
  draggedId: null,
  sourceIndex: null,
  targetIndex: null,
  dropPosition: null, // 'before' or 'after'
})

// Keep track of the current order for optimistic updates
const currentOrder = ref([])

// Fetch items from Supabase
const fetchItems = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('featured_items')
      .select('*')
      .order('order_index')

    if (error) throw error

    // Get signed URLs for all media
    const itemsWithSignedUrls = await Promise.all(
      data.map(async item => {
        const storagePath = getStoragePath(item.media_url)
        if (!storagePath)
          return { ...item, media_url: null, storage_path: null }

        const { data: signedData, error: signedUrlError } =
          await supabase.storage
            .from('featured-content')
            .createSignedUrl(storagePath, 60 * 60)

        if (signedUrlError) {
          console.error('Error creating featured media URL:', signedUrlError)
          return { ...item, media_url: null, storage_path: storagePath }
        }

        return {
          ...item,
          media_url: signedData.signedUrl,
          storage_path: storagePath,
        }
      }),
    )

    // Ensure all items have valid order_index
    featuredItems.value = itemsWithSignedUrls.map((item, index) => ({
      ...item,
      order_index: item.order_index ?? index,
    }))

    // Initialize current order after fetching
    currentOrder.value = featuredItems.value.map(item => item.id)
  } catch (error) {
    console.error('Error fetching featured items:', error)
    alert('Error fetching featured items')
  } finally {
    loading.value = false
  }
}

const getStoragePath = url => {
  if (!url) return null

  const marker = '/featured-content/'
  const path = url.includes(marker) ? url.split(marker)[1] : url
  return path.split('?')[0].split('#')[0]
}

const createWebpBlob = (canvas, quality) => {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality))
}

const optimizeImage = async file => {
  if (!file.type.startsWith('image/') || !('createImageBitmap' in window)) {
    return file
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const largestDimension = Math.max(bitmap.width, bitmap.height)
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / largestDimension)

    if (
      scale === 1 &&
      file.size <= TARGET_IMAGE_SIZE &&
      ['image/jpeg', 'image/webp'].includes(file.type)
    ) {
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    let quality = 0.84
    let blob = await createWebpBlob(canvas, quality)
    while (blob && blob.size > TARGET_IMAGE_SIZE && quality > 0.68) {
      quality -= 0.08
      blob = await createWebpBlob(canvas, quality)
    }

    if (!blob || (scale === 1 && blob.size >= file.size)) {
      return file
    }

    const filename = file.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${filename}.webp`, { type: 'image/webp' })
  } catch (error) {
    console.warn('Image optimization skipped:', error)
    return file
  } finally {
    bitmap?.close()
  }
}

const handleDragStart = (index, itemId) => {
  dragState.value = {
    isDragging: true,
    draggedId: itemId,
    sourceIndex: index,
    targetIndex: index,
  }
}

const handleDragOver = ({ index, position }) => {
  if (!dragState.value.isDragging) return

  const newTargetIndex = position === 'after' ? index + 1 : index

  if (newTargetIndex !== dragState.value.targetIndex) {
    dragState.value = {
      ...dragState.value,
      targetIndex: newTargetIndex,
      dropPosition: position,
    }
  }
}

const getItemDragState = (item, index) => {
  if (!dragState.value.isDragging) return {}

  const isDragged = item.id === dragState.value.draggedId
  const isTarget =
    index === dragState.value.targetIndex - 1 ||
    index === dragState.value.targetIndex

  return {
    isDragged,
    isDragTarget: isTarget && !isDragged,
    dropPosition: isTarget
      ? index === dragState.value.targetIndex - 1
        ? 'after'
        : 'before'
      : null,
  }
}

const handleDragEnd = async () => {
  if (!dragState.value.isDragging) return

  const sourceIndex = dragState.value.sourceIndex
  const targetIndex = dragState.value.targetIndex

  // Reset drag state
  dragState.value = {
    isDragging: false,
    draggedId: null,
    sourceIndex: null,
    targetIndex: null,
  }

  if (sourceIndex === targetIndex) return

  try {
    // Get current sorted items
    const items = [...featuredItems.value].sort(
      (a, b) => a.order_index - b.order_index,
    )

    // Remove dragged item and insert at new position
    const [draggedItem] = items.splice(sourceIndex, 1)
    items.splice(targetIndex, 0, draggedItem)

    // Create updates with new order indexes
    const updates = items.map((item, index) => ({
      id: item.id,
      type: item.type,
      description: item.description,
      media_url: item.storage_path ?? getStoragePath(item.media_url),
      order_index: index,
    }))

    // Update local state optimistically
    featuredItems.value = items.map((item, index) => ({
      ...item,
      order_index: index,
    }))

    // Update database
    const { error } = await supabase.from('featured_items').upsert(updates)

    if (error) throw error
  } catch (error) {
    console.error('Error updating order:', error)
    alert('Failed to update item order')
    // Refresh items from database on error
    await fetchItems()
  }
}

const handleMoveUp = async index => {
  if (index <= 0) return

  const items = [...featuredItems.value].sort(
    (a, b) => a.order_index - b.order_index,
  )
  const temp = items[index].order_index
  items[index].order_index = items[index - 1].order_index
  items[index - 1].order_index = temp

  // Update local state optimistically
  featuredItems.value = items

  try {
    // Update database
    const updates = [items[index], items[index - 1]].map(item => ({
      id: item.id,
      type: item.type,
      description: item.description,
      media_url: item.storage_path ?? getStoragePath(item.media_url),
      order_index: item.order_index,
    }))

    const { error } = await supabase.from('featured_items').upsert(updates)
    if (error) throw error
  } catch (error) {
    console.error('Error updating order:', error)
    alert('Failed to update item order')
    await fetchItems()
  }
}

const handleMoveDown = async index => {
  const items = [...featuredItems.value].sort(
    (a, b) => a.order_index - b.order_index,
  )
  if (index >= items.length - 1) return

  const temp = items[index].order_index
  items[index].order_index = items[index + 1].order_index
  items[index + 1].order_index = temp

  // Update local state optimistically
  featuredItems.value = items

  try {
    // Update database
    const updates = [items[index], items[index + 1]].map(item => ({
      id: item.id,
      type: item.type,
      description: item.description,
      media_url: item.storage_path ?? getStoragePath(item.media_url),
      order_index: item.order_index,
    }))

    const { error } = await supabase.from('featured_items').upsert(updates)
    if (error) throw error
  } catch (error) {
    console.error('Error updating order:', error)
    alert('Failed to update item order')
    await fetchItems()
  }
}

const sortedItems = computed(() => {
  if (!dragState.value.isDragging) {
    return [...featuredItems.value].sort(
      (a, b) => a.order_index - b.order_index,
    )
  }

  const items = [...featuredItems.value].sort(
    (a, b) => a.order_index - b.order_index,
  )
  const sourceIndex = dragState.value.sourceIndex
  const targetIndex = dragState.value.targetIndex

  if (sourceIndex === targetIndex) return items

  // Remove dragged item
  const [draggedItem] = items.splice(sourceIndex, 1)

  // Insert at new position
  items.splice(targetIndex, 0, draggedItem)

  return items
})

const deleteMediaFromStorage = async mediaUrl => {
  try {
    if (!mediaUrl) return

    const storagePath = getStoragePath(mediaUrl)
    if (!storagePath) return

    const { error } = await supabase.storage
      .from('featured-content')
      .remove([storagePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting media from storage:', error)
    throw error
  }
}

const uploadMedia = async file => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('featured-content')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    return filePath
  } catch (error) {
    console.error('Error uploading media:', error)
    throw error
  }
}

const handleAddItem = () => {
  modalMode.value = 'add'
  editingItem.value = null
  showModal.value = true
}

const handleEditItem = item => {
  modalMode.value = 'edit'
  editingItem.value = { ...item }
  showModal.value = true
}

const handleDeleteItem = itemId => {
  deletingItemId.value = itemId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    loading.value = true

    const itemToDelete = featuredItems.value.find(
      item => item.id === deletingItemId.value,
    )
    if (!itemToDelete) throw new Error('Item not found')

    // First delete the media from storage if it exists
    if (itemToDelete.media_url) {
      await deleteMediaFromStorage(itemToDelete.media_url)
    }

    // Then delete the item from the database
    const { error: dbError } = await supabase
      .from('featured_items')
      .delete()
      .eq('id', deletingItemId.value)

    if (dbError) throw dbError

    // Remove item from local state
    featuredItems.value = featuredItems.value.filter(
      item => item.id !== deletingItemId.value,
    )

    // Update order indexes after deletion
    const updatedItems = featuredItems.value.map((item, index) => ({
      id: item.id,
      type: item.type,
      description: item.description,
      media_url: item.storage_path ?? getStoragePath(item.media_url),
      order_index: index,
    }))

    // Update local state
    featuredItems.value = updatedItems

    // Update database with new order indexes
    const { error } = await supabase.from('featured_items').upsert(updatedItems)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting item:', error)
    alert('Error deleting item: ' + error.message)
  } finally {
    showDeleteModal.value = false
    deletingItemId.value = null
    loading.value = false
  }
}

const handleSaveItem = async itemData => {
  try {
    loading.value = true
    let mediaUrl = editingItem.value?.storage_path ?? null
    const previousMediaUrl =
      modalMode.value === 'edit' && itemData.file
        ? editingItem.value.storage_path
        : null

    if (itemData.file) {
      let fileToUpload = itemData.file
      if (itemData.type === 'image') {
        savingMessage.value = 'Optimizing image...'
        fileToUpload = await optimizeImage(itemData.file)
      }

      savingMessage.value = 'Uploading media...'
      mediaUrl = await uploadMedia(fileToUpload)
    }

    if (modalMode.value === 'add') {
      const maxOrder = Math.max(
        ...featuredItems.value.map(item => item.order_index),
        -1,
      )

      const { data, error } = await supabase
        .from('featured_items')
        .insert([
          {
            type: itemData.type,
            description: itemData.description,
            media_url: mediaUrl,
            order_index: maxOrder + 1,
          },
        ])
        .select()
        .single()

      if (error) throw error

      featuredItems.value = [...featuredItems.value, data]
    } else {
      const { data, error } = await supabase
        .from('featured_items')
        .update({
          type: itemData.type,
          description: itemData.description,
          media_url: mediaUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingItem.value.id)
        .select()
        .single()

      if (error) throw error

      featuredItems.value = featuredItems.value.map(item =>
        item.id === editingItem.value.id ? data : item,
      )

      if (previousMediaUrl) {
        await deleteMediaFromStorage(previousMediaUrl)
      }
    }

    showModal.value = false
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Error saving item')
  } finally {
    fetchItems()
    loading.value = false
    savingMessage.value = ''
  }
}

onMounted(fetchItems)
</script>

<template>
  <div class="p-4 min-[961px]:p-[clamp(1rem,2.5vw,2rem)]">
    <div
      class="mb-5 rounded-2xl border border-admin-border bg-admin-panel p-4 shadow-panel min-[961px]:p-[clamp(1rem,2.5vw,1.75rem)]"
    >
      <div
        class="mb-4 flex items-center justify-between max-[960px]:flex-col max-[960px]:items-stretch max-[960px]:gap-4"
      >
        <h2
          class="text-[clamp(1.35rem,2vw,1.75rem)] font-bold text-brand-navy max-[960px]:text-2xl"
        >
          Featured Carousel Items
        </h2>
        <BaseButton
          variant="danger"
          @click="handleAddItem"
          class="max-[960px]:w-full"
          >Add New Item</BaseButton
        >
      </div>

      <p class="text-[0.9rem] leading-[1.55] text-admin-subtle">
        Drag items by their handle to rearrange the order in the carousel.
        Changes will be reflected on the home page immediately.
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex animate-pulse flex-col items-center gap-4 rounded-panel border border-dashed border-[#c5d1e5] bg-admin-panel p-8 text-center text-admin-subtle shadow-toolbar"
    >
      <svg class="h-[50px] w-[50px] animate-spin" viewBox="0 0 50 50">
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
      <span>Loading featured items...</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="featuredItems.length === 0"
      class="flex flex-col items-center gap-4 rounded-panel border border-dashed border-[#c5d1e5] bg-admin-panel px-8 py-12 text-center text-admin-subtle shadow-toolbar"
    >
      <p>No featured items found. Click "Add New Item" to get started.</p>
    </div>

    <!-- Items Grid -->
    <TransitionGroup
      tag="div"
      class="relative grid min-h-[200px] grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4 max-[960px]:grid-cols-2 max-[960px]:p-3 max-sm:grid-cols-1 max-sm:p-0"
      :duration="{ move: 400 }"
      move-class="transition-transform duration-300 ease-emphasized"
      enter-active-class="transition-[opacity,transform,width] duration-300 ease-emphasized"
      leave-active-class="absolute w-[calc(100%-1.5rem)] transition-[opacity,transform,width] duration-300 ease-emphasized max-[960px]:w-[calc(100%-1rem)]"
      enter-from-class="scale-95 opacity-0"
      leave-to-class="scale-95 opacity-0"
    >
      <FeaturedItem
        v-for="(item, index) in sortedItems"
        :key="item.id"
        :item="item"
        :index="index"
        :isFirst="index === 0"
        :isLast="index === sortedItems.length - 1"
        v-bind="getItemDragState(item, index)"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        @dragover="handleDragOver"
        @moveUp="handleMoveUp"
        @moveDown="handleMoveDown"
        @edit="handleEditItem"
        @delete="handleDeleteItem"
        :style="{
          '--delay': `${index * 30}ms`,
          '--index': index,
        }"
      />
    </TransitionGroup>

    <!-- Add/Edit Modal -->
    <FeaturedModal
      v-if="showModal"
      :mode="modalMode"
      :item="editingItem"
      :saving="loading"
      :savingMessage="savingMessage"
      @close="showModal = false"
      @save="handleSaveItem"
    />
  </div>

  <!-- Delete Confirmation Modal -->
  <ConfirmModal
    v-if="showDeleteModal"
    message="Are you sure you want to remove this item from the featured carousel?"
    @confirm="confirmDelete"
    @cancel="showDeleteModal = false"
  />
</template>
