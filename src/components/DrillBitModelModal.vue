<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  model: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const emptyForm = () => ({
  display_name: '',
  nominal_size: '',
  nominal_size_in: '',
  bit_type: '',
  product_line: '',
  iadc_code: '',
  connection: '',
  circulation_type: '',
  sku: '',
  manufacturer_part_number: '',
  list_price: '',
  description: '',
  active: true,
  image: null,
})

const form = ref(emptyForm())
const imageName = ref('')
const imagePreview = ref(null)
let objectUrl = null

const parseInches = value => {
  const normalized = value?.trim()
  if (!normalized) return null

  const mixedFraction = normalized.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixedFraction)
    return (
      Number(mixedFraction[1]) +
      Number(mixedFraction[2]) / Number(mixedFraction[3])
    )

  const fraction = normalized.match(/^(\d+)\/(\d+)$/)
  if (fraction) return Number(fraction[1]) / Number(fraction[2])

  const decimal = Number(normalized)
  return Number.isFinite(decimal) && decimal > 0 ? decimal : null
}

const nominalSizeIn = computed(() => parseInches(form.value.nominal_size))

watch(
  () => props.model,
  model => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = null
    form.value = { ...emptyForm(), ...model, image: null }
    imageName.value = ''
    imagePreview.value = model?.imagePreview || null
  },
  { immediate: true },
)

const selectImage = event => {
  const [file] = event.target.files
  form.value.image = file || null
  imageName.value = file?.name || ''
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = file ? URL.createObjectURL(file) : null
  imagePreview.value = objectUrl || props.model?.imagePreview || null
}

onUnmounted(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})

