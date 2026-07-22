<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  onServerPrefetch,
  watch,
  nextTick,
} from 'vue'
import { supabase } from '@/lib/supabaseClient'

const items = ref([])
const currentIndex = ref(0)
const loading = ref(true)
const autoplayInterval = ref(null)
const videoRef = ref(null)
const isMounted = ref(false)
const isAutoplaying = ref(true)
const prefersReducedMotion = ref(false)
const IMAGE_DURATION = 10000 // 10 seconds for images
let motionQuery
const handleMotionPreferenceChange = event => {
  prefersReducedMotion.value = event.matches
  if (event.matches) isAutoplaying.value = false
}

const shouldAutoplay = computed(() => {
  return isMounted.value && isAutoplaying.value && !prefersReducedMotion.value
})
const currentItem = computed(() => items.value[currentIndex.value])

const getStoragePath = mediaUrl => {
  if (!mediaUrl) return null

  const marker = '/featured-content/'
  const path = mediaUrl.includes(marker) ? mediaUrl.split(marker)[1] : mediaUrl
  return path.split('?')[0].split('#')[0]
}

const getSignedMediaUrl = async mediaUrl => {
  const path = getStoragePath(mediaUrl)
  if (!path) return mediaUrl

  const { data, error } = await supabase.storage
    .from('featured-content')
    .createSignedUrl(path, 60 * 60)

  if (error) {
    console.error('Error creating featured media URL:', error)
    return null
  }

  return data.signedUrl
}

const fetchFeaturedItems = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('featured_items')
      .select('*')
      .order('order_index')

    if (error) throw error

    if (import.meta.env.SSR) {
      // Private media URLs expire, so omit them from static HTML. The browser
      // refreshes each URL on mount while the project descriptions remain crawlable.
      items.value = data.map(item => ({ ...item, media_url: null }))
      return
    }

    // The featured-content bucket is private, so browser media needs a fresh URL.
    items.value = await Promise.all(
      data.map(async item => ({
        ...item,
        media_url: await getSignedMediaUrl(item.media_url),
      })),
    )
  } catch (error) {
    console.error('Error fetching featured items:', error)
  } finally {
    loading.value = false
  }
}

const startSlideTimer = () => {
  stopSlideTimer()

  if (!shouldAutoplay.value) return

  const currentItem = items.value[currentIndex.value]
  if (!currentItem) return

  if (currentItem.type === 'image') {
    autoplayInterval.value = setTimeout(next, IMAGE_DURATION)
  } else if (currentItem.type === 'video' && getCurrentVideo()) {
    getCurrentVideo().onended = next
  }
}

const stopSlideTimer = () => {
  if (autoplayInterval.value) {
    clearTimeout(autoplayInterval.value)
    autoplayInterval.value = null
  }
  const video = getCurrentVideo()
  if (video) {
    video.onended = null
  }
}

const getCurrentVideo = () => {
  if (Array.isArray(videoRef.value)) {
    return videoRef.value[currentIndex.value]
  }

  return videoRef.value
}

const next = (pause = false) => {
  if (pause) isAutoplaying.value = false
  currentIndex.value = (currentIndex.value + 1) % items.value.length
}

const prev = () => {
  isAutoplaying.value = false
  currentIndex.value =
    (currentIndex.value - 1 + items.value.length) % items.value.length
}

const goToSlide = index => {
  isAutoplaying.value = false
  currentIndex.value = index
}

const toggleAutoplay = () => {
  isAutoplaying.value = !isAutoplaying.value
}

const handleMediaLoad = index => {
  if (index !== currentIndex.value) return
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

watch([items, currentIndex, shouldAutoplay], () => {
  if (!isMounted.value) return

  const currentItem = items.value[currentIndex.value]
  if (currentItem?.type === 'video') {
    nextTick(() => {
      const video = getCurrentVideo()
      if (video && shouldAutoplay.value) {
        video.currentTime = 0
        video.play()
      } else if (video) {
        video.pause()
      }
    })
  }
  startSlideTimer()
})

onMounted(async () => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionQuery.matches
  isAutoplaying.value = !motionQuery.matches
  motionQuery.addEventListener('change', handleMotionPreferenceChange)
  isMounted.value = true
  await fetchFeaturedItems()
})

// Include featured projects in the statically rendered document for crawlers.
onServerPrefetch(async () => {
  await fetchFeaturedItems()
})

onUnmounted(() => {
  stopSlideTimer()
  motionQuery?.removeEventListener('change', handleMotionPreferenceChange)
})
</script>

