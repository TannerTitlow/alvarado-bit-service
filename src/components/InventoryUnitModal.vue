<script setup>
import { ref, watch } from 'vue'
import DrillBitModelPicker from './DrillBitModelPicker.vue'

const props = defineProps({
  unit: {
    type: Object,
    default: null,
  },
  models: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save'])

const emptyForm = () => ({
  model_id: '',
  asset_tag: '',
  status: 'available',
  condition: 'unknown',
  location: '',
  notes: '',
})

const form = ref(emptyForm())
const statuses = ['available', 'reserved', 'in_repair', 'sold', 'scrapped']
const conditions = ['unknown', 'new', 'used', 'remanufactured']
const label = value =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())

watch(
  () => props.unit,
  unit => {
    form.value = { ...emptyForm(), ...unit }
  },
  { immediate: true },
)

const save = () => {
  emit('save', {
    ...form.value,
    model_id: form.value.model_id || null,
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section
      class="modal-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unit-modal-title"
    >
      <header class="modal-header">
        <div>
          <p class="eyebrow">Physical inventory</p>
          <h2 id="unit-modal-title">
            {{ unit ? 'Edit Inventory Unit' : 'Add Inventory Unit' }}
          </h2>
        </div>
        <button
          class="close-button"
          type="button"
          aria-label="Close modal"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <form class="modal-form" @submit.prevent="save">
        <div class="form-body">
          <label
            >Drill bit model<DrillBitModelPicker
              v-model="form.model_id"
              :models="models"
            />
          </label>
          <label
            >Asset tag<input
              v-model.trim="form.asset_tag"
              placeholder="Yard or serial tag"
          /></label>
          <label
            >Status<select v-model="form.status">
              <option v-for="status in statuses" :key="status" :value="status">
                {{ label(status) }}
              </option>
            </select></label
          >
          <label
            >Condition<select v-model="form.condition">
              <option
                v-for="condition in conditions"
                :key="condition"
                :value="condition"
              >
                {{ label(condition) }}
              </option>
            </select></label
          >
          <label class="wide"
            >Location<input
              v-model.trim="form.location"
              placeholder="Yard, rack, or job site"
          /></label>
          <label class="wide"
            >Notes<textarea
              v-model.trim="form.notes"
              rows="4"
              placeholder="Inspection, customer, or service note"
            ></textarea>
          </label>
        </div>
        <footer class="modal-footer">
          <button class="secondary-btn" type="button" @click="emit('close')">
            Cancel</button
          ><button class="save-btn" type="submit">
            {{ unit ? 'Save Changes' : 'Add Unit' }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(10, 21, 48, 0.52);
  backdrop-filter: blur(0.3rem);
}
.modal-content {
  width: 100%;
  max-width: 38rem;
  max-height: calc(100dvh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #dce3ef;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 1.5rem 4rem rgba(10, 21, 48, 0.26);
  color: #263854;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dce3ef;
  background: linear-gradient(135deg, #fff, #f5f8fe);
}
.modal-header h2 {
  margin: 0;
  color: var(--navy-blue);
  font-size: 1.25rem;
}
.eyebrow {
  margin: 0 0 0.25rem;
  color: #a51f34;
  font: 700 0.7rem var(--font-secondary);
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.close-button {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid #dce3ef;
  border-radius: 0.5rem;
  background: #f7f9fd;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
}
.form-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1.35rem 1.5rem;
  overflow-y: auto;
}
.modal-form {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}
.form-body label {
  color: var(--navy-blue);
  font: 700 0.72rem var(--font-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.form-body input,
.form-body select,
.form-body textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 2.65rem;
  margin-top: 0.4rem;
  padding: 0.6rem;
  border: 1px solid #ccd7ea;
  border-radius: 0.5rem;
  background: #fbfcff;
  color: #263854;
  font: inherit;
  letter-spacing: normal;
  text-transform: none;
}
.form-body textarea {
  resize: vertical;
}
.form-body input:focus,
.form-body select:focus,
.form-body textarea:focus {
  border-color: #8fa7d1;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(27, 43, 82, 0.1);
}
.wide {
  grid-column: 1/-1;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #dce3ef;
  background: #f8faff;
}
.secondary-btn,
.save-btn {
  min-width: 6.5rem;
  padding: 0.7rem 1.1rem;
  border-radius: 0.6rem;
  font-weight: 700;
  cursor: pointer;
}
.secondary-btn {
  border: 1px solid #ccd7ea;
  background: #f7f9fd;
  color: #263854;
}
.save-btn {
  border: 0;
  background: linear-gradient(135deg, #c02a3d, #9f1f31);
  color: #fff;
}
@media (max-width: 520px) {
  .modal-backdrop {
    padding: 0;
  }
  .modal-content {
    height: 100dvh;
    max-height: none;
    border-radius: 0;
  }
  .modal-header {
    padding: 0.9rem 1rem;
  }
  .form-body {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  .wide {
    grid-column: auto;
  }
  .modal-footer {
    padding: 1rem;
  }
  .modal-footer > * {
    flex: 1;
  }
}
</style>
