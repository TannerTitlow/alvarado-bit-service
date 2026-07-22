<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import DrillBitModelModal from './DrillBitModelModal.vue'
import InventoryUnitModal from './InventoryUnitModal.vue'

const models = ref([])
const units = ref([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')
const search = ref('')
const status = ref('all')
const selectedId = ref(null)
const currentTab = ref('inventory')
const showModelModal = ref(false)
const editingModel = ref(null)
const showUnitModal = ref(false)
const editingUnit = ref(null)
const unitSearch = ref('')
const showReceive = ref(false)
const receive = ref({ quantity: 1, condition: 'new', location: '', notes: '' })
const statuses = ['available', 'reserved', 'in_repair', 'sold', 'scrapped']
const conditions = ['unknown', 'new', 'used', 'remanufactured']
const label = value =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
const money = value =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

const filePath = url => {
  if (!url || !url.includes('/')) return url
  const prefix = '/drill-bit-model-images/'
  return url.includes(prefix) ? url.split(prefix)[1].split('?')[0] : url
}

const fetchInventory = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [modelResult, unitResult] = await Promise.all([
      supabase.from('drill_bit_models').select('*').order('nominal_size_in'),
      supabase
        .from('inventory_units')
        .select('*')
        .order('created_at', { ascending: false }),
    ])
    if (modelResult.error) throw modelResult.error
    if (unitResult.error) throw unitResult.error
    models.value = await Promise.all(
      modelResult.data.map(async model => {
        const path = filePath(model.image_url)
        if (!path) return model
        const { data } = await supabase.storage
          .from('drill-bit-model-images')
          .createSignedUrl(path, 3600)
        return { ...model, imagePreview: data?.signedUrl }
      }),
    )
    units.value = unitResult.data
  } catch (error) {
    console.error(error)
    errorMessage.value =
      'Inventory could not be loaded. Check the Supabase table and storage policies, then refresh.'
  } finally {
    loading.value = false
  }
}

const unitsFor = id => units.value.filter(unit => unit.model_id === id)
const availableFor = id =>
  unitsFor(id).filter(unit => unit.status === 'available').length
const modelFor = id => models.value.find(model => model.id === id)
const modelDetails = model =>
  [
    model?.nominal_size && `${model.nominal_size} in.`,
    model?.iadc_code && `IADC ${model.iadc_code}`,
    model?.connection,
  ]
    .filter(Boolean)
    .join(' · ') || 'Specifications pending'
const selected = computed(() =>
  models.value.find(model => model.id === selectedId.value),
)
const selectedUnits = computed(() =>
  selected.value ? unitsFor(selected.value.id) : [],
)
const available = computed(
  () => units.value.filter(unit => unit.status === 'available').length,
)
const reserved = computed(
  () => units.value.filter(unit => unit.status === 'reserved').length,
)
const review = computed(
  () =>
    units.value.filter(
      unit => unit.condition === 'unknown' || unit.status === 'in_repair',
    ).length,
)
const value = computed(() =>
  models.value.reduce(
    (total, model) =>
      total + availableFor(model.id) * Number(model.list_price || 0),
    0,
  ),
)
const filteredModels = computed(() => {
  const query = search.value.trim().toLowerCase()
  return models.value.filter(model => {
    const text = [
      model.display_name,
      model.sku,
      model.iadc_code,
      model.connection,
      model.product_line,
    ]
      .join(' ')
      .toLowerCase()
    return (
      (!query || text.includes(query)) &&
      (status.value === 'all' ||
        unitsFor(model.id).some(unit => unit.status === status.value))
    )
  })
})
const filteredUnits = computed(() => {
  const query = unitSearch.value.trim().toLowerCase()
  return units.value.filter(unit => {
    const model = modelFor(unit.model_id)
    const text = [
      unit.asset_tag,
      unit.location,
      unit.notes,
      model?.display_name,
      model?.nominal_size,
      model?.iadc_code,
      model?.connection,
      model?.product_line,
      model?.sku,
    ]
      .join(' ')
      .toLowerCase()
    return (
      (!query || text.includes(query)) &&
      (status.value === 'all' || unit.status === status.value)
    )
  })
})

