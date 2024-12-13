<script setup>
import { ref, onMounted, onUnmounted, watchEffect, nextTick } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const items = ref([])
const currentIndex = ref(0)
const loading = ref(true)
const autoplayInterval = ref(null)
const currentVideo = ref(null)
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
      data.map(async (item) => {
        if (item.media_url) {
          const filename = item.media_url.split('/').pop()
          const { data: { signedUrl } } = await supabase.storage
            .from('featured-content')
            .createSignedUrl(filename, 60 * 60) // 1 hour expiry

          return {
            ...item,
            media_url: signedUrl
          }
        }
        return item
      })
    )

    items.value = itemsWithSignedUrls
  } catch (error) {
    console.error('Error fetching featured items:', error)
  } finally {
    loading.value = false
  }
}

const startSlideTimer = () => {
  stopSlideTimer() // Clear any existing timer

  const currentItem = items.value[currentIndex.value]
  if (!currentItem) return

  if (currentItem.type === 'image') {
    // For images, advance after 10 seconds
    autoplayInterval.value = setTimeout(next, IMAGE_DURATION)
  } else if (currentItem.type === 'video') {
    // For videos, wait for video to end
    if (currentVideo.value) {
      currentVideo.value.onended = next
    }
  }
}

const stopSlideTimer = () => {
  if (autoplayInterval.value) {
    clearTimeout(autoplayInterval.value)
    autoplayInterval.value = null
  }
  if (currentVideo.value) {
    currentVideo.value.onended = null
  }
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % items.value.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + items.value.length) % items.value.length
}

const goToSlide = (index) => {
  currentIndex.value = index
}

// Watch for changes in currentIndex and handle video references
watchEffect(() => {
  const currentItem = items.value[currentIndex.value]
  if (currentItem?.type === 'video') {
    // Use nextTick to ensure DOM is updated
    nextTick(() => {
      const videoElement = document.querySelector(`.carousel-item.active video`)
      if (videoElement) {
        currentVideo.value = videoElement
        videoElement.currentTime = 0
        videoElement.play()
      }
    })
  } else {
    currentVideo.value = null
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
      <span class="loading-text">Loading featured content...</span>
    </div>

    <!-- Carousel Content -->
    <div v-else class="carousel-container">
      <!-- Main Content -->
      <div class="carousel-content">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="carousel-item"
          :class="{ active: index === currentIndex }"
        >
          <!-- Image Slide -->
          <img
            v-if="item.type === 'image'"
            :src="item.media_url"
            :alt="item.description"
            class="slide-media"
          >
          <!-- Video Slide -->
          <video
            v-else
            :src="item.media_url"
            class="slide-media"
            muted
            playsinline
          ></video>

          <!-- Description Overlay -->
          <div class="slide-description">
            <p>{{ item.description }}</p>
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="items.length > 1"
        class="nav-button next"
        @click="next"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Indicators -->
      <div v-if="items.length > 1" class="carousel-indicators">
        <button
          v-for="(item, index) in items"
          :key="item.id"
          class="indicator"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-carousel {
  position: relative;
  width: 100%;
  margin: 2rem auto;
  background: #f3f4f6;
  max-width: 1200px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 40%; /* More compact aspect ratio */
  overflow: hidden;
  background: var(--navy-blue);
}

.carousel-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.carousel-item.active {
  opacity: 1;
  z-index: 1;
}

.slide-media {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Changed to contain to prevent cropping */
  background: var(--navy-blue);
}

.slide-description {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
}

.slide-description p {
  margin: 0;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
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
}

.nav-button:hover {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.nav-button.prev {
  left: 1rem;
}

.nav-button.next {
  right: 1rem;
}

.carousel-indicators {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.indicator.active {
  background: white;
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .carousel-container {
    padding-bottom: 56.25%; /* Return to 16:9 on mobile */
  }

  .nav-button {
    width: 2rem;
    height: 2rem;
  }

  .nav-button svg {
    width: 1rem;
    height: 1rem;
  }

  .slide-description {
    padding: 0.75rem;
  }

  .slide-description p {
    font-size: 0.875rem;
  }
}
</style>
