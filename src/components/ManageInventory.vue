<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const inventory = ref([])
const loading = ref(false)
const savingId = ref(null)
const errorMessage = ref('')
const searchQuery = ref('')
const categoryFilter = ref('all')

const totalUnits = computed(() =>
  inventory.value.reduce((total, item) => total + item.quantity, 0),
)
const inventoryValue = computed(() =>
  inventory.value.reduce((total, item) => total + item.price * item.quantity, 0),
)
const lowStockItems = computed(() =>
  inventory.value.filter(item => item.quantity <= item.reorder_point).length,
)
const filteredInventory = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return inventory.value.filter(item => {
    const matchesCategory = categoryFilter.value === 'all' || item.category === categoryFilter.value
    const matchesSearch = !query || item.title.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })
})

const fetchInventory = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, category, price, product_inventory(quantity, reorder_point, updated_at)')
      .order('title')

    if (error) throw error

    inventory.value = data.map(product => {
      const stock = product.product_inventory?.[0] ?? {}
      return {
        ...product,
        price: Number(product.price),
        quantity: stock.quantity ?? 0,
        reorder_point: stock.reorder_point ?? 0,
      }
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    errorMessage.value = 'Inventory could not be loaded. Run the inventory SQL in Supabase, then refresh this page.'
  } finally {
    loading.value = false
  }
}

const saveInventory = async item => {
  const quantity = Math.max(0, Number.parseInt(item.quantity, 10) || 0)
  const reorderPoint = Math.max(0, Number.parseInt(item.reorder_point, 10) || 0)
  savingId.value = item.id

  try {
    const { error } = await supabase
      .from('product_inventory')
      .upsert({ product_id: item.id, quantity, reorder_point: reorderPoint }, { onConflict: 'product_id' })

    if (error) throw error

    item.quantity = quantity
    item.reorder_point = reorderPoint
  } catch (error) {
    console.error('Error saving inventory:', error)
    errorMessage.value = 'Inventory could not be saved. Please try again.'
  } finally {
    savingId.value = null
  }
}

const adjustQuantity = (item, amount) => {
  item.quantity = Math.max(0, item.quantity + amount)
  saveInventory(item)
}

onMounted(fetchInventory)
</script>

