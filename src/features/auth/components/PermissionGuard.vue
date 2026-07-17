<template>
  <slot v-if="allowed" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentUser } from '../composables/auth.queries'

const props = defineProps<{
  permissions: readonly string[]
}>()
const currentUser = useCurrentUser()
const allowed = computed(() => {
  const permissions = currentUser.data.value?.permissions

  return props.permissions.every((permission) => permissions?.has(permission))
})
</script>
