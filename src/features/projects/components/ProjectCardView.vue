<template>
  <section class="project-card-grid">
    <article
      v-for="project in projects"
      :key="project.id"
      class="project-card"
      @click="emit('open', project)"
    >
      <div class="project-card__header">
        <div>
          <h3>{{ project.name }}</h3>
          <p>{{ project.identifier }} · {{ methodLabel[project.method] }}</p>
        </div>
        <StatusTag
          :label="healthLabel[project.health_status]"
          :tone="healthTone[project.health_status]"
        />
      </div>
      <p class="project-card__stage">{{ project.current_stage }}</p>
      <ElProgress
        :percentage="project.task_completion_rate"
        :stroke-width="8"
      />
      <div class="project-card__meta">
        <span>负责人：{{ project.owner.display_name }}</span>
        <span>缺陷：{{ project.blocker_or_critical_defect_count }}</span>
      </div>
      <p class="project-card__risk">{{ project.risk_summary }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { StatusTag } from '@/shared/components'
import { healthLabel, healthTone, methodLabel } from '../model/project-labels'
import type { ProjectSummary } from '../model/project.types'

defineProps<{
  projects: ProjectSummary[]
}>()

const emit = defineEmits<{
  open: [project: ProjectSummary]
}>()
</script>

<style scoped>
.project-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
}

.project-card {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  cursor: pointer;
  background: var(--app-panel-background);
  border: var(--border-width) solid var(--app-panel-border);
  border-radius: var(--app-panel-radius);
  box-shadow: var(--app-panel-shadow);
}

.project-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.project-card__header,
.project-card__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.project-card h3,
.project-card p {
  margin: 0;
}

.project-card h3 {
  font-size: var(--font-size-title-sm);
}

.project-card__header p,
.project-card__stage,
.project-card__meta,
.project-card__risk {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}

.project-card__risk {
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
}
</style>