const save = () => {
  emit('save', {
    ...form.value,
    nominal_size_in: nominalSizeIn.value,
    list_price:
      form.value.list_price === '' ? null : Number(form.value.list_price),
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section
      class="modal-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-modal-title"
    >
      <header class="modal-header">
        <div>
          <p class="eyebrow">Catalog configuration</p>
          <h2 id="model-modal-title">
            {{ model ? 'Edit Drill Bit Model' : 'Add Drill Bit Model' }}
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
          <section class="form-section">
            <div class="section-heading">
              <h3>Core model details</h3>
              <p>
                Define the physical configuration used to identify this bit.
              </p>
            </div>
            <div class="fields">
              <label class="wide"
                ><span>Display name <b aria-hidden="true">*</b></span
                ><input
                  v-model.trim="form.display_name"
                  required
                  placeholder="e.g. 8 3/4 in. Tricone Bit"
              /></label>
              <label class="file-field wide">
                <span>Model image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="selectImage"
                />
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Selected drill-bit model image preview"
                />
                <strong class="file-action">{{
                  imageName ||
                  (imagePreview ? 'Replace image' : 'Add model image')
                }}</strong>
                <small>{{
                  imageName
                    ? 'Ready to upload when changes are saved'
                    : 'JPEG, PNG, or WebP. Maximum file size 10 MB.'
                }}</small>
              </label>
              <label
                >Nominal size<input
                  v-model.trim="form.nominal_size"
                  placeholder="8 3/4"
              /></label>
              <div class="derived-field" role="status">
                <span>Calculated size</span>
                <strong>{{
                  nominalSizeIn
                    ? `${nominalSizeIn.toFixed(3)} in.`
                    : 'Enter a size'
                }}</strong>
                <small>Derived from nominal size</small>
              </div>
              <label
                >Bit type<input
                  v-model.trim="form.bit_type"
                  placeholder="Tricone"
              /></label>
              <label
                >IADC code<input
                  v-model.trim="form.iadc_code"
                  placeholder="517"
              /></label>
              <label
                >Connection<input
                  v-model.trim="form.connection"
                  placeholder="4 1/2 REG"
              /></label>
              <label
                >Circulation type<select v-model="form.circulation_type">
                  <option value="">Not specified</option>
                  <option value="standard">Standard circulation</option>
                  <option value="reverse_circulation">
                    Reverse circulation
                  </option>
                </select></label
              >
            </div>
          </section>

          <section class="form-section">
            <div class="section-heading">
              <h3>Catalog &amp; publishing</h3>
              <p>Manage commercial identifiers and model availability.</p>
            </div>
            <div class="fields">
              <label class="availability wide">
                <input v-model="form.active" type="checkbox" />
                <span>
                  <strong>Active model</strong>
                  <small>Available for inventory and catalog workflows.</small>
                </span>
              </label>
              <label
                >Product line<input
                  v-model.trim="form.product_line"
                  placeholder="e.g. RockForce"
              /></label>
              <label
                >SKU<input v-model.trim="form.sku" placeholder="Internal SKU"
              /></label>
              <label
                >Manufacturer Part #<input
                  v-model.trim="form.manufacturer_part_number"
                  placeholder="Part number"
              /></label>
              <label
                >List price<input
                  v-model.number="form.list_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
              /></label>
              <label class="wide"
                >Description<textarea
                  v-model.trim="form.description"
                  rows="3"
                  placeholder="Cutter configuration, intended formation, or operating characteristics"
                ></textarea>
              </label>
            </div>
          </section>
        </div>

        <footer class="modal-footer">
          <button class="secondary-btn" type="button" @click="emit('close')">
            Cancel
          </button>
          <button class="save-btn" type="submit">
            {{ model ? 'Save Changes' : 'Add Model' }}
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
  max-width: 58rem;
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
.modal-header h2,
.form-section h3 {
  margin: 0;
  color: var(--navy-blue);
}
.modal-header h2 {
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
.modal-form {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}
.form-body {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1.12fr) minmax(20rem, 0.88fr);
  align-items: start;
  gap: 1.25rem;
  overflow-y: auto;
  padding: 1.35rem 1.5rem;
}
.form-section {
  padding: 1.25rem;
  border: 1px solid #e0e7f2;
  border-radius: 0.8rem;
  background: linear-gradient(145deg, #fff, #f9fbff);
}
.form-section h3 {
  font-size: 1rem;
}
.section-heading {
  margin-bottom: 1.1rem;
}
.section-heading p {
  margin: 0.28rem 0 0;
  color: #60708a;
  font-size: 0.78rem;
  line-height: 1.4;
}
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}
.fields label {
  color: var(--navy-blue);
  font: 700 0.72rem var(--font-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.fields label b {
  color: #b02238;
}
.fields input:not([type='checkbox']),
.fields select,
.fields textarea {
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
.fields textarea {
  resize: vertical;
}
.fields input:focus,
.fields select:focus,
.fields textarea:focus {
  border-color: #8fa7d1;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(27, 43, 82, 0.1);
}
.wide {
  grid-column: 1/-1;
}
.derived-field {
  min-width: 0;
  padding: 0.6rem;
  border: 1px solid #dce5f2;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #eef3fb, #f8faff);
  color: var(--navy-blue);
  font: 700 0.72rem var(--font-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.derived-field strong,
.derived-field small {
  display: block;
  letter-spacing: normal;
  text-transform: none;
}
.derived-field strong {
  margin-top: 0.3rem;
  font-size: 1rem;
}
.derived-field small {
  margin-top: 0.1rem;
  color: #60708a;
  font-size: 0.72rem;
  font-weight: 400;
}
.file-field {
  position: relative;
  display: flex;
  min-height: 8.75rem;
  flex-direction: column;
  justify-content: center;
  padding: 0.65rem 0.75rem;
  overflow: hidden;
  border: 1px dashed #9db2d5;
  border-radius: 0.7rem;
  background: linear-gradient(125deg, #edf3fc, #f9fbff);
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}
.file-field:hover {
  border-color: #5172ad;
  background: #f2f6fd;
  box-shadow: inset 0 0 0 1px rgba(49, 81, 139, 0.08);
}
.file-field input {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  opacity: 0;
}
.file-field span {
  color: #60708a;
  font-size: 0.68rem;
}
.file-field strong,
.file-field small {
  display: block;
  letter-spacing: normal;
  text-transform: none;
}
.file-field strong {
  margin-top: 0.55rem;
}
.file-action {
  width: fit-content;
  padding: 0.38rem 0.6rem;
  border-radius: 0.38rem;
  background: #263e6c;
  color: #fff !important;
  font-size: 0.76rem !important;
  line-height: 1;
}
.file-field small {
  margin-top: 0.2rem;
  color: #60708a;
  font-size: 0.72rem;
  font-weight: 400;
}
.file-field:has(img) {
  padding-left: 8.8rem;
}
.file-field img {
  position: absolute;
  top: 0.75rem;
  left: 0.85rem;
  width: 6.75rem;
  height: calc(100% - 1.5rem);
  border: 2px solid #fff;
  border-radius: 0.55rem;
  box-shadow: 0 0.5rem 1rem rgba(25, 42, 78, 0.16);
  background: #fff;
  object-fit: contain;
}
.availability {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  grid-column: 1/-1;
  padding: 0.75rem;
  border: 1px solid #d8e2f1;
  border-radius: 0.55rem;
  background: #f5f8fd;
  text-transform: none !important;
}
.availability input {
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
}
.availability span {
  display: grid;
  gap: 0.12rem;
}
.availability strong {
  color: var(--navy-blue);
  font-size: 0.82rem;
}
.availability small {
  color: #60708a;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: normal;
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
@media (max-width: 768px) {
  .modal-content {
    height: calc(100dvh - 2rem);
  }
  .form-body {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  .modal-footer {
    padding: 1rem;
  }
  .modal-footer > * {
    flex: 1;
  }
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
  .form-section {
    padding: 1rem;
  }
  .form-body,
  .modal-footer {
    padding: 1rem;
  }
}
@media (max-width: 440px) {
  .fields {
    grid-template-columns: 1fr;
  }
  .wide {
    grid-column: auto;
  }
  .file-field:has(img) {
    padding-top: 8rem;
    padding-left: 0.75rem;
  }
  .file-field img {
    right: 0.75rem;
    bottom: auto;
    width: auto;
    height: 6.25rem;
  }
}
</style>
