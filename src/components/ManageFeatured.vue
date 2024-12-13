<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import FeaturedItem from './FeaturedItem.vue'
import FeaturedModal from './FeaturedModal.vue'
import ConfirmModal from './ConfirmModal.vue'

const featuredItems = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingItem = ref(null)
const modalMode = ref('add')
const showDeleteModal = ref(false)
const deletingItemId = ref(null)
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
        if (item.media_url) {
          const filename = getFilenameFromUrl(item.media_url)
          const {
            data: { signedUrl },
          } = await supabase.storage
            .from('featured-content')
            .createSignedUrl(filename, 60 * 60)

          return {
            ...item,
            media_url: signedUrl,
          }
        }
        return item
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

const getFilenameFromUrl = url => {
  try {
    let filename = url.split('/').pop()
    filename = filename.split('?')[0]
    filename = filename.split('#')[0]
    return filename
  } catch (error) {
    console.error('Error extracting filename:', error)
    return null
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
      media_url: item.media_url,
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
      media_url: item.media_url,
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
      media_url: item.media_url,
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

    const filename = getFilenameFromUrl(mediaUrl)
    if (!filename) return

    const { error } = await supabase.storage
      .from('featured-content')
      .remove([filename])

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

    const {
      data: { publicUrl },
    } = supabase.storage.from('featured-content').getPublicUrl(filePath)

    return publicUrl
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
      media_url: item.media_url,
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
    let mediaUrl = itemData.url

    if (
      modalMode.value === 'edit' &&
      itemData.file &&
      editingItem.value.media_url
    ) {
      await deleteMediaFromStorage(editingItem.value.media_url)
    }

    if (itemData.file) {
      mediaUrl = await uploadMedia(itemData.file)
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
    }

    showModal.value = false
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Error saving item')
  } finally {
    fetchItems()
    loading.value = false
  }
}

onMounted(fetchItems)
</script>

<template>
  <div class="manage-featured">
    <div class="header-section">
      <div class="title-area">
        <h2>Featured Carousel Items</h2>
        <button @click="handleAddItem" class="add-item-btn">
          Add New Item
        </button>
      </div>

      <p class="help-text">
        Drag items by their handle to rearrange the order in the carousel.
        Changes will be reflected on the home page immediately.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
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
      <span>Loading featured items...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="featuredItems.length === 0" class="empty-state">
      <p>No featured items found. Click "Add New Item" to get started.</p>
    </div>

    <!-- Items Grid -->
    <TransitionGroup
      name="grid"
      tag="div"
      class="featured-grid"
      :duration="{ move: 400 }"
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

<style scoped>
.manage-featured {
  padding: 1.5rem;
}

.header-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.title-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title-area h2 {
  color: var(--navy-blue);
  font-size: 1.75rem;
  font-weight: 600;
}

.help-text {
  color: var(--steel-gray);
  font-size: 0.875rem;
}

.add-item-btn {
  background: var(--patriot-red);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.add-item-btn:hover {
  background-color: #8b1a28;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem;
  min-height: 200px;
  position: relative;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: var(--steel-gray);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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

/* Grid Transitions */
.grid-move {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.grid-leave-active {
  position: absolute;
  width: calc(100% - 1.5rem);
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Smooth width transitions for grid items */
.featured-grid > * {
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (max-width: 768px) {
  .manage-featured {
    padding: 1rem;
  }

  .header-section {
    padding: 1rem;
  }

  .title-area {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .title-area h2 {
    font-size: 1.5rem;
  }

  .add-item-btn {
    width: 100%;
  }

  .featured-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.75rem;
  }

  .grid-leave-active {
    width: calc(100% - 1rem);
  }
}

/* Loading Animation */
@keyframes loading-pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}

.loading-state {
  animation: loading-pulse 1.5s ease-in-out infinite;
}

/* Empty State Enhancement */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
}

.empty-state p {
  max-width: 400px;
  line-height: 1.5;
}
</style>