<template>
  <section class="manage-inventory">
    <div class="header-section">
      <div>
        <h2>Inventory</h2>
        <p>Track stock for catalog products without adding duplicate listings.</p>
      </div>
      <button class="refresh-btn" type="button" @click="fetchInventory">Refresh inventory</button>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <span>Total Units</span>
        <strong>{{ totalUnits.toLocaleString() }}</strong>
      </div>
      <div class="metric-card">
        <span>Inventory Value</span>
        <strong>${{ inventoryValue.toLocaleString() }}</strong>
      </div>
      <div class="metric-card" :class="{ attention: lowStockItems > 0 }">
        <span>At or Below Reorder Point</span>
        <strong>{{ lowStockItems }}</strong>
      </div>
    </div>

    <div class="filter-bar">
      <input v-model="searchQuery" type="search" placeholder="Search catalog products" aria-label="Search catalog products">
      <select v-model="categoryFilter" aria-label="Filter inventory by category">
        <option value="all">All Categories</option>
        <option value="drill-bits">Drill Bits</option>
        <option value="accessories">Accessories</option>
        <option value="parts">Parts</option>
      </select>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <div v-else-if="loading" class="state-message">Loading inventory...</div>
    <div v-else-if="inventory.length === 0" class="state-message">Add products to the catalog before managing inventory.</div>
    <div v-else-if="filteredInventory.length === 0" class="state-message">No catalog products match these filters.</div>

    <div v-else class="inventory-table-wrap">
      <table class="inventory-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Unit Price</th>
            <th scope="col">In Stock</th>
            <th scope="col">Reorder At</th>
            <th scope="col">Stock Value</th>
            <th scope="col"><span class="sr-only">Save inventory</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredInventory" :key="item.id">
            <td data-label="Product">
              <strong>{{ item.title }}</strong>
              <span class="category-label">{{ item.category }}</span>
            </td>
            <td data-label="Unit Price">${{ item.price.toLocaleString() }}</td>
            <td data-label="In Stock">
              <div class="quantity-control">
                <button type="button" :disabled="item.quantity === 0 || savingId === item.id" :aria-label="`Remove one ${item.title}`" @click="adjustQuantity(item, -1)">-</button>
                <input v-model.number="item.quantity" type="number" min="0" :aria-label="`${item.title} quantity`" @change="saveInventory(item)">
                <button type="button" :disabled="savingId === item.id" :aria-label="`Add one ${item.title}`" @click="adjustQuantity(item, 1)">+</button>
              </div>
            </td>
            <td data-label="Reorder At">
              <input v-model.number="item.reorder_point" class="reorder-input" type="number" min="0" :aria-label="`${item.title} reorder point`" @change="saveInventory(item)">
            </td>
            <td data-label="Stock Value">${{ (item.price * item.quantity).toLocaleString() }}</td>
            <td class="save-cell">
              <button class="save-btn" type="button" :disabled="savingId === item.id" @click="saveInventory(item)">
                {{ savingId === item.id ? 'Saving...' : 'Save' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.manage-inventory { padding: clamp(1rem, 2.5vw, 2rem); }
.header-section, .filter-bar, .inventory-table-wrap { background: #fff; border: 1px solid #dce3ef; border-radius: 1rem; box-shadow: 0 .75rem 2rem rgba(25, 42, 78, .06); }
.header-section { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: clamp(1rem, 2.5vw, 1.75rem); margin-bottom: 1.25rem; }
.header-section h2 { color: var(--navy-blue); font-size: clamp(1.35rem, 2vw, 1.75rem); font-weight: 700; }
.header-section p { margin-top: .35rem; color: #5d6b83; }
.refresh-btn, .save-btn { border: 0; border-radius: .6rem; background: var(--navy-blue); color: #fff; cursor: pointer; font-family: var(--font-secondary); font-weight: 700; transition: background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease; }
.refresh-btn { padding: .7rem 1rem; white-space: nowrap; }
.refresh-btn:hover, .save-btn:hover:not(:disabled) { background: #2a4073; box-shadow: 0 .3rem .65rem rgba(27, 43, 82, .22); transform: translateY(-.1rem); }
.metrics-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
.metric-card { min-height: 7.5rem; padding: 1.15rem; border: 1px solid #dce3ef; border-radius: .9rem; background: linear-gradient(145deg, #fff, #f5f8fe); box-shadow: 0 .65rem 1.5rem rgba(25, 42, 78, .05); }
.metric-card span { display: block; color: #52627b; font-family: var(--font-secondary); font-size: .75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.metric-card strong { display: block; margin-top: .55rem; color: var(--navy-blue); font-size: clamp(1.65rem, 3vw, 2.25rem); }
.metric-card.attention { border-color: #e3b5bd; background: linear-gradient(145deg, #fff, #fff5f6); }
.metric-card.attention strong { color: var(--patriot-red); }
.filter-bar { display: flex; gap: .75rem; padding: .85rem; margin-bottom: 1.25rem; }
.filter-bar input, .filter-bar select, .quantity-control input, .reorder-input { min-height: 2.6rem; border: 1px solid #ccd7ea; border-radius: .55rem; background: #fbfcff; color: var(--navy-blue); font-family: var(--font-secondary); font-size: .95rem; transition: border-color 180ms ease, box-shadow 180ms ease; }
.filter-bar input:focus, .filter-bar select:focus, .quantity-control input:focus, .reorder-input:focus { border-color: #8fa7d1; box-shadow: 0 0 0 .2rem rgba(27, 43, 82, .1); outline: 0; }
.filter-bar input { flex: 1; padding: .6rem .75rem; }
.filter-bar select { width: 12rem; padding: .6rem .75rem; }
.inventory-table-wrap { overflow-x: auto; }
.inventory-table { width: 100%; border-collapse: collapse; min-width: 48rem; }
th { padding: .9rem 1.1rem; color: #52627b; font-family: var(--font-secondary); font-size: .72rem; letter-spacing: .06em; text-align: left; text-transform: uppercase; background: #f8faff; }
td { padding: 1rem 1.1rem; color: #35445d; border-top: 1px solid #e4eaf4; }
td strong { display: block; color: var(--navy-blue); }
.category-label { display: inline-block; margin-top: .3rem; color: #5d6b83; font-size: .78rem; text-transform: capitalize; }
.quantity-control { display: flex; align-items: center; width: 8.5rem; }
.quantity-control button { display: grid; width: 2.3rem; height: 2.6rem; place-items: center; border: 1px solid #ccd7ea; background: #eef3fb; color: var(--navy-blue); cursor: pointer; font-size: 1.1rem; font-weight: 700; }
.quantity-control button:first-child { border-radius: .55rem 0 0 .55rem; }
.quantity-control button:last-child { border-radius: 0 .55rem .55rem 0; }
.quantity-control button:disabled, .save-btn:disabled { cursor: not-allowed; opacity: .55; }
.quantity-control input { width: 3.9rem; border-radius: 0; border-left: 0; border-right: 0; text-align: center; }
.reorder-input { width: 5rem; padding: .4rem .5rem; text-align: center; }
.save-btn { min-width: 4.6rem; padding: .6rem .75rem; }
.state-message, .error-message { padding: 2rem; color: #52627b; text-align: center; }
.error-message { color: var(--patriot-red); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 760px) { .header-section, .filter-bar { flex-direction: column; align-items: stretch; } .metrics-grid { grid-template-columns: 1fr; } .filter-bar select { width: 100%; } .inventory-table { min-width: 0; } .inventory-table thead { display: none; } .inventory-table, .inventory-table tbody, .inventory-table tr, .inventory-table td { display: block; width: 100%; } .inventory-table tr { padding: .75rem 1rem; border-top: 1px solid #e4eaf4; } .inventory-table td { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .5rem 0; border: 0; text-align: right; } .inventory-table td::before { content: attr(data-label); color: #52627b; font-family: var(--font-secondary); font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-align: left; text-transform: uppercase; } .inventory-table td:first-child { display: block; text-align: left; } .inventory-table td:first-child::before, .save-cell::before { display: none; } .save-cell { justify-content: stretch; } .save-btn { width: 100%; } }
</style>
