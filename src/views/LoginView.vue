<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async e => {
  e.preventDefault()
  loading.value = true
  errorMsg.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    router.push('/admin')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="admin-login">
    <div class="login-container">
      <div class="login-card">
        <img src="@/assets/abs-logo.png" alt="ABS Logo" class="login-logo" />
        <h1>Admin Login</h1>

        <form @submit="handleLogin" class="login-form">
          <div v-if="errorMsg" class="error-message">
            {{ errorMsg }}
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              :disabled="loading"
            />
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin-login {
  min-height: 100vh;
  padding-top: 64px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: block;
}

.login-card h1 {
  text-align: center;
  color: var(--navy-blue);
  font-size: var(--text-2xl);
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--navy-blue);
  font-weight: var(--fw-medium);
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  font-size: var(--text-base);
}

.form-group input:focus {
  outline: none;
  border-color: var(--navy-blue);
}

.login-btn {
  background: var(--patriot-red);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.login-btn:hover {
  background-color: #8b1a28;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background-color: #fef2f2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #dc2626;
  font-size: var(--text-sm);
}
</style>