const openModelModal = model => {
  editingModel.value = model ? { ...model } : null
  showModelModal.value = true
}

const viewModelInventory = model => {
  selectedId.value = model.id
  currentTab.value = 'inventory'
}

const openUnitModal = unit => {
  editingUnit.value = unit ? { ...unit } : null
  showUnitModal.value = true
}

const saveModel = async form => {
  saving.value = true
  try {
    const image = form.image
    const payload = { ...form }
    delete payload.image
    delete payload.id
    delete payload.imagePreview
    delete payload.created_at
    delete payload.updated_at
    ;['sku', 'manufacturer_part_number', 'description'].forEach(key => {
      payload[key] = payload[key]?.trim() || null
    })
    ;['product_line', 'iadc_code', 'connection'].forEach(key => {
      payload[key] = payload[key]?.trim() || ''
    })
    payload.circulation_type ||= 'standard'
    let result
    if (editingModel.value)
      result = await supabase
        .from('drill_bit_models')
        .update(payload)
        .eq('id', editingModel.value.id)
        .select()
        .single()
    else
      result = await supabase
        .from('drill_bit_models')
        .insert(payload)
        .select()
        .single()
    if (result.error) throw result.error
    if (image) {
      const extension = image.name.split('.').pop() || 'jpg'
      const path = `models/${result.data.id}-${Date.now()}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from('drill-bit-model-images')
        .upload(path, image)
      if (uploadError) throw uploadError
      const { error: imageError } = await supabase
        .from('drill_bit_models')
        .update({ image_url: path })
        .eq('id', result.data.id)
      if (imageError) throw imageError
    }
    showModelModal.value = false
    notice.value = editingModel.value
      ? 'Model changes saved.'
      : 'Drill-bit model added.'
    await fetchInventory()
  } catch (error) {
    errorMessage.value = error.message || 'Model could not be saved.'
  } finally {
    saving.value = false
  }
}

const saveUnitModal = async form => {
  saving.value = true
  try {
    const payload = {
      ...form,
      asset_tag: form.asset_tag?.trim() || null,
      location: form.location?.trim() || null,
      notes: form.notes?.trim() || null,
    }
    delete payload.id
    delete payload.created_at
    delete payload.updated_at
    const result = editingUnit.value
      ? await supabase
          .from('inventory_units')
          .update(payload)
          .eq('id', editingUnit.value.id)
      : await supabase.from('inventory_units').insert(payload)
    if (result.error) throw result.error
    showUnitModal.value = false
    notice.value = editingUnit.value
      ? 'Inventory unit updated.'
      : 'Inventory unit added.'
    await fetchInventory()
  } catch (error) {
    errorMessage.value = error.message || 'Unit could not be saved.'
  } finally {
    saving.value = false
  }
}

const openReceive = model => {
  selectedId.value = model.id
  receive.value = { quantity: 1, condition: 'new', location: '', notes: '' }
  showReceive.value = true
}

const receiveUnits = async () => {
  saving.value = true
  try {
    const quantity = Math.max(
      1,
      Math.floor(Number(receive.value.quantity) || 1),
    )
    const records = Array.from({ length: quantity }, () => ({
      model_id: selectedId.value,
      status: 'available',
      condition: receive.value.condition,
      location: receive.value.location.trim() || null,
      notes: receive.value.notes.trim() || null,
    }))
    const { error } = await supabase.from('inventory_units').insert(records)
    if (error) throw error
    notice.value = `${quantity} physical unit${quantity === 1 ? '' : 's'} received into available inventory.`
    showReceive.value = false
    await fetchInventory()
  } catch (error) {
    errorMessage.value = error.message || 'Units could not be received.'
  } finally {
    saving.value = false
  }
}

const saveUnit = async unit => {
  saving.value = true
  try {
    const { error } = await supabase
      .from('inventory_units')
      .update({
        asset_tag: unit.asset_tag?.trim() || null,
        status: unit.status,
        condition: unit.condition,
        location: unit.location?.trim() || null,
        notes: unit.notes?.trim() || null,
      })
      .eq('id', unit.id)
    if (error) throw error
    notice.value = `Unit #${unit.id} updated.`
  } catch (error) {
    errorMessage.value = error.message || 'Unit could not be saved.'
  } finally {
    saving.value = false
  }
}

onMounted(fetchInventory)
</script>

<template>
  <section class="inventory-workspace">
    <header class="workspace-header">
      <div>
        <p class="eyebrow">Operations inventory</p>
        <h2>Drill Bit Inventory</h2>
        <p>
          Maintain configurations in one place and every physical bit in
          another.
        </p>
      </div>
      <button
        class="button primary"
        type="button"
        @click="
          currentTab === 'models'
            ? openModelModal()
            : ((editingUnit = null), (showUnitModal = true))
        "
      >
        {{
          currentTab === 'models' ? 'Add drill-bit model' : 'Add inventory unit'
        }}
      </button>
    </header>
    <nav class="tab-list" aria-label="Inventory sections">
      <button
        :class="{ active: currentTab === 'inventory' }"
        type="button"
        @click="currentTab = 'inventory'"
      >
        Physical Inventory <span>{{ units.length }}</span></button
      ><button
        :class="{ active: currentTab === 'models' }"
        type="button"
        @click="currentTab = 'models'"
      >
        Drill Bit Models <span>{{ models.length }}</span>
      </button>
    </nav>
    <template v-if="currentTab === 'inventory'">
      <div class="metrics">
        <article>
          <span>Available Now</span><strong>{{ available }}</strong
          ><small>ready to sell or allocate</small>
        </article>
        <article>
          <span>Reserved</span><strong>{{ reserved }}</strong
          ><small>held for a job or customer</small>
        </article>
        <article class="attention">
          <span>Condition Unverified</span><strong>{{ review }}</strong
          ><small>unknown condition or in repair</small>
        </article>
        <article>
          <span>Available Value</span><strong>{{ money(value) }}</strong
          ><small>current list-price estimate</small>
        </article>
      </div>
    </template>
    <p v-if="notice" class="notice">{{ notice }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <div class="toolbar">
      <input
        v-if="currentTab === 'models'"
        v-model="search"
        type="search"
        placeholder="Search model, size, IADC, connection, SKU, or product line"
      /><input
        v-else
        v-model="unitSearch"
        type="search"
        placeholder="Search asset tag, model, location, or notes"
      /><select v-model="status">
        <option value="all">All inventory statuses</option>
        <option v-for="item in statuses" :key="item" :value="item">
          {{ label(item) }}
        </option>
      </select>
    </div>
    <div v-if="loading" class="state">
      Loading drill-bit models and physical units...
    </div>
    <div v-else-if="currentTab === 'models'" class="catalog">
      <p v-if="!filteredModels.length" class="state">
        No drill-bit models match this search.
      </p>
      <article v-for="model in filteredModels" :key="model.id" class="model">
        <div class="model-main">
          <img
            v-if="model.imagePreview"
            :src="model.imagePreview"
            :alt="model.display_name"
          /><span v-else class="placeholder"
            >{{ model.nominal_size }}<small>in.</small></span
          >
          <span class="model-copy"
            ><span
              ><strong>{{ model.display_name }}</strong
              ><b v-if="model.circulation_type === 'reverse_circulation'"
                >R.C.</b
              ></span
            ><em>{{
              [model.iadc_code && `IADC ${model.iadc_code}`, model.connection]
                .filter(Boolean)
                .join(' | ') || 'Specifications pending'
            }}</em
            ><small
              >{{ availableFor(model.id) }} available of
              {{ unitsFor(model.id).length }} physical unit{{
                unitsFor(model.id).length === 1 ? '' : 's'
              }}</small
            ></span
          ><strong class="price">{{ money(model.list_price) }}</strong>
        </div>
        <div class="model-actions">
          <button type="button" @click="openModelModal(model)">
            Edit model</button
          ><button type="button" @click="viewModelInventory(model)">
            View inventory
          </button>
        </div>
      </article>
    </div>
    <div v-else class="unit-table">
      <p v-if="!filteredUnits.length" class="state">
        No physical units match this search.
      </p>
      <table v-else>
        <thead>
          <tr>
            <th>Unit</th>
            <th>Model</th>
            <th>Status</th>
            <th>Condition</th>
            <th>Location</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="unit in filteredUnits" :key="unit.id">
            <td data-label="Unit">
              {{ unit.asset_tag || `Unit #${unit.id}` }}
            </td>
            <td class="unit-model" data-label="Model">
              <template v-if="modelFor(unit.model_id)">
                <span>
                  <strong>{{ modelFor(unit.model_id).display_name }}</strong>
                  <b
                    v-if="
                      modelFor(unit.model_id).circulation_type ===
                      'reverse_circulation'
                    "
                    >RC</b
                  >
                </span>
                <small>{{ modelDetails(modelFor(unit.model_id)) }}</small>
              </template>
              <span v-else class="missing-model">Model unavailable</span>
            </td>
            <td data-label="Status">
              <span class="status-badge">{{ label(unit.status) }}</span>
            </td>
            <td data-label="Condition">{{ label(unit.condition) }}</td>
            <td data-label="Location">{{ unit.location || 'Not assigned' }}</td>
            <td data-label="Actions">
              <button
                class="table-action"
                type="button"
                @click="openUnitModal(unit)"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <DrillBitModelModal
      v-if="showModelModal"
      :model="editingModel"
      @close="showModelModal = false"
      @save="saveModel"
    />
    <InventoryUnitModal
      v-if="showUnitModal"
      :unit="editingUnit"
      :models="models"
      @close="showUnitModal = false"
      @save="saveUnitModal"
    />
  </section>
</template>

<style scoped>
.inventory-workspace {
  padding: clamp(1rem, 2.5vw, 2rem);
  color: #263854;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid #dce3ef;
  border-radius: 1rem;
  background: linear-gradient(120deg, #fff 52%, #eff4fc);
  box-shadow: 0 0.75rem 2rem rgba(25, 42, 78, 0.06);
}

.workspace-header h2 {
  margin: 0;
  color: var(--navy-blue);
  font-size: clamp(1.45rem, 2.6vw, 2rem);
}
.workspace-header > div > p:not(.eyebrow) {
  margin: 0.4rem 0 0;
  color: #60708a;
}
.eyebrow {
  margin: 0 0 0.3rem;
  color: #b21f36;
  font: 700 0.7rem var(--font-secondary);
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.button {
  min-height: 2.7rem;
  padding: 0.65rem 1rem;
  border: 1px solid #ccd7ea;
  border-radius: 0.6rem;
  cursor: pointer;
  font: 700 0.88rem var(--font-secondary);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.button:hover {
  transform: translateY(-0.1rem);
  box-shadow: 0 0.4rem 0.8rem rgba(25, 42, 78, 0.14);
}
.primary {
  border: 0;
  background: linear-gradient(135deg, #c02a3d, #9f1f31);
  color: #fff;
}

.tab-list {
  display: flex;
  gap: 0.35rem;
  margin-top: 1.25rem;
  padding: 0.35rem;
  border: 1px solid #dce3ef;
  border-radius: 0.8rem;
  background: #eaf0fa;
}

.tab-list button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: #60708a;
  cursor: pointer;
  font-weight: 700;
}
.tab-list button.active {
  background: #fff;
  color: var(--navy-blue);
  box-shadow: 0 0.2rem 0.7rem rgba(25, 42, 78, 0.12);
}
.tab-list span {
  display: inline-block;
  margin-left: 0.35rem;
  padding: 0.08rem 0.36rem;
  border-radius: 999px;
  background: #dce5f5;
  font-size: 0.75rem;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
}
.metrics article {
  padding: 1.1rem;
  border: 1px solid #dce3ef;
  border-radius: 0.85rem;
  background: #fff;
  box-shadow: 0 0.65rem 1.5rem rgba(25, 42, 78, 0.05);
}
.metrics span,
.metrics small {
  display: block;
  color: #60708a;
  font: 700 0.7rem var(--font-secondary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.metrics strong {
  display: block;
  margin: 0.45rem 0;
  color: var(--navy-blue);
  font-size: clamp(1.6rem, 2.8vw, 2.2rem);
}
.metrics small {
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
}
.metrics .attention {
  border-color: #ecc7cd;
  background: #fff9fa;
}
.metrics .attention strong {
  color: #a51f34;
}

.notice,
.error {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-radius: 0.55rem;
}
.notice {
  background: #eef8f1;
  color: #166534;
}
.error {
  background: #fff2f3;
  color: #a51f34;
}

.toolbar {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #dce3ef;
  border-radius: 0.8rem;
  background: #fff;
  box-shadow: 0 0.65rem 1.5rem rgba(25, 42, 78, 0.04);
}
.toolbar input,
.toolbar select {
  min-height: 2.7rem;
  box-sizing: border-box;
  border: 1px solid #ccd7ea;
  border-radius: 0.55rem;
  background: #fbfcff;
  color: #263854;
  font: inherit;
}
.toolbar input {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.75rem;
}
.toolbar select {
  width: 13.5rem;
  padding: 0.6rem;
}
.toolbar input:focus,
.toolbar select:focus {
  border-color: #8fa7d1;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(27, 43, 82, 0.1);
}

.catalog {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}
.state {
  grid-column: 1 / -1;
  margin: 0;
  padding: 2.5rem 1rem;
  color: #60708a;
  text-align: center;
}
.model {
  overflow: hidden;
  border: 1px solid #dce3ef;
  border-radius: 0.85rem;
  background: #fff;
  box-shadow: 0 0.65rem 1.5rem rgba(25, 42, 78, 0.05);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}
.model:hover {
  transform: translateY(-0.15rem);
  box-shadow: 0 0.9rem 2rem rgba(25, 42, 78, 0.11);
}
.model-main {
  display: grid;
  grid-template-columns: 4.25rem minmax(0, 1fr) auto;
  gap: 0.9rem;
  padding: 1rem;
}
.model-main img,
.placeholder {
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 0.6rem;
}
.model-main img {
  object-fit: cover;
}
.placeholder {
  display: grid;
  place-content: center;
  background: linear-gradient(145deg, #1d3264, #314d88);
  color: #fff;
  font-weight: 700;
  text-align: center;
}
.placeholder small {
  font-size: 0.65rem;
}
.model-copy span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--navy-blue);
}
.model-copy em,
.model-copy small {
  display: block;
  margin-top: 0.25rem;
  color: #60708a;
  font-size: 0.82rem;
  font-style: normal;
}
.model-copy small {
  color: #355280;
  font-weight: 700;
}
.model-copy b {
  padding: 0.14rem 0.35rem;
  border-radius: 0.25rem;
  background: #f9dde1;
  color: #a51f34;
  font-size: 0.66rem;
}
.price {
  align-self: center;
  color: var(--navy-blue);
  white-space: nowrap;
}
.model-actions {
  display: flex;
  gap: 1rem;
  padding: 0.7rem 1rem 0.8rem;
  border-top: 1px solid #edf0f6;
}
.model-actions button,
.table-action {
  border: 0;
  background: transparent;
  color: #31518b;
  cursor: pointer;
  font-weight: 700;
}

.unit-table {
  margin-top: 1.25rem;
  overflow-x: auto;
  border: 1px solid #dce3ef;
  border-radius: 0.85rem;
  background: #fff;
  box-shadow: 0 0.75rem 2rem rgba(25, 42, 78, 0.06);
}
.unit-table table {
  width: 100%;
  min-width: 44rem;
  border-collapse: collapse;
}
.unit-table th {
  padding: 0.9rem 1rem;
  background: #f7f9fd;
  color: #60708a;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
}
.unit-table td {
  padding: 1rem;
  border-top: 1px solid #e7ecf4;
}
.unit-table tbody tr:hover {
  background: #fbfcff;
}
.unit-model > span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--navy-blue);
}
.unit-model small {
  display: block;
  margin-top: 0.22rem;
  color: #60708a;
  font-size: 0.78rem;
}
.unit-model b {
  padding: 0.13rem 0.34rem;
  border-radius: 0.25rem;
  background: #f9dde1;
  color: #a51f34;
  font-size: 0.64rem;
}
.unit-model .missing-model {
  color: #a51f34;
  font-weight: 700;
}
.status-badge {
  display: inline-block;
  padding: 0.23rem 0.5rem;
  border-radius: 999px;
  background: #eaf0fa;
  color: #31518b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: capitalize;
}

@media (max-width: 900px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .inventory-workspace {
    padding: 1rem;
  }
  .workspace-header,
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .workspace-header .button {
    width: 100%;
    min-height: 2.9rem;
  }
  .toolbar select {
    width: 100%;
  }
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin: 1rem 0;
  }
  .metrics article {
    min-height: 6.9rem;
    padding: 0.9rem;
  }
  .metrics span,
  .metrics small {
    font-size: 0.64rem;
  }
  .metrics strong {
    margin: 0.35rem 0;
    font-size: clamp(1.35rem, 6vw, 1.75rem);
    overflow-wrap: anywhere;
  }
  .catalog {
    grid-template-columns: 1fr;
  }
  .model-main {
    grid-template-columns: 3.75rem minmax(0, 1fr);
  }
  .model-main img,
  .placeholder {
    width: 3.75rem;
    height: 3.75rem;
  }
  .price {
    grid-column: 2;
  }
  .tab-list button {
    padding: 0.65rem 0.45rem;
    font-size: 0.82rem;
  }
  .model-actions button,
  .table-action {
    min-height: 2.75rem;
    padding: 0.45rem;
  }
  .model-actions button {
    flex: 1;
  }
  .unit-table {
    overflow: visible;
    border: 0;
    background: transparent;
    box-shadow: none;
  }
  .unit-table table,
  .unit-table tbody,
  .unit-table tr,
  .unit-table td {
    display: block;
    width: auto;
    min-width: 0;
  }
  .unit-table thead {
    display: none;
  }
  .unit-table tbody {
    display: grid;
    gap: 0.8rem;
  }
  .unit-table tr {
    overflow: hidden;
    border: 1px solid #dce3ef;
    border-radius: 0.75rem;
    background: #fff;
    box-shadow: 0 0.45rem 1.2rem rgba(25, 42, 78, 0.05);
  }
  .unit-table td {
    display: grid;
    grid-template-columns: minmax(5.5rem, 36%) minmax(0, 1fr);
    gap: 0.7rem;
    align-items: center;
    padding: 0.75rem 0.85rem;
  }
  .unit-table td:first-child {
    padding-block: 0.8rem;
    background: #f7f9fd;
  }
  .unit-table .unit-model {
    grid-template-columns: 1fr;
    gap: 0.42rem;
  }
  .unit-table .unit-model > span {
    gap: 0.35rem;
  }
  .unit-table .unit-model small {
    margin-top: 0;
    line-height: 1.4;
  }
  .unit-table td::before {
    color: #60708a;
    content: attr(data-label);
    font: 700 0.68rem var(--font-secondary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .unit-table td:last-child {
    display: flex;
    justify-content: flex-end;
    padding: 0.65rem 0.85rem;
  }
  .unit-table td:last-child::before {
    display: none;
  }
  .unit-table .status-badge {
    justify-self: start;
  }
  .unit-table .table-action {
    min-width: 5rem;
    border: 1px solid #ccd7ea;
    border-radius: 0.5rem;
    background: #f7f9fd;
  }
}
@media (max-width: 360px) {
  .metrics {
    grid-template-columns: 1fr;
  }
}
</style>
