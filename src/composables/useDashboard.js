import { computed, onMounted, onUnmounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export const useDashboard = () => {
  const submissions = ref([])
  const models = ref([])
  const units = ref([])
  const featuredItems = ref([])
  const loading = ref(true)
  const errorMessage = ref('')
  const updatingId = ref(null)
  let contactChannel

  const fetchDashboard = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const [submissionResult, modelResult, unitResult, featuredResult] = await Promise.all([
        supabase.from('contact_submissions').select('*'),
        supabase.from('drill_bit_models').select('id, display_name, active, image_url, sku'),
        supabase.from('inventory_units').select('*'),
        supabase.from('featured_items').select('id, type, media_url'),
      ])
      const failed = [submissionResult, modelResult, unitResult, featuredResult].find(
        result => result.error,
      )
      if (failed) throw failed.error

      submissions.value = submissionResult.data
      models.value = modelResult.data
      units.value = unitResult.data
      featuredItems.value = featuredResult.data
    } catch (error) {
      console.error('Error loading dashboard:', error)
      errorMessage.value = 'Dashboard data could not be loaded. Reload the page to try again.'
    } finally {
      loading.value = false
    }
  }

  const applySubmissionChange = ({ eventType, new: updated, old: previous }) => {
    if (eventType === 'DELETE') {
      submissions.value = submissions.value.filter(submission => submission.id !== previous.id)
      return
    }

    const index = submissions.value.findIndex(submission => submission.id === updated.id)
    if (index === -1) submissions.value = [...submissions.value, updated]
    else submissions.value.splice(index, 1, updated)
  }

  const subscribeToSubmissions = () => {
    contactChannel = supabase
      .channel('dashboard-contact-submissions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_submissions' },
        applySubmissionChange,
      )
      .subscribe()
  }

  const availableUnits = computed(() =>
    units.value.filter(unit => unit.status === 'available'),
  )
  const attentionUnits = computed(() =>
    units.value
      .filter(
        unit =>
          unit.condition === 'unknown' ||
          unit.status === 'in_repair' ||
          !unit.location ||
          /inspection/i.test(unit.location),
      )
      .map(unit => ({
        ...unit,
        model: models.value.find(model => model.id === unit.model_id),
        reason:
          unit.status === 'in_repair'
            ? 'In repair'
            : !unit.location
              ? 'Missing location'
              : unit.condition === 'unknown'
                ? 'Condition unverified'
                : 'Inspection location',
      })),
  )
  const lowStockModels = computed(() =>
    models.value
      .filter(model => model.active)
      .map(model => ({
        ...model,
        available: availableUnits.value.filter(unit => unit.model_id === model.id)
          .length,
      }))
      .filter(model => model.available <= 1)
      .sort((a, b) => a.available - b.available),
  )
  const metrics = computed(() => {
    const images = featuredItems.value.filter(item => item.type === 'image').length
    const videos = featuredItems.value.filter(item => item.type === 'video').length
    const missingMedia = featuredItems.value.filter(item => !item.media_url).length

    return {
      newLeadCount: submissions.value.filter(item => item.status === 'new').length,
      availableUnitCount: availableUnits.value.length,
      attentionCount: attentionUnits.value.length,
      carouselItemCount: featuredItems.value.length,
      carouselDetail: missingMedia
        ? `${images} images, ${videos} videos · ${missingMedia} missing media`
        : `${images} images, ${videos} videos on the home page`,
      carouselNeedsAttention: missingMedia > 0,
    }
  })

  const startLead = async id => {
    updatingId.value = id
    errorMessage.value = ''
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: 'in_progress' })
        .eq('id', id)
      if (error) throw error

      const lead = submissions.value.find(item => item.id === id)
      if (lead) lead.status = 'in_progress'
    } catch (error) {
      console.error('Error updating lead:', error)
      errorMessage.value = 'The lead status could not be updated. Please try again.'
    } finally {
      updatingId.value = null
    }
  }

  onMounted(async () => {
    await fetchDashboard()
    subscribeToSubmissions()
  })
  onUnmounted(() => {
    if (contactChannel) supabase.removeChannel(contactChannel)
  })

  return {
    submissions,
    loading,
    errorMessage,
    updatingId,
    attentionUnits,
    lowStockModels,
    metrics,
    startLead,
  }
}
