<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'About Us | Our Legacy Since 1976'
  document
    .querySelector('meta[name="description"]')
    .setAttribute(
      'content',
      'Family-owned since 1976, Alvarado Bit Service has built a nationwide reputation for excellence in water well drill bits manufacturing and service.',
    )
})
</script>

<template>
  <main class="about">
    <section class="about-hero">
      <div class="content">
        <h1>About Us</h1>
        <p>Family-owned excellence in drilling since 1976</p>
      </div>
    </section>

    <section class="company-info">
      <div class="container">
        <div class="mission-statement">
          <h2>Our Mission</h2>
          <p class="fw-medium">
            With over 48 years in the industry, Alvarado Bit Service has built
            and maintained a broad customer base all across the United States.
            We pride ourselves on our impeccable customer service and our high
            quality of products that we produce and maintain in house.
          </p>
          <div class="mission-highlights">
            <div class="highlight-card">
              <h3>Customer Satisfaction</h3>
              <p class="fw-medium">
                We stand behind all of our products and services with a 100%
                Customer Satisfaction Guarantee!
              </p>
            </div>
            <div class="highlight-card">
              <h3>24/7 Availability</h3>
              <p class="fw-medium">
                We are available anytime, anywhere that you may need our
                products or services.
              </p>
            </div>
            <div class="highlight-card">
              <h3>Industry Innovation</h3>
              <p class="fw-medium">
                Our Asteroid PDC bit has revolutionized the industry,
                significantly reducing drilling time and saving our customers
                money.
              </p>
            </div>
          </div>
        </div>

        <div class="history-section">
          <h2>Our Legacy</h2>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-content left">
                <div class="year">1976</div>
                <div class="event">
                  <h3>Where It All Began</h3>
                  <p>
                    Founded by Royce Turner as Royce's Carbide and Bit Service
                    in Fort Worth, Texas
                  </p>
                </div>
              </div>
            </div>

            <div class="timeline-item">
              <div class="timeline-content right">
                <div class="year">1996</div>
                <div class="event">
                  <h3>A New Chapter</h3>
                  <p>
                    Relocated to Alvarado, Texas, where Mark Turner took
                    leadership, establishing Alvarado Bit Service
                  </p>
                </div>
              </div>
            </div>

            <div class="timeline-item">
              <div class="timeline-content left">
                <div class="year">Today</div>
                <div class="event">
                  <h3>Continued Excellence</h3>
                  <p>
                    Nearly five decades of serving the drilling industry with
                    innovation and expertise
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="services-grid">
          <div class="service-card">
            <h3>Equipment Services</h3>
            <ul>
              <li>Tri-cone bits</li>
              <li>PDC bits</li>
              <li>Hole-openers</li>
              <li>Stabilizers</li>
            </ul>
          </div>

          <div class="service-card featured">
            <h3>The Asteroid PDC</h3>
            <p>
              "Time is Money" - Our revolutionary water well drilling bit is
              engineered for superior performance and maximum efficiency,
              significantly reducing drilling time.
            </p>
          </div>

          <div class="service-card">
            <h3>In-House Expertise</h3>
            <ul>
              <li>PDC repairs</li>
              <li>Custom retipping</li>
              <li>Bearing replacement</li>
              <li>Equipment restoration</li>
            </ul>
          </div>
        </div>

        <div class="testimonial-section">
          <h2>Customer Satisfaction</h2>
          <p>
            We have received numerous letters of recommendation and testimonials
            from satisfied customers about our products and services. Our
            commitment to quality and customer service has built lasting
            relationships across the United States.
          </p>
          <div class="cta-wrapper">
            <RouterLink to="/contact" class="cta-primary"
              >Get in Touch</RouterLink
            >
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about {
  padding-top: 64px;
}

.about-hero {
  background:
    linear-gradient(rgba(27, 43, 82, 0.85), rgba(27, 43, 82, 0.85)),
    url('@/assets/images/american-flag.jpg') center/cover;
  padding: 6rem 2rem;
  color: var(--pure-white);
  text-align: center;
}

.about-hero h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.about-hero p {
  font-size: 1.25rem;
}

.company-info {
  padding: 4rem 0;
  background: #f5f5f5;
}

.container {
  margin: 0 auto;
  width: 100%;
}

/* Mission Statement Styles */
.mission-statement {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
}

.mission-statement h2 {
  color: var(--navy-blue);
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.mission-statement > p {
  max-width: 900px;
  margin: 0 auto 3rem;
  color: var(--steel-gray);
  line-height: 1.6;
  font-size: 1.1rem;
}

.mission-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.cta-wrapper {
  margin-top: 2rem;
}

.cta-primary {
  display: inline-block;
  padding: 0.75rem 2rem;
  border-radius: 0.375rem;
  font-weight: 500;
  background-color: var(--patriot-red);
  color: var(--pure-white);
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-primary:hover {
  background-color: #8b1a28;
}

.highlight-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.highlight-card h3 {
  color: var(--patriot-red);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.highlight-card p {
  color: var(--steel-gray);
  line-height: 1.5;
}

/* Timeline styles */
.history-section {
  margin: 4rem 0;
  padding: 2rem;
  width: 100%;
  background:
    linear-gradient(rgba(27, 43, 82, 0.85), rgba(27, 43, 82, 0.85)),
    url('@/assets/images/country-road.jpg') center/cover;
}

.history-section h2 {
  color: var(--pure-white);
  font-size: 3rem;
  margin-bottom: 2rem;
  text-align: center;
}

.timeline {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 5px;
  height: 100%;
  background: var(--patriot-red);
  transform: translateX(-50%);
}

.timeline-item {
  margin-bottom: 3rem;
  width: 100%;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-content {
  display: flex;
  align-items: flex-start;
  width: 42%;
  position: relative;
}

.timeline-content.left {
  margin-left: auto;
  margin-right: 58%;
  flex-direction: row-reverse;
}

.timeline-content.right {
  margin-left: 58%;
  margin-right: auto;
}

.year {
  background: var(--patriot-red);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  min-width: 80px;
  text-align: center;
  margin: 0 1rem;
  z-index: 1;
}

.event {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
}

.event h3 {
  color: var(--navy-blue);
  margin-bottom: 0.5rem;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 0 auto 4rem;
  padding: 0 2rem;
  max-width: 1200px;
}

.service-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.service-card h3 {
  color: var(--navy-blue);
  margin-bottom: 1rem;
}

.service-card.featured {
  background: var(--navy-blue);
  color: white;
}

.service-card.featured h3 {
  color: white;
}

.service-card ul {
  list-style: none;
  padding: 0;
}

.service-card ul li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.service-card ul li::before {
  content: '•';
  color: var(--patriot-red);
  position: absolute;
  left: 0;
}

/* Testimonial Section */
.testimonial-section {
  text-align: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.testimonial-section h2 {
  color: var(--navy-blue);
  margin-bottom: 1rem;
}

.testimonial-section p {
  color: var(--steel-gray);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .about {
    padding-top: 109px; /* Increased padding for two-line mobile nav */
  }

  .about-hero {
    padding: 4rem 1rem;
  }

  .about-hero h1 {
    font-size: 2.5rem;
  }

  .timeline::before {
    left: 30px;
  }

  .timeline-content {
    width: calc(100% - 80px);
    margin-left: 60px !important;
    margin-right: 0 !important;
  }

  .timeline-content.left,
  .timeline-content.right {
    flex-direction: column;
  }

  .year {
    margin-bottom: 0.5rem;
    margin-left: 0;
    margin-right: 1rem;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .mission-highlights {
    grid-template-columns: 1fr;
  }
}
</style>
