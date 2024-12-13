<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="product-item">
    <img :src="product.image_url" :alt="product.title" class="product-image">
    <div class="product-content">
      <h3 class="product-title">{{ product.title }}</h3>
      <p class="product-description">{{ product.description }}</p>
      <p class="product-price">${{ product.price.toLocaleString() }}</p>
      <div class="product-actions">
        <button @click="emit('edit', product)" class="edit-btn">
          Edit
        </button>
        <button @click="emit('delete', product.id)" class="delete-btn">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-item {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.product-item:hover {
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-content {
  padding: 1rem;
}

.product-title {
  color: var(--navy-blue);
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.product-description {
  color: var(--steel-gray);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.product-price {
  color: var(--patriot-red);
  font-weight: 600;
  margin-bottom: 1rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.edit-btn {
  background: var(--navy-blue);
  color: white;
}

.edit-btn:hover {
  background-color: #141e3c;
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.delete-btn:hover {
  background-color: #b91c1c;
}
</style>
