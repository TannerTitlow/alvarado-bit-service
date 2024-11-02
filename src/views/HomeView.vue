<script setup>
import { onMounted } from 'vue'

const mp4Src = new URL('@/assets/videos/abs-2023-mobile.mp4', import.meta.url)
  .href
const webmSrc = new URL('@/assets/videos/abs-2023-mobile.webm', import.meta.url)
  .href

onMounted(() => {
  document.title = 'Alvarado Bit Service | American-Made Water Well Drill Bits'
  document
    .querySelector('meta[name="description"]')
    .setAttribute(
      'content',
      'Family-owned excellence in drilling since 1976. Specialized in manufacturing, selling, and repairing water well drill bits with nationwide 24/7 service.',
    )
})
</script>

<template>
  <main>
    <section class="hero">
      <div class="video-container">
        <video autoplay loop muted playsinline class="hero-video">
          <source :src="webmSrc" type="video/webm" />
          <source :src="mp4Src" type="video/mp4" />
        </video>
        <div class="overlay"></div>
      </div>
      <div class="hero-content">
        <img src="@/assets/abs-logo.png" alt="ABS Logo" class="hero-logo" />
        <h1>American-Made Excellence in Drilling</h1>
        <p>
          Serving the nation with innovative drill bits and superior service
          since 1976. Available 24/7 with a 100% satisfaction guarantee.
        </p>
        <div class="cta-buttons">
          <RouterLink to="/contact" class="cta-primary"
            >Get in Touch</RouterLink
          >
          <RouterLink to="/about" class="cta-secondary">Learn More</RouterLink>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="feature">
        <div class="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            class="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 19l-7-7 7-7m5 14l-7-7 7-7"
            />
          </svg>
        </div>
        <h3>The Asteroid PDC</h3>
        <p>
          Our revolutionary water well drill bit increases drilling speed,
          maximizing efficiency and saving you valuable time
        </p>
      </div>

      <div class="feature">
        <div class="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            class="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h3>Nationwide Service</h3>
        <p>
          Proudly serving customers across the United States with high-quality
          products and maintenance
        </p>
      </div>

      <div class="feature">
        <div class="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            class="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3>24/7 Availability</h3>
        <p>
          Available anytime, anywhere you need our products or services - just a
          call away
        </p>
      </div>

      <div class="feature">
        <div class="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            class="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h3>100% Satisfaction</h3>
        <p>
          Standing behind all our products and services with a complete
          satisfaction guarantee
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
:root {
  --navy-blue: #1b2b52;
  --patriot-red: #b22234;
  --steel-gray: #707070;
  --pure-white: #ffffff;
}

main {
  padding-top: 64px;
}

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--pure-white);
  overflow: hidden;
}

.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  object-fit: cover;
  z-index: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(27, 43, 82, 0.7);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 800px;
  padding: 2rem;
}

.hero-logo {
  width: 280px;
  height: 280px;
  margin: 0 auto 2rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-primary,
.cta-secondary {
  padding: 0.75rem 2rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
}

.cta-primary {
  background-color: var(--patriot-red);
  color: var(--pure-white);
}

.cta-primary:hover {
  background-color: #8b1a28;
}

.cta-secondary {
  background-color: transparent;
  border: 2px solid var(--pure-white);
  color: var(--pure-white);
}

.cta-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.features {
  display: grid;
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f5f5;
  grid-template-columns: repeat(1, 1fr);
}

.feature {
  text-align: center;
  padding: 2rem;
  background: var(--pure-white);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: var(--patriot-red);
  padding: 1rem;
  background: rgba(178, 34, 52, 0.1);
  border-radius: 50%;
}

.icon {
  width: 100%;
  height: 100%;
}

.feature h3 {
  color: var(--navy-blue);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.feature p {
  color: var(--steel-gray);
  line-height: 1.6;
}

@media (min-width: 768px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .features {
    grid-template-columns: repeat(4, 1fr);
  }

  .feature {
    padding: 1.5rem;
  }

  .feature h3 {
    font-size: 1.25rem;
  }

  .feature p {
    font-size: 0.9rem;
  }
}

@media (max-width: 767px) {
  .features {
    grid-template-columns: 1fr;
    padding: 2rem 1rem;
    gap: 1.5rem;
  }

  .feature {
    padding: 1.5rem;
  }

  .feature h3 {
    font-size: 1.25rem;
  }

  .hero {
    min-height: 100svh;
    padding: 3rem 1rem 2rem;
  }

  .hero-logo {
    width: 200px;
    height: 200px;
    margin: 0 auto 1.5rem;
  }

  .hero h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .hero p {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }

  .cta-buttons {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 1rem;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
}

@media screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) {
  .hero {
    height: 100svh;
    min-height: -webkit-fill-available;
  }
}

@supports (-webkit-touch-callout: none) {
  .hero {
    min-height: -webkit-fill-available;
  }
}
</style>
