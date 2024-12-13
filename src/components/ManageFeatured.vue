<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import FeaturedItem from './FeaturedItem.vue'
import FeaturedModal from './FeaturedModal.vue'

const featuredItems = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingItem = ref(null)
const modalMode = ref('add')
const draggedItem = ref(null)
const dragTarget = ref(null)

// Sort items by order
const sortedItems = computed(() => {
  return [...featuredItems.value].sort((a, b) => a.order_index - b.order_index)
})

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
      data.map(async (item) => {
        if (item.media_url) {
          // Extract filename from the URL
          const filename = item.media_url.split('/').pop()
          const { data: { signedUrl } } = await supabase.storage
            .from('featured-content')
            .createSignedUrl(filename, 60 * 60) // 1 hour expiry

          return {
            ...item,
            media_url: signedUrl
          }
        }
        return item
      })
    )

    featuredItems.value = itemsWithSignedUrls
  } catch (error) {
    console.error('Error fetching featured items:', error)
    alert('Error fetching featured items')
  } finally {
    loading.value = false
  }
}

// Function to extract filename from media URL
const getFilenameFromUrl = (url) => {
  try {
    // First try to get the last segment of the path
    let filename = url.split('/').pop()

    // Remove any query parameters if present
    filename = filename.split('?')[0]

    // Remove any hash fragments
    filename = filename.split('#')[0]

    return filename
  } catch (error) {
    console.error('Error extracting filename:', error)
    return null
  }
}

// Function to delete media file from storage
const deleteMediaFromStorage = async (mediaUrl) => {
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

// Upload media file to Supabase storage
const uploadMedia = async (file) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('featured-content')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('featured-content')
      .getPublicUrl(filePath)

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

const handleEditItem = (item) => {
  modalMode.value = 'edit'
  editingItem.value = { ...item }
  showModal.value = true
}

const handleDeleteItem = async (itemId) => {
  if (!confirm('Are you sure you want to remove this item from the featured carousel?')) return

  try {
    loading.value = true

    // Get the item to find its media URL
    const itemToDelete = featuredItems.value.find(item => item.id === itemId)

    if (!itemToDelete) {
      throw new Error('Item not found')
    }

    // First delete the media file from storage
    if (itemToDelete.media_url) {
      await deleteMediaFromStorage(itemToDelete.media_url)
    }

    // Then delete the database record
    const { error: dbError } = await supabase
      .from('featured_items')
      .delete()
      .eq('id', itemId)

    if (dbError) throw dbError

    await fetchItems()
  } catch (error) {
    console.error('Error deleting item:', error)
    alert('Error deleting item: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSaveItem = async (itemData) => {
  try {
    loading.value = true
    let mediaUrl = itemData.url

    // If editing and there's a new file, delete the old one first
    if (modalMode.value === 'edit' && itemData.file && editingItem.value.media_url) {
      await deleteMediaFromStorage(editingItem.value.media_url)
    }

    // If there's a new file, upload it
    if (itemData.file) {
      mediaUrl = await uploadMedia(itemData.file)
    }

    if (modalMode.value === 'add') {
      // Get the highest order_index and add 1
      const maxOrder = Math.max(...featuredItems.value.map(item => item.order_index), -1)

      const { error } = await supabase
        .from('featured_items')
        .insert([{
          type: itemData.type,
          description: itemData.description,
          media_url: mediaUrl,
          order_index: maxOrder + 1
        }])

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('featured_items')
        .update({
          type: itemData.type,
          description: itemData.description,
          media_url: mediaUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingItem.value.id)

      if (error) throw error
    }

    await fetchItems()
    showModal.value = false
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Error saving item')
  } finally {
    loading.value = false
  }
}

const handleDragStart = (item) => {
  draggedItem.value = item
}

const handleDragEnter = (targetItem) => {
  if (targetItem.id !== draggedItem.value?.id) {
    dragTarget.value = targetItem
  }
}

const handleDragLeave = () => {
  dragTarget.value = null
}

const handleDrop = async (targetItem) => {
  if (!draggedItem.value || draggedItem.value.id === targetItem.id) return

  try {
    loading.value = true
    const draggedOrder = draggedItem.value.order_index
    const targetOrder = targetItem.order_index

    // Update the orders in database
    if (draggedOrder < targetOrder) {
      const { error: batchError } = await supabase
        .from('featured_items')
        .update({ order_index: draggedOrder })
        .eq('order_index', targetOrder)

      if (batchError) throw batchError

      const { error } = await supabase
        .from('featured_items')
        .update({ order_index: targetOrder })
        .eq('id', draggedItem.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('featured_items')
        .update({ order_index: targetOrder })
        .eq('id', draggedItem.value.id)

      if (error) throw error

      const { error: batchError } = await supabase
        .from('featured_items')
        .update({ order_index: draggedOrder })
        .eq('order_index', targetOrder)

      if (batchError) throw batchError
    }

    await fetchItems()
  } catch (error) {
    console.error('Error updating order:', error)
    alert('Error updating order')
  } finally {
    loading.value = false
    draggedItem.value = null
    dragTarget.value = null
  }
}

// Add a new function to ensure order indexes are sequential
const reorderAllItems = async () => {
  try {
    // Get all items sorted by current order
    const { data: items, error } = await supabase
      .from('featured_items')
      .select('id, order_index')
      .order('order_index')

    if (error) throw error

    // Update each item with its new sequential index
    for (let i = 0; i < items.length; i++) {
      const { error: updateError } = await supabase
        .from('featured_items')
        .update({ order_index: i })
        .eq('id', items[i].id)

      if (updateError) throw updateError
    }
  } catch (error) {
    console.error('Error reordering items:', error)
  }
}

onMounted(async () => {
  await reorderAllItems()
  await fetchItems()
})
</script>

<template>
  <!-- Template remains the same as before -->
  <div class="manage-featured">
    <div class="header-section">
      <div class="title-area">
        <h2>Featured Carousel Items</h2>
        <button @click="handleAddItem" class="add-item-btn">
          Add New Item
        </button>
      </div>

      <p class="help-text">
        Drag and drop items to rearrange their order in the carousel.
        Changes will be reflected on the home page.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      Loading featured items...
    </div>

    <!-- Empty State -->
    <div v-else-if="featuredItems.length === 0" class="empty-state">
      No featured items found. Click "Add New Item" to get started.
    </div>

    <!-- Items Grid -->
    <div v-else class="featured-grid">
    <FeaturedItem
      v-for="item in sortedItems"
      :key="item.id"
      :item="item"
      :is-dragging="draggedItem?.id === item.id"
      :is-drag-target="dragTarget?.id === item.id"
      draggable="true"
      @dragstart="handleDragStart(item)"
      @dragenter="handleDragEnter(item)"
      @dragleave="handleDragLeave"
      @dragover.prevent
      @drop="handleDrop(item)"
      @edit="handleEditItem"
      @delete="handleDeleteItem"
    />
  </div>

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
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  }

  .add-item-btn {
    width: 100%;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }
}
</style>
