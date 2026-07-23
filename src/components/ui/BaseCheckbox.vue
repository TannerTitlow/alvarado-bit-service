<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = event => {
  emit('update:modelValue', event.target.checked)
  emit('change', event)
}
</script>

<template>
  <input
    :checked="modelValue"
    class="h-4 w-4 shrink-0 cursor-pointer accent-admin-link focus-visible:outline-none focus-visible:shadow-focus"
    type="checkbox"
    @change="handleChange"
  />
</template>