<template>
  <section
    v-if="items.length > 0"
    class="featured-carousel"
    aria-roledescription="carousel"
    aria-label="Featured products and projects"
  >
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
          class="background-image"
          :style="{
            backgroundImage: currentItem?.media_url
              ? `url(${currentItem.media_url})`
              : 'none',
          }"
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
          :aria-hidden="index !== currentIndex"
        >
          <div class="media-wrapper">
            <!-- Image Slide -->
            <img
              v-if="item.type === 'image' && item.media_url"
              :src="item.media_url"
              :alt="item.description || 'Featured Alvarado Bit Service project'"
              class="slide-media"
              :loading="index === currentIndex ? 'eager' : 'lazy'"
              decoding="async"
              @load="handleMediaLoad(index)"
            />

            <!-- Video Slide -->
            <video
              v-else-if="item.type === 'video' && item.media_url"
              :src="item.media_url"
              class="slide-media"
              muted
              playsinline
              :aria-label="item.description || 'Featured Alvarado Bit Service project video'"
              preload="metadata"
              @loadeddata="handleMediaLoad(index)"
              ref="videoRef"
            ></video>
          </div>

          <!-- Project details -->
          <div class="slide-overlay">
            <div class="slide-description">
              <p class="slide-eyebrow">Featured equipment</p>
              <h3>{{ item.description || 'Alvarado Bit Service project' }}</h3>
              <div class="slide-meta">
                <div class="media-type-badge" :class="item.type">
                  {{ item.type }}
                </div>
                <span class="slide-count">{{ index + 1 }} / {{ items.length }}</span>
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
            aria-hidden="true"
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
        @click="next(true)"
        aria-label="Next slide"
      >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <button
        v-if="items.length > 1"
        class="autoplay-button"
        type="button"
        @click="toggleAutoplay"
        :disabled="prefersReducedMotion"
        :aria-label="isAutoplaying ? 'Pause carousel' : 'Play carousel'"
      >
        {{ isAutoplaying ? 'Pause' : 'Play' }}
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
  background: #111d3d;
  border-radius: 1rem;
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
  height: clamp(27rem, 44vw, 35rem);
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
  filter: blur(32px);
  transform: scale(1.12);
  opacity: 0.16;
  transition: background-image 0.35s ease;
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
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(17rem, 0.65fr);
  grid-template-rows: minmax(0, 1fr);
  align-items: center;
  gap: clamp(1.25rem, 3vw, 3.5rem);
  padding: 2rem 6rem 4.75rem;
  min-height: 0;
}

.media-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 0.9rem;
  background: rgba(5, 13, 33, 0.42);
  box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.22);
}

.slide-media {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  border-radius: 0.45rem;
  object-fit: contain;
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.34);
}

.slide-overlay {
  position: relative;
  align-self: stretch;
  display: flex;
  align-items: center;
  min-height: 0;
  padding: clamp(1.25rem, 3vw, 2.25rem);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 0.9rem;
  background: linear-gradient(145deg, rgba(35, 57, 109, 0.94), rgba(15, 28, 61, 0.96));
  box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.2);
}

.slide-description {
  width: 100%;
}

.slide-eyebrow {
  margin: 0 0 0.75rem;
  color: #b9caf8;
  font-family: var(--font-primary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.slide-description h3 {
  margin: 0;
  color: white;
  font-size: clamp(1.45rem, 2.5vw, 2.5rem);
  line-height: 1.08;
  overflow-wrap: anywhere;
}

.slide-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.media-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
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

.slide-count {
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--font-primary);
  font-size: 0.8rem;
  font-weight: 700;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--navy-blue);
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.24);
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

.autoplay-button {
  position: absolute;
  right: 2rem;
  bottom: 1.5rem;
  z-index: 3;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 0.25rem;
  background: rgba(17, 29, 61, 0.92);
  color: white;
  cursor: pointer;
  padding: 0.4rem 0.65rem;
  font: inherit;
  font-size: 0.875rem;
}

.carousel-progress {
  position: absolute;
  right: 36%;
  bottom: 1.65rem;
  left: 6rem;
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.progress-indicator {
  flex: 1;
  min-width: 0;
  height: 0.3rem;
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
    height: clamp(31rem, 145vw, 40rem);
  }

  .carousel-item {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 1rem;
    padding: 3.75rem 1rem 4.5rem;
  }

  .media-wrapper {
    padding: 1rem;
  }

  .slide-overlay {
    min-height: 7.75rem;
    padding: 1.1rem 1.25rem;
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

  .autoplay-button {
    top: 0.8rem;
    right: 0.8rem;
    bottom: auto;
  }

  .carousel-progress {
    right: 1rem;
    bottom: 1rem;
    left: 1rem;
  }

  .slide-eyebrow {
    margin-bottom: 0.45rem;
  }

  .slide-meta {
    margin-top: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner,
  .spinner circle,
  .progress-indicator.active .progress-bar {
    animation: none;
  }

  .background-image,
  .carousel-track,
  .nav-button {
    transition: none;
  }
}
</style>
