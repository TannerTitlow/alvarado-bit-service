<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="product-item">
    <img
      v-if="product.image_url"
      :src="product.image_url"
      :alt="product.title"
      class="product-image"
    />
    <div
      v-else
      class="product-image product-image-placeholder"
      role="img"
      :aria-label="`${product.title} has no image`"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 5.75A1.75 1.75 0 0 1 5.75 4h12.5A1.75 1.75 0 0 1 20 5.75v12.5A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V5.75Zm2 10.5 3.1-3.1a1 1 0 0 1 1.4 0l2.1 2.1 1.6-1.6a1 1 0 0 1 1.4 0l2.4 2.6V18H6v-1.75ZM9 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
          fill="currentColor"
        />
      </svg>
      <span>No image uploaded</span>
    </div>
    <div class="product-content">
      <h3 class="product-title">{{ product.title }}</h3>
      <p class="product-description">{{ product.description }}</p>
      <p class="product-price">${{ product.price.toLocaleString() }}</p>
      <div class="product-actions">
        <button @click="emit('edit', product)" class="edit-btn">Edit</button>
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
  border: 1px solid #dce3ef;
  border-radius: 0.85rem;
  overflow: hidden;
  box-shadow: 0 0.6rem 1.5rem rgba(25, 42, 78, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-item:hover {
  transform: translateY(-0.2rem);
  box-shadow: 0 1rem 2rem rgba(25, 42, 78, 0.12);
}

.product-image {
  width: 100%;
  height: 12.5rem;
  object-fit: cover;
}

.product-image-placeholder {
  display: grid;
  place-content: center;
  gap: 0.5rem;
  background: #eef2f8;
  color: #64748b;
  font-family: var(--font-secondary);
  font-size: 0.85rem;
  text-align: center;
}

.product-image-placeholder svg {
  width: 2rem;
  height: 2rem;
  margin: 0 auto;
}

.product-content {
  padding: 1.1rem;
}

.product-title {
  color: var(--navy-blue);
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.product-description {
  color: #5d6b83;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

.product-price {
  color: var(--patriot-red);
  font-size: 1.2rem;
  font-weight: 700;
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
  border-radius: 0.5rem;
  cursor: pointer;
  font-family: var(--font-secondary);
  font-weight: 600;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.edit-btn {
  background: var(--navy-blue);
  color: white;
}

.edit-btn:hover {
  background-color: #2a4073;
  box-shadow: 0 0.3rem 0.65rem rgba(27, 43, 82, 0.22);
  transform: translateY(-0.1rem);
}

.delete-btn {
  background: var(--patriot-red);
  color: white;
}

.delete-btn:hover {
  background-color: #c83a4d;
  box-shadow: 0 0.3rem 0.65rem rgba(178, 34, 52, 0.22);
  transform: translateY(-0.1rem);
}
</style>
