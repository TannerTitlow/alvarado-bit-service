import { computed, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export const useDrillBitInventory = () => {
  const models = ref([])
  const units = ref([])
  const loading = ref(true)
  const saving = ref(false)
  const errorMessage = ref('')
  const notice = ref('')
  const statuses = ['available', 'reserved', 'in_repair', 'sold', 'scrapped']
  const conditions = ['unknown', 'new', 'used', 'remanufactured']

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

  const saveModel = async (form, existingModel) => {
    saving.value = true
    errorMessage.value = ''
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
      const result = existingModel
        ? await supabase
            .from('drill_bit_models')
            .update(payload)
            .eq('id', existingModel.id)
            .select()
            .single()
        : await supabase.from('drill_bit_models').insert(payload).select().single()
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
      notice.value = existingModel ? 'Model changes saved.' : 'Drill-bit model added.'
      await fetchInventory()
      return true
    } catch (error) {
      errorMessage.value = error.message || 'Model could not be saved.'
      return false
    } finally {
      saving.value = false
    }
  }

  const saveUnit = async (form, existingUnit) => {
    saving.value = true
    errorMessage.value = ''
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
      const result = existingUnit
        ? await supabase
            .from('inventory_units')
            .update(payload)
            .eq('id', existingUnit.id)
        : await supabase.from('inventory_units').insert(payload)
      if (result.error) throw result.error
      notice.value = existingUnit
        ? 'Inventory unit updated.'
        : 'Inventory unit added.'
      await fetchInventory()
      return true
    } catch (error) {
      errorMessage.value = error.message || 'Unit could not be saved.'
      return false
    } finally {
      saving.value = false
    }
  }

  const deleteModel = async model => {
    saving.value = true
    errorMessage.value = ''
    try {
      const unitCount = unitsFor(model.id).length
      const { error } = await supabase
        .from('drill_bit_models')
        .delete()
        .eq('id', model.id)
      if (error) throw error

      notice.value = `${model.display_name} and ${unitCount} physical unit${unitCount === 1 ? '' : 's'} deleted.`
      await fetchInventory()
      return true
    } catch (error) {
      errorMessage.value = error.message || 'Model could not be deleted.'
      return false
    } finally {
      saving.value = false
    }
  }

  const receiveUnits = async (modelId, receive) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const quantity = Math.max(1, Math.floor(Number(receive.quantity) || 1))
      const records = Array.from({ length: quantity }, () => ({
        model_id: modelId,
        status: 'available',
        condition: receive.condition,
        location: receive.location.trim() || null,
        notes: receive.notes.trim() || null,
      }))
      const { error } = await supabase.from('inventory_units').insert(records)
      if (error) throw error
      notice.value = `${quantity} physical unit${quantity === 1 ? '' : 's'} received into available inventory.`
      await fetchInventory()
      return true
    } catch (error) {
      errorMessage.value = error.message || 'Units could not be received.'
      return false
    } finally {
      saving.value = false
    }
  }

  const bulkUpdateUnits = async (ids, payload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const { error } = await supabase
        .from('inventory_units')
        .update(payload)
        .in('id', ids)
      if (error) throw error
      notice.value = `${ids.length} inventory unit${ids.length === 1 ? '' : 's'} updated.`
      await fetchInventory()
      return true
    } catch (error) {
      errorMessage.value = error.message || 'Inventory units could not be updated.'
      return false
    } finally {
      saving.value = false
    }
  }

  return {
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
    saveModel,
    saveUnit,
    deleteModel,
    receiveUnits,
    bulkUpdateUnits,
  }
}
