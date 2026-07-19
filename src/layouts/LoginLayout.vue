<template>
  <main class="auth-layout">
    <AuthBackgroundDecoration />

    <div class="auth-container">
      <section class="auth-card-slot" aria-label="登录表单">
        <RouterView />
      </section>

      <section class="auth-slogan" aria-label="产品标语">
        <h1 class="auth-hero-title">
          <span>连接每一次协作，</span>
          <span>推动每一次交付</span>
        </h1>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AuthBackgroundDecoration from './components/AuthBackgroundDecoration.vue'
</script>
