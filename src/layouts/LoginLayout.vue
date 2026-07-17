<template>
  <main
    class="auth-layout relative grid min-h-screen overflow-hidden lg:grid-cols-[minmax(704px,800px)_1fr]"
  >
    <AuthBackgroundDecoration />

    <section
      class="relative z-10 flex items-center justify-center px-6 py-12 lg:justify-end lg:pr-12 lg:pl-0"
    >
      <RouterView />
    </section>

    <section
      class="relative z-10 hidden -translate-y-14 items-center justify-start pr-8 pl-12 lg:flex"
    >
      <h1 class="auth-hero-title w-full max-w-[720px]">
        连接每一次协作，推动每一次交付
      </h1>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AuthBackgroundDecoration from './components/AuthBackgroundDecoration.vue'
</script>
