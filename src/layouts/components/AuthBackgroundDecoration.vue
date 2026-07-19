<template>
  <div class="auth-blur auth-blur-1" aria-hidden="true" />
  <div class="auth-blur auth-blur-2" aria-hidden="true" />
  <div class="auth-grid" aria-hidden="true" />

  <div class="auth-pulse-node auth-pulse-node-blue" aria-hidden="true" />
  <div class="auth-pulse-node auth-pulse-node-green" aria-hidden="true" />
  <div class="auth-pulse-node auth-pulse-node-purple" aria-hidden="true" />
  <div class="auth-pulse-node auth-pulse-node-orange" aria-hidden="true" />

  <svg
    class="auth-background-svg"
    viewBox="0 0 1920 1080"
    fill="none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="auth-line-blue" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a9d7ff" />
        <stop offset="50%" stop-color="#5caeff" />
        <stop offset="100%" stop-color="#4d83ff" />
      </linearGradient>

      <filter id="auth-glow">
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="4"
          flood-color="#6ea8ff"
          flood-opacity="0.35"
        />
      </filter>
    </defs>

    <path
      d="M1180 -80C1600 120 1700 250 1940 180"
      stroke="url(#auth-line-blue)"
      stroke-width="2"
      opacity="0.8"
      filter="url(#auth-glow)"
    />
    <path
      d="M980 1080C1180 820 1450 640 1940 520"
      stroke="url(#auth-line-blue)"
      stroke-width="2"
      opacity="0.55"
    />
    <path
      d="M500 1080C980 820 1450 880 1940 640"
      stroke="url(#auth-line-blue)"
      stroke-width="2"
      opacity="0.45"
    />

    <circle cx="1450" cy="150" r="500" stroke="#dcecff" stroke-width="1" />
    <circle cx="1550" cy="980" r="550" stroke="#dcecff" stroke-width="1" />
    <circle cx="850" cy="250" r="900" stroke="#eef6ff" stroke-width="1" />
  </svg>
</template>
