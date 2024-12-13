<script setup>
import { ref, onMounted, onUnmounted, watchEffect, nextTick } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const items = ref([])
const currentIndex = ref(0)
const loading = ref(true)
const autoplayInterval = ref(null)
const videoRef = ref(null)
const IMAGE_DURATION = 10000 // 10 seconds for images

const fetchFeaturedItems = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('featured_items')
      .select('*')
      .order('order_index')

    if (error) throw error

    // Get signed URLs for all media
    const itemsWithSignedUrls = await Promise.all(
      data.map(async item => {
        if (item.media_url) {
          const filename = item.media_url.split('/').pop()
          const {
            data: { signedUrl },
          } = await supabase.storage
            .from('featured-content')
            .createSignedUrl(filename, 60 * 60)

          return {
            ...item,
            media_url: signedUrl,
          }
        }
        return item
      }),
    )

    items.value = itemsWithSignedUrls
  } catch (error) {
    console.error('Error fetching featured items:', error)
  } finally {
    loading.value = false
  }
}

const startSlideTimer = () => {
  stopSlideTimer()

  const currentItem = items.value[currentIndex.value]
  if (!currentItem) return

  if (currentItem.type === 'image') {
    autoplayInterval.value = setTimeout(next, IMAGE_DURATION)
  } else if (currentItem.type === 'video' && videoRef.value) {
    videoRef.value.onended = next
  }
}

const stopSlideTimer = () => {
  if (autoplayInterval.value) {
    clearTimeout(autoplayInterval.value)
    autoplayInterval.value = null
  }
  if (videoRef.value) {
    videoRef.value.onended = null
  }
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % items.value.length
}

const prev = () => {
  currentIndex.value =
    (currentIndex.value - 1 + items.value.length) % items.value.length
}

const goToSlide = index => {
  currentIndex.value = index
}

const handleMediaLoad = () => {
  startSlideTimer()
}

const getProgressStyle = index => {
  if (index === currentIndex.value) {
    return {
      transform: 'scaleX(0)',
      animation: 'progress 10s linear',
    }
  }
  return {
    transform: index < currentIndex.value ? 'scaleX(1)' : 'scaleX(0)',
  }
}

// Watch for changes and handle video playback
watchEffect(() => {
  const currentItem = items.value[currentIndex.value]
  if (currentItem?.type === 'video') {
    nextTick(() => {
      const video = videoRef.value
      if (video) {
        video.currentTime = 0
        video.play()
      }
    })
  }
  startSlideTimer()
})

onMounted(async () => {
  await fetchFeaturedItems()
})

onUnmounted(() => {
  stopSlideTimer()
})
</script>

<template>
  <section v-if="items.length > 0" class="featured-carousel">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <svg viewBox="0 0 50 50" class="spinner">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            stroke-width="5"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>

    <!-- Carousel Content -->
    <div v-else class="carousel-container">
      <!-- Background Layer (Blurred) -->
      <div class="background-layer">
        <div
          v-for="(item, index) in items"
          :key="`bg-${item.id}`"
          :class="['background-image', { active: index === currentIndex }]"
          :style="{ backgroundImage: `url(${item.media_url})` }"
        ></div>
      </div>

      <!-- Main Content -->
      <div
        class="carousel-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="carousel-item"
        >
          <div class="media-wrapper">
            <!-- Image Slide -->
            <img
              v-if="item.type === 'image'"
              :src="item.media_url"
              :alt="item.description"
              class="slide-media"
              @load="handleMediaLoad"
            />

            <!-- Video Slide -->
            <video
              v-else
              :src="item.media_url"
              class="slide-media"
              muted
              playsinline
              @loadeddata="handleMediaLoad"
              ref="videoRef"
            ></video>
          </div>

          <!-- Description Overlay -->
          <div class="slide-overlay">
            <div class="slide-description">
              <p>{{ item.description }}</p>
              <div class="media-type-badge" :class="item.type">
                {{ item.type }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button
        v-if="items.length > 1"
        class="nav-button prev"
        @click="prev"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        v-if="items.length > 1"
        class="nav-button next"
        @click="next"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <!-- Progress Indicators -->
      <div v-if="items.length > 1" class="carousel-progress">
        <button
          v-for="(item, index) in items"
          :key="item.id"
          class="progress-indicator"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
          :aria-label="`Go to slide ${index + 1}`"
        >
          <div class="progress-bar" :style="getProgressStyle(index)"></div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-carousel {
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: var(--navy-blue);
  border-radius: 12px;
  overflow: hidden;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: var(--navy-blue);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  color: white;
}

.spinner {
  animation: rotate 2s linear infinite;
}

.spinner circle {
  stroke-dasharray: 150;
  stroke-dashoffset: 75;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 125;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -125;
  }
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 45%; /* 16:9 aspect ratio with some padding */
  overflow: hidden;
}

/* Background Layer */
.background-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.background-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(20px);
  transform: scale(1.1); /* Prevent blur edges from showing */
  opacity: 0;
  transition: opacity 0.6s ease;
}

.background-image.active {
  opacity: 0.2;
}

.carousel-track {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.45, 0, 0.25, 1);
}

.carousel-item {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.slide-media {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  padding: 4rem 2rem 2rem;
}

.slide-description {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.slide-description p {
  color: white;
  font-size: 1.25rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  flex: 1;
}

.media-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
}

.media-type-badge.image {
  background: #3b82f6;
  color: white;
}

.media-type-badge.video {
  background: #ef4444;
  color: white;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--navy-blue);
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-button:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.nav-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

.nav-button.prev {
  left: 1.5rem;
}
.nav-button.next {
  right: 1.5rem;
}

.carousel-progress {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.progress-indicator {
  width: 3rem;
  height: 4px;
  padding: 0;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

.progress-indicator.active {
  background: rgba(255, 255, 255, 0.6);
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: white;
  transform-origin: left;
  transition: transform 0.1s linear;
}

.progress-indicator.active .progress-bar {
  animation: progress 10s linear;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: white;
  transform-origin: left;
  transition: transform 0.1s linear;
}

.progress-indicator.active .progress-bar {
  animation: progress 10s linear;
}

@keyframes progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (max-width: 768px) {
  .carousel-container {
    padding-bottom: 56.25%;
  }

  .media-wrapper {
    padding: 1rem;
  }

  .nav-button {
    width: 2.5rem;
    height: 2.5rem;
  }

  .nav-button.prev {
    left: 0.75rem;
  }
  .nav-button.next {
    right: 0.75rem;
  }

  .slide-overlay {
    padding: 3rem 1rem 1.5rem;
  }

  .slide-description p {
    font-size: 1rem;
  }

  .media-type-badge {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
