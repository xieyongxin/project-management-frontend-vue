<template>
  <main class="auth-layout">
    <AuthBackgroundDecoration />

    <div class="auth-container">
      <section class="auth-card-slot" aria-label="登录表单">
        <slot />
      </section>

      <section class="auth-slogan" aria-label="产品标语">
        <slot name="hero" />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import AuthBackgroundDecoration from './components/AuthBackgroundDecoration.vue'
</script>
