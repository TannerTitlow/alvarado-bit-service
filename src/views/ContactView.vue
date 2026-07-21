<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const formData = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
})

const loading = ref(false)
const submitStatus = ref(null)

const submitForm = async e => {
  e.preventDefault()
  loading.value = true
  submitStatus.value = null

  try {
    // Add timestamp to submission
    const submission = {
      ...formData.value,
      created_at: new Date().toISOString(),
      status: 'new',
    }

    const { error } = await supabase
      .from('contact_submissions')
      .insert([submission])

    if (error) throw error

    // Clear form on success
    formData.value = {
      name: '',
      email: '',
      phone: '',
      message: '',
    }

    submitStatus.value = {
      type: 'success',
      message: "Thank you for your message. We'll be in touch soon!",
    }
  } catch (error) {
    console.error('Error:', error)
    submitStatus.value = {
      type: 'error',
      message:
        'There was an error submitting your message. Please try again or contact us directly.',
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main id="main-content" class="contact">
    <section class="contact-hero">
      <div class="content">
        <h1>Contact Us</h1>
        <p>Available 24/7 anywhere in the United States</p>
      </div>
    </section>

    <section class="contact-content">
      <div class="container">
        <div class="availability-banner">
          <h2>Here When You Need Us</h2>
          <p>
            Feel free to call, message, or email us 24 hours a day. We
            understand that drilling operations don't stop, and neither do we.
          </p>
        </div>

        <div class="contact-grid">
          <div class="contact-info">
            <h2>Get In Touch</h2>
            <div class="info-items">
              <div class="info-item location-card">
                <h3>Headquarters & Coverage</h3>
                <p class="location-intro">
                  Texas headquarters with dedicated Georgia field coverage.
                </p>
                <div class="locations">
                  <div class="address address-hq">
                    <p class="location-label">Main Shop - Texas</p>
                    <p class="location-name">Alvarado Bit Service</p>
                    <p>841 Hill County Road 1136</p>
                    <p>Rio Vista, TX 76093</p>
                  </div>
                  <div class="address address-rep">
                    <p class="location-label">Georgia Coverage</p>
                    <p class="location-name">Stephen Schafer</p>
                    <p class="location-phone">
                      <a href="tel:+18172408551">817-240-8551</a>
                    </p>
                    <p class="location-note">
                      Serving customers across Georgia
                    </p>
                  </div>
                </div>
              </div>

              <div class="info-item">
                <h3>Contact Team</h3>
                <div class="contact-person">
                  <p class="name">Mark Turner</p>
                  <p><a href="tel:+18172404996">817-240-4996</a></p>
                </div>
                <div class="contact-person">
                  <p class="name">Stephen Schafer</p>
                  <p><a href="tel:+18172408551">817-240-8551</a></p>
                </div>
                <div class="contact-person">
                  <p class="name">Adam Torres</p>
                  <p><a href="tel:+18172051672">817-205-1672</a></p>
                </div>
              </div>

              <div class="info-item">
                <h3>Email</h3>
                <p>
                  <a href="mailto:Mark.turner6987@gmail.com"
                    >Mark.turner6987@gmail.com</a
                  >
                </p>
              </div>

              <div class="info-item guarantee">
                <h3>Our Promise</h3>
                <p class="fw-medium">
                  100% Customer Satisfaction Guaranteed on all products and
                  services.
                </p>
                <p class="availability">
                  Available anytime, anywhere for your drilling needs
                </p>
              </div>
            </div>
          </div>

          <form class="contact-form" @submit="submitForm">
            <h2>Send us a Message</h2>
            <p class="form-intro">
              Need immediate assistance? Don't hesitate to reach out at any
              time.
            </p>

            <!-- Status Messages -->
            <div
              v-if="submitStatus"
              :class="['status-message', submitStatus.type]"
            >
              {{ submitStatus.message }}
            </div>

            <div class="form-group">
              <label for="name">Name</label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                required
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                required
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                v-model="formData.phone"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="message">Message</label>
              <textarea
                id="message"
                v-model="formData.message"
                rows="4"
                required
                :disabled="loading"
              ></textarea>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? 'Sending...' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.contact {
  padding-top: 64px;
}

.contact-hero {
  background:
    linear-gradient(rgba(27, 43, 82, 0.85), rgba(27, 43, 82, 0.85)),
    url('@/assets/images/american-flag.jpg') center/cover;
  padding: 6rem 2rem;
  color: white;
  text-align: center;
}

.contact-hero h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.contact-hero p {
  font-size: 1.25rem;
}

.contact-content {
  padding: 4rem 2rem;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.availability-banner {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
  padding: 2rem;
  background: var(--navy-blue);
  color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.availability-banner h2 {
  color: white;
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

.availability-banner p {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.contact-info h2,
.contact-form h2 {
  color: #1b2b52;
  font-size: 1.75rem;
  margin-bottom: 2rem;
}

.info-items {
  display: grid;
  gap: 2rem;
}

.info-item {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-item h3 {
  color: #b22234;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.info-item p {
  color: #707070;
  line-height: 1.5;
}

.location-card {
  padding: 1.75rem;
  border: 1px solid #e6eaf0;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(27, 43, 82, 0.08);
}

.location-card h3 {
  margin-bottom: 0.5rem;
}

.location-intro {
  margin-bottom: 1.1rem;
  color: #5b6475;
  font-size: 0.96rem;
}

.locations {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
}

.address {
  background: #fff;
  border: 1px solid #ebeff5;
  border-radius: 0.5rem;
  padding: 1rem 1rem 1.05rem;
  display: grid;
  gap: 0.28rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 3px 14px rgba(17, 24, 39, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.address-hq {
  border-left: 4px solid #1b2b52;
}

.address-rep {
  border-left: 4px solid #b22234;
}

.location-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: 1.85rem;
  box-sizing: border-box;
  white-space: nowrap;
  font-size: 0.72rem;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.35rem;
  padding: 0 0.65rem;
  border-radius: 999px;
  color: #1b2b52;
  background: #e8eefc;
}

.address-rep .location-label {
  color: #8b1a28;
  background: #fdecef;
}

.location-name {
  font-weight: 700;
  color: #1b2b52;
  font-size: 1.15rem;
  line-height: 1.25;
  margin-bottom: 0.35rem;
}

.address p {
  margin: 0;
}

.location-phone a {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: #0f2a5f;
  background: #eef3ff;
  border: 1px solid #d9e2f7;
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
}

.location-phone a:hover {
  color: #8b1a28;
  border-color: #f5cfd6;
  background: #fff5f7;
}

.location-note {
  color: #586274;
}

@media (hover: hover) {
  .address:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(17, 24, 39, 0.12);
  }
}

.info-item.guarantee {
  background: #f8f9fa;
  border: 2px solid #b22234;
}

.info-item.guarantee .availability {
  margin-top: 0.5rem;
  font-weight: 500;
  color: #1b2b52;
}

.contact-person {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.contact-person:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.contact-person .name {
  font-weight: var(--fw-semibold);
  color: #1b2b52;
  margin-bottom: 0.25rem;
}

.info-item a {
  color: #707070;
  text-decoration: none;
  transition: color 0.2s ease;
}

.info-item a:hover {
  color: #b22234;
}

.contact-form {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-intro {
  color: #707070;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #1b2b52;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1b2b52;
}

.submit-btn {
  background: #b22234;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.375rem;
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
}

.submit-btn:hover {
  background-color: #8b1a28;
}

.status-message {
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
  font-weight: var(--fw-medium);
}

.status-message.success {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #059669;
}

.status-message.error {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #dc2626;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .contact {
    padding-top: 109px; /* Increased padding for two-line mobile nav */
  }

  .contact-hero {
    padding: 4rem 1rem;
  }

  .contact-hero h1 {
    font-size: 2.5rem;
  }

  .contact-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .contact-content {
    padding: 2rem 1rem;
  }

  .availability-banner {
    margin-bottom: 2rem;
    padding: 1.5rem;
  }

  .availability-banner h2 {
    font-size: 1.5rem;
  }

  .availability-banner p {
    font-size: 1rem;
  }

  .locations {
    grid-template-columns: 1fr;
  }

  .location-card {
    padding: 1.35rem;
  }
}
</style>
