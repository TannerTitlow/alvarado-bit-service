<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDrillBitInventory } from '@/composables/useDrillBitInventory'
import ConfirmModal from '@/components/ConfirmModal.vue'
import DrillBitModelModal from './DrillBitModelModal.vue'
import DrillBitModelCard from './DrillBitModelCard.vue'
import InventoryUnitModal from './InventoryUnitModal.vue'
import InventoryMetrics from './InventoryMetrics.vue'
import InventoryToolbar from './InventoryToolbar.vue'
import InventoryUnitTable from './InventoryUnitTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const {
  models,
  units,
  loading,
  saving,
  errorMessage,
  notice,
  statuses,
  conditions,
  unitsFor,
  availableFor,
  modelFor,
  available,
  reserved,
  review,
  value,
  fetchInventory,
  saveModel: persistModel,
  saveUnit: persistUnit,
  deleteModel: removeModel,
  bulkUpdateUnits,
} = useDrillBitInventory()
const search = ref('')
const status = ref('all')
const currentTab = ref('inventory')
const showModelModal = ref(false)
const editingModel = ref(null)
const showUnitModal = ref(false)
const editingUnit = ref(null)
const unitSearch = ref('')
const deletingModel = ref(null)
const sortKey = ref('unit')
const sortDirection = ref('asc')
const attentionOnly = ref(false)
const money = value =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

const needsAttention = unit =>
  unit.condition === 'unknown' ||
  unit.status === 'in_repair' ||
  !unit.location ||
  /inspection/i.test(unit.location)
const inventoryMetrics = computed(() => [
  { label: 'Available Now', value: available.value, detail: 'ready to sell or allocate' },
  { label: 'Reserved', value: reserved.value, detail: 'held for a job or customer' },
  {
    label: 'Condition Unverified',
    value: review.value,
    detail: 'unknown condition or in repair',
    tone: 'attention',
  },
  {
    label: 'Available Value',
    value: money(value.value),
    detail: 'current list-price estimate',
  },
])
const modelMetrics = computed(() => [
  { label: 'Catalog Models', value: models.value.length, detail: 'active drill-bit configurations' },
  {
    label: 'Models Available',
    value: models.value.filter(model => availableFor(model.id) > 0).length,
    detail: 'with physical inventory ready now',
  },
  {
    label: 'Physical Units',
    value: units.value.length,
    detail: 'tracked units across all models',
  },
  {
    label: 'Product Lines',
    value: new Set(
      models.value.map(model => model.product_line).filter(Boolean),
    ).size,
    detail: 'distinct catalog product families',
  },
])
const activeMetrics = computed(() =>
  currentTab.value === 'inventory' ? inventoryMetrics.value : modelMetrics.value,
)
const deleteMessage = computed(() => {
  if (!deletingModel.value) return ''
  const unitCount = unitsFor(deletingModel.value.id).length
  return `Delete ${deletingModel.value.display_name} and its ${unitCount} physical unit${unitCount === 1 ? '' : 's'}? This cannot be undone.`
})
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
      (status.value === 'all' || unit.status === status.value) &&
      (!attentionOnly.value || needsAttention(unit))
    )
  })
})
const sortedUnits = computed(() => {
  const direction = sortDirection.value === 'asc' ? 1 : -1
  return [...filteredUnits.value].sort((left, right) => {
    const leftModel = modelFor(left.model_id)
    const rightModel = modelFor(right.model_id)
    const values = {
      unit: unit => unit.asset_tag || `Unit #${unit.id}`,
      model: (_unit, model) => model?.display_name || '',
      status: unit => unit.status,
      condition: unit => unit.condition,
      location: unit => unit.location || '',
      created_at: unit => unit.created_at || '',
    }
    const leftValue = values[sortKey.value](left, leftModel)
    const rightValue = values[sortKey.value](right, rightModel)
    return String(leftValue).localeCompare(String(rightValue), undefined, {
      numeric: true,
    }) * direction
  })
})

const setSort = key => {
  if (sortKey.value === key)
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}
const applyBulkUpdate = ({ ids, payload }) => bulkUpdateUnits(ids, payload)

const openModelModal = model => {
  editingModel.value = model ? { ...model } : null
  showModelModal.value = true
}

const openUnitModal = unit => {
  editingUnit.value = unit ? { ...unit } : null
  showUnitModal.value = true
}

const saveModel = async form => {
  if (await persistModel(form, editingModel.value)) {
    showModelModal.value = false
  }
}

const saveUnitModal = async form => {
  if (await persistUnit(form, editingUnit.value)) {
    showUnitModal.value = false
  }
}

const deleteModel = async () => {
  if (deletingModel.value && (await removeModel(deletingModel.value))) {
    deletingModel.value = null
  }
}

onMounted(fetchInventory)
</script>

