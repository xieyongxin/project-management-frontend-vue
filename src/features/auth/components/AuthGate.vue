<template>
  <div v-if="isPending" class="min-h-screen p-[var(--space-3)]">
    <AsyncPageSkeleton />
  </div>

  <PageError
    v-else-if="isError && !isUnauthorized"
    @retry="currentUser.refetch()"
  />

  <slot v-else-if="user" :user="user" />
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppError } from '@/shared/api'
import { AsyncPageSkeleton, PageError } from '@/shared/components'
import { useCurrentUser } from '../composables/auth.queries'

const route = useRoute()
const router = useRouter()
const currentUser = useCurrentUser()
const user = computed(() => currentUser.data.value)
const isPending = computed(() => currentUser.isPending.value)
const isError = computed(() => currentUser.isError.value)
const isUnauthorized = computed(
  () =>
    currentUser.error.value instanceof AppError &&
    currentUser.error.value.status === 401,
)

watchEffect(() => {
  if (!isUnauthorized.value) {
    return
  }

  void router.replace({
    path: '/login',
    query: { returnTo: route.fullPath },
  })
})
</script>
