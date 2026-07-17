<template>
  <div
    :class="['flex items-center', size === 'large' ? 'gap-6' : 'gap-3']"
    aria-label="项目协作工作台"
  >
    <svg
      :class="size === 'large' ? 'h-[88px] w-[74px]' : 'h-10 w-9'"
      viewBox="0 0 74 88"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          :id="gradientId"
          x1="8"
          y1="11"
          x2="64"
          y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="var(--palette-blue-500)" />
          <stop offset="0.52" stop-color="var(--palette-blue-700)" />
          <stop offset="1" stop-color="var(--color-primary)" />
        </linearGradient>
      </defs>
      <path
        d="M31 3.5a14 14 0 0 1 14 0l18.7 10.8a14 14 0 0 1 7 12.1v34.2a14 14 0 0 1-7 12.1L45 83.5a14 14 0 0 1-14 0L12.3 72.7a14 14 0 0 1-7-12.1V26.4a14 14 0 0 1 7-12.1L31 3.5Z"
        :fill="`url(#${gradientId})`"
      />
      <path
        d="M45.8 19.3v42.4L36.5 67 21.1 58.1c-3.4-2-3.4-7 0-9l15-8.7-14.7-8.5c-3.5-2-3.5-7.1 0-9.1l15.3-8.8 9.1 5.3Z"
        fill="var(--palette-white)"
        opacity="0.96"
      />
      <path
        d="M51 24.2l8 4.6v29.4l-8 4.6V24.2Z"
        fill="var(--palette-blue-100)"
        opacity="0.9"
      />
    </svg>
    <span v-if="!compact" class="flex min-w-0 flex-col gap-1">
      <span
        :class="size === 'large' ? 'brand-title-large' : 'brand-title'"
        :style="{
          color: inverse ? 'var(--palette-white)' : 'var(--color-text-primary)',
        }"
      >
        项目协作工作台
      </span>
      <span v-if="subtitle" class="brand-subtitle">{{ subtitle }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    inverse?: boolean
    size?: 'default' | 'large'
    subtitle?: string | undefined
  }>(),
  {
    compact: false,
    inverse: false,
    size: 'default',
  },
)
const gradientId = computed(() => `brand-gradient-${props.size}`)
</script>
