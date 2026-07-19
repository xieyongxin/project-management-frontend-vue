<template>
  <ElButton
    class="app-button"
    :class="{ 'app-button--auth': variant === 'auth' }"
    :type="type"
    :native-type="nativeType"
    :loading="loading"
    :disabled="disabled"
    :link="link"
    :text="text"
    :plain="plain"
    :size="size"
    v-bind="$attrs"
  >
    <slot />
  </ElButton>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    type?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger'
    nativeType?: 'button' | 'submit' | 'reset'
    size?: 'large' | 'default' | 'small'
    loading?: boolean
    disabled?: boolean
    link?: boolean
    text?: boolean
    plain?: boolean
    variant?: 'default' | 'auth'
  }>(),
  {
    type: 'default',
    nativeType: 'button',
    size: 'default',
    loading: false,
    disabled: false,
    link: false,
    text: false,
    plain: false,
    variant: 'default',
  },
)
</script>

<style scoped>
.app-button {
  min-height: var(--app-button-height);
  border-radius: var(--app-radius-md);
  font-weight: var(--font-weight-medium);
}

.app-button.el-button.is-link {
  min-height: auto;
  padding: 0;
}

.app-button--auth {
  width: 100%;
  min-height: var(--auth-control-height);
  border-radius: 10px;
  font-size: 22px;
}

.app-button--auth.el-button--primary {
  background: linear-gradient(90deg, #1a73ff, #1570ff);
  border-color: transparent;
}

.app-button--auth.el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(22, 119, 255, 0.25);
}
</style>
