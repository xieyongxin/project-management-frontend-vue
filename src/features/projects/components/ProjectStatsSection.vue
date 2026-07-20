<template>
  <div class="project-stats-grid">
    <SummaryCard
      v-for="card in cards"
      :key="card.key"
      :label="card.label"
      :value="card.value"
      :description="card.description"
      :tone="card.tone"
      :active="card.active"
      @click="emit('apply', card.status, card.riskStatus)"
    >
      <template #icon>
        <ElIcon><component :is="card.icon" /></ElIcon>
      </template>
    </SummaryCard>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { SummaryCard } from '@/shared/components'
import type { ProjectListQuery } from '../model/project-list-query'

export interface ProjectStatsCard {
  key: string
  label: string
  value: string | number
  description: string
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  icon: Component
  status: ProjectListQuery['status']
  riskStatus: ProjectListQuery['riskStatus']
  active: boolean
}

defineProps<{
  cards: ProjectStatsCard[]
}>()

const emit = defineEmits<{
  apply: [
    status: ProjectListQuery['status'],
    riskStatus: ProjectListQuery['riskStatus'],
  ]
}>()
</script>

<style scoped>
.project-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-2);
}
</style>
