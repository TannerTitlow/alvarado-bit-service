<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import ProductItem from './ProductItem.vue'
import ProductModal from './ProductModal.vue'
import ConfirmModal from './ConfirmModal.vue'

// Replace the products ref with this:
const products = ref([])
const loading = ref(false)

// Filter and sort states
const categoryFilter = ref('all')
const searchQuery = ref('')
const sortBy = ref('newest')

const showModal = ref(false)
const editingProduct = ref(null)
const modalMode = ref('add') // 'add' or 'edit'

const showDeleteModal = ref(false)
const deletingProductId = ref(null)

// Metrics calculations
const totalProducts = computed(() => products.value.length)
const totalValue = computed(() =>
  products.value.reduce((sum, product) => sum + product.price, 0),
)
const categoryCounts = computed(() => {
  return products.value.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1
    return acc
  }, {})
})

// Filtered and sorted products
const filteredProducts = computed(() => {
  let filtered = [...products.value]

  // Category filter
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(p => p.category === categoryFilter.value)
  }

  // Search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query),
    )
  }

  // Sorting
  switch (sortBy.value) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'a-z':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'z-a':
      filtered.sort((a, b) => b.title.localeCompare(a.title))
      break
    default: // 'newest'
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return filtered
})

// Add these methods for Supabase operations:
const fetchProducts = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get signed URLs for all products
    const productsWithSignedUrls = await Promise.all(
      data.map(async product => {
        if (product.image_url) {
          // Extract filename from the URL
          const filename = product.image_url.split('/').pop()

          const {
            data: { signedUrl },
          } = await supabase.storage
            .from('product-images')
            .createSignedUrl(filename, 60 * 60) // 1 hour expiry

          return {
            ...product,
            image_url: signedUrl,
          }
        }
        return product
      }),
    )

    products.value = productsWithSignedUrls
  } catch (error) {
    console.error('Error fetching products:', error)
    alert('Error fetching products')
  } finally {
    loading.value = false
  }
}

const uploadImage = async file => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

const handleSaveProduct = async productData => {
  try {
    loading.value = true

    // If there's a new image file, upload it
    if (productData.image instanceof File) {
      const imageUrl = await uploadImage(productData.image)
      productData.image_url = imageUrl
    }

    if (modalMode.value === 'add') {
      const { error } = await supabase.from('products').insert([
        {
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image_url: productData.image_url,
        },
      ])

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('products')
        .update({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image_url: productData.image_url,
          updated_at: new Date(),
        })
        .eq('id', editingProduct.value.id)

      if (error) throw error
    }

    await fetchProducts()
    showModal.value = false
  } catch (error) {
    console.error('Error saving product:', error)
    alert('Error saving product')
  } finally {
    loading.value = false
  }
}

const handleDeleteProduct = productId => {
  deletingProductId.value = productId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    loading.value = true
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deletingProductId.value)

    if (error) throw error
    await fetchProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
    alert('Error deleting product')
  } finally {
    showDeleteModal.value = false
    deletingProductId.value = null
    loading.value = false
  }
}

const handleAddProduct = () => {
  modalMode.value = 'add'
  editingProduct.value = null
  showModal.value = true
}

const handleEditProduct = product => {
  modalMode.value = 'edit'
  editingProduct.value = { ...product }
  showModal.value = true
}

// Add onMounted hook to fetch products when component loads
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="manage-products">
    <!-- Title and Filters Section -->
    <div class="header-section">
      <div class="title-area">
        <h2>Product Catalog</h2>
        <button @click="handleAddProduct" class="add-product-btn">
          Add New Product
        </button>
      </div>

      <div class="filters-area">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search products..."
            class="search-input"
          />
        </div>

        <div class="filters">
          <select v-model="categoryFilter" class="filter-select">
            <option value="all">All Categories</option>
            <option value="drill-bits">Drill Bits</option>
            <option value="accessories">Accessories</option>
            <option value="parts">Parts</option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="a-z">Name: A to Z</option>
            <option value="z-a">Name: Z to A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Metrics Section -->
    <div class="metrics-section">
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Total Products</h3>
          <p class="metric-value">{{ totalProducts }}</p>
        </div>
        <div class="metric-card">
          <h3>Total Inventory Value</h3>
          <p class="metric-value">${{ totalValue.toLocaleString() }}</p>
        </div>
        <div class="metric-card">
          <h3>Categories</h3>
          <div class="category-list">
            <span
              v-for="(count, category) in categoryCounts"
              :key="category"
              class="category-tag"
            >
              {{ category }}: {{ count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">Loading products...</div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="empty-state">
      No products found. Click "Add New Product" to get started.
    </div>

    <!-- Products Grid -->
    <div v-else class="products-grid">
      <ProductItem
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @edit="handleEditProduct"
        @delete="handleDeleteProduct"
      />
    </div>

    <!-- Add/Edit Product Modal -->
    <ProductModal
      v-if="showModal"
      :mode="modalMode"
      :product="editingProduct"
      @close="showModal = false"
      @save="handleSaveProduct"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      message="Are you sure you want to delete this product?"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<style scoped>
.manage-products {
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
  margin-bottom: 1.5rem;
}

.title-area h2 {
  color: var(--navy-blue);
  font-size: 1.75rem;
  font-weight: 600;
}

.filters-area {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  font-size: 1rem;
  min-width: 180px;
}

.metrics-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e9ecef;
}

.metric-card h3 {
  color: var(--navy-blue);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--navy-blue);
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tag {
  background: var(--navy-blue);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.add-product-btn {
  background: var(--patriot-red);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.add-product-btn:hover {
  background-color: #8b1a28;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .manage-products {
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

  .filters-area {
    flex-direction: column;
  }

  .filters {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
