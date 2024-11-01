<script setup>
import { RouterLink, RouterView } from 'vue-router'
import './assets/fonts.css'
</script>

<template>
  <div class="app">
    <header class="header">
      <nav class="nav">
        <div class="company-name">
          <RouterLink to="/">
            <img src="@/assets/abs-logo.png" alt="ABS Logo" class="logo" />
            <span>Alvarado Bit Service</span>
          </RouterLink>
        </div>
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          <RouterLink to="/about" class="nav-link">About</RouterLink>
          <RouterLink to="/contact" class="nav-link">Contact</RouterLink>
        </div>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style>
@import './assets/fonts.css';
.app {
  min-height: 100vh;
  font-family: var(--font-primary);
  background-color: #f5f5f5;
}

.header {
  background: var(--pure-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-name a {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--font-logo);
  font-weight: var(--fw-semibold);
  font-size: var(--text-2xl);
  color: var(--navy-blue);
  text-decoration: none;
  line-height: var(--leading-tight);
}

.logo {
  height: 40px;
  width: 40px;
  border-radius: 50%;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--steel-gray);
  text-decoration: none;
  font-size: var(--text-base);
  transition: color 0.2s ease;
  font-weight: var(--fw-medium);
  line-height: var(--leading-normal);
}

.nav-link:hover {
  color: var(--patriot-red);
}

.router-link-active {
  color: var(--patriot-red);
  font-weight: var(--fw-semibold);
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .company-name a {
    font-size: var(--text-lg); /* Slightly smaller on mobile */
  }

  .nav-link {
    font-size: var(--text-sm); /* Slightly smaller on mobile */
  }
}
</style>