<template>
  <section class="p-[clamp(1rem,2.5vw,2rem)] text-admin-ink max-[640px]:p-4">
    <header class="flex items-center justify-between gap-6 rounded-[1rem] border border-admin-border bg-workspace-header p-[clamp(1.25rem,3vw,2rem)] shadow-panel max-[640px]:flex-col max-[640px]:items-stretch">
      <div>
        <p class="mb-[0.3rem] mt-0 font-secondary text-[0.7rem] font-bold uppercase tracking-[0.11em] text-admin-eyebrow">Operations inventory</p>
        <h2 class="m-0 text-[clamp(1.45rem,2.6vw,2rem)] text-brand-navy">Drill Bit Inventory</h2>
        <p class="mb-0 mt-[0.4rem] text-admin-muted">Maintain configurations in one place and every physical bit in another.</p>
      </div>
      <BaseButton variant="danger" class="max-[640px]:min-h-[2.9rem] max-[640px]:w-full" @click="currentTab === 'models' ? openModelModal() : ((editingUnit = null), (showUnitModal = true))">
        {{ currentTab === 'models' ? 'Add drill-bit model' : 'Add inventory unit' }}
      </BaseButton>
    </header>

    <nav class="mt-5 flex gap-[0.35rem] rounded-toolbar border border-admin-border bg-admin-panel-tab p-[0.35rem]" aria-label="Inventory sections">
      <button :class="['flex-1 cursor-pointer rounded-control border-0 px-4 py-3 font-bold text-admin-muted transition-[background-color,color,box-shadow] duration-interaction focus-visible:outline-none focus-visible:shadow-focus-strong max-[640px]:px-[0.45rem] max-[640px]:py-[0.65rem] max-[640px]:text-[0.82rem] motion-reduce:transition-none', currentTab === 'inventory' ? 'bg-admin-panel text-brand-navy shadow-tab-active' : 'bg-transparent']" type="button" @click="currentTab = 'inventory'">
        Physical Inventory <span class="ml-[0.35rem] inline-block rounded-full bg-admin-panel-count px-[0.36rem] py-[0.08rem] text-[0.75rem]">{{ units.length }}</span>
      </button>
      <button :class="['flex-1 cursor-pointer rounded-control border-0 px-4 py-3 font-bold text-admin-muted transition-[background-color,color,box-shadow] duration-interaction focus-visible:outline-none focus-visible:shadow-focus-strong max-[640px]:px-[0.45rem] max-[640px]:py-[0.65rem] max-[640px]:text-[0.82rem] motion-reduce:transition-none', currentTab === 'models' ? 'bg-admin-panel text-brand-navy shadow-tab-active' : 'bg-transparent']" type="button" @click="currentTab = 'models'">
        Drill Bit Models <span class="ml-[0.35rem] inline-block rounded-full bg-admin-panel-count px-[0.36rem] py-[0.08rem] text-[0.75rem]">{{ models.length }}</span>
      </button>
    </nav>

    <InventoryMetrics :metrics="activeMetrics" />
    <p v-if="notice" class="my-4 rounded-control bg-admin-notice-soft px-4 py-3 text-admin-notice">{{ notice }}</p>
    <p v-if="errorMessage" class="my-4 rounded-control bg-admin-danger-soft px-4 py-3 text-admin-danger">{{ errorMessage }}</p>
    <InventoryToolbar :current-tab="currentTab" :search="search" :unit-search="unitSearch" :status="status" :statuses="statuses" :attention-only="attentionOnly" @update:search="search = $event" @update:unit-search="unitSearch = $event" @update:status="status = $event" @update:attention-only="attentionOnly = $event" />

    <Transition
      mode="out-in"
      enter-active-class="transition-[opacity,transform] duration-content ease-emphasized motion-reduce:transition-none"
      enter-from-class="translate-y-[0.45rem] opacity-0"
      leave-active-class="transition-[opacity,transform] duration-content ease-emphasized motion-reduce:transition-none"
      leave-to-class="translate-y-[0.45rem] opacity-0"
    >
      <div v-if="loading" key="loading" class="m-0 px-4 py-10 text-center text-admin-muted">Loading drill-bit models and physical units...</div>
      <div v-else-if="currentTab === 'models'" key="models" class="mt-5 grid grid-cols-[repeat(auto-fill,minmax(22rem,1fr))] gap-4 max-[640px]:grid-cols-1">
        <p v-if="!filteredModels.length" class="col-span-full m-0 px-4 py-10 text-center text-admin-muted">No drill-bit models match this search.</p>
        <DrillBitModelCard v-for="model in filteredModels" :key="model.id" :model="model" :available="availableFor(model.id)" :unit-count="unitsFor(model.id).length" :price="money(model.list_price)" @edit="openModelModal" @delete="deletingModel = $event" />
      </div>
      <InventoryUnitTable v-else key="inventory" :units="sortedUnits" :models="models" :statuses="statuses" :conditions="conditions" :sort-key="sortKey" :sort-direction="sortDirection" :saving="saving" @edit="openUnitModal" @sort="setSort" @bulk-update="applyBulkUpdate" />
    </Transition>

    <DrillBitModelModal v-if="showModelModal" :model="editingModel" @close="showModelModal = false" @save="saveModel" />
    <InventoryUnitModal v-if="showUnitModal" :unit="editingUnit" :models="models" @close="showUnitModal = false" @save="saveUnitModal" />
    <ConfirmModal v-if="deletingModel" title="Delete Drill-Bit Model" :message="deleteMessage" @cancel="deletingModel = null" @confirm="deleteModel" />
  </section>
</template>
