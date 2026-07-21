<template>
  <ElConfigProvider :size="'large'">
    <ElCard class="login-card" shadow="never">
      <BrandMark size="large" subtitle="内部研发与测试协作管理系统" />

      <ElAlert
        v-if="errorMessage"
        class="login-alert"
        type="error"
        show-icon
        :closable="false"
        :title="errorMessage"
      />

      <ElForm
        id="wecom-login-panel"
        class="wecom-panel"
        novalidate
        aria-label="企业微信扫码登录"
        @submit.prevent="submitMockWecomLogin"
      >
        <div class="wecom-qr" aria-label="企业微信登录二维码">
          <iframe
            v-if="canEmbedQr"
            class="wecom-qr__frame"
            :src="wecomTarget?.qr_code_url"
            title="企业微信扫码登录"
          />
          <div v-if="!canEmbedQr" class="wecom-qr-mark">
            <ElIcon><Connection /></ElIcon>
          </div>
        </div>
        <p class="login-hint">
          使用企业微信扫码完成统一身份认证。当前阶段无法对接企微时，可输入邮箱模拟扫码；邮箱不存在会自动创建用户。
        </p>
        <FormTextField
          v-if="!canEmbedQr"
          v-model="form.email"
          class="mock-wecom-email"
          label="邮箱地址"
          hide-label
          autocomplete="username"
          placeholder="请输入邮箱模拟企业微信扫码"
          :error="fieldErrors.email"
          size="large"
          variant="auth"
        >
          <template #prefix>
            <ElIcon><Message /></ElIcon>
          </template>
        </FormTextField>
        <AppButton
          class="login-secondary-button"
          :loading="wecomLoading"
          @click="emit('refreshWecom')"
        >
          刷新二维码
        </AppButton>
        <AppButton
          class="login-submit-button"
          type="primary"
          size="large"
          variant="auth"
          :loading="wecomLoading"
          :native-type="canEmbedQr ? 'button' : 'submit'"
          @click="canEmbedQr ? emit('wecomLogin') : undefined"
        >
          {{ canEmbedQr ? '打开授权入口' : '模拟扫码登录' }}
        </AppButton>
      </ElForm>
    </ElCard>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { Connection, Message } from '@element-plus/icons-vue'
import { computed, reactive, ref } from 'vue'
import { AppButton, BrandMark } from '@/shared/components'
import { FormTextField } from '@/shared/form'
import type { WecomAuthorizeResponse } from '../model/current-user'
import { loginSchema, type LoginCredentials } from '../model/login.schema'

const props = withDefaults(
  defineProps<{
    initialEmail?: string
    initialRememberEmail?: boolean
    emailLoading?: boolean
    wecomLoading?: boolean
    wecomTarget?: WecomAuthorizeResponse | undefined
    errorMessage?: string | undefined
  }>(),
  {
    initialEmail: '',
    initialRememberEmail: false,
    emailLoading: false,
    wecomLoading: false,
    wecomTarget: undefined,
    errorMessage: undefined,
  },
)

const emit = defineEmits<{
  submit: [payload: { credentials: LoginCredentials; rememberEmail: boolean }]
  refreshWecom: []
  wecomLogin: []
}>()

const rememberEmail = ref(props.initialRememberEmail)
const form = reactive<LoginCredentials>({
  email: props.initialEmail,
})
const fieldErrors = reactive<
  Record<keyof LoginCredentials, string | undefined>
>({
  email: undefined,
})

const canEmbedQr = computed(() =>
  props.wecomTarget?.qr_code_url?.startsWith('https://open.work.weixin.qq.com'),
)

const validateForm = () => {
  fieldErrors.email = undefined
  const result = loginSchema.safeParse(form)

  if (result.success) {
    return result.data
  }

  result.error.issues.forEach((issue) => {
    const field = issue.path[0]

    if (field === 'email') {
      fieldErrors[field] = issue.message
    }
  })

  return undefined
}

const submitEmailLogin = () => {
  const credentials = validateForm()

  if (!credentials) {
    return
  }

  emit('submit', {
    credentials,
    rememberEmail: rememberEmail.value,
  })
}

const submitMockWecomLogin = () => {
  if (canEmbedQr.value) {
    return
  }

  submitEmailLogin()
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: var(--auth-card-width);
  border: 0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 60px rgba(24, 76, 166, 0.08);
  backdrop-filter: blur(20px);
}

.login-card :deep(.el-card__body) {
  padding: var(--auth-card-padding-block) var(--auth-card-padding-inline);
}

.login-card :deep(.brand-title-large) {
  color: #1c2e5d;
  font-size: 40px;
  line-height: 1.15;
  letter-spacing: 0;
}

.login-card :deep(.brand-subtitle) {
  margin-top: 8px;
  color: #8c96a8;
  font-size: 15px;
  line-height: var(--line-height-normal);
}

.login-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 40px;
  padding: 4px;
  border: 1px solid #d8e4f5;
  border-radius: 12px;
  background: rgba(247, 250, 255, 0.86);
}

.login-tab {
  height: 44px;
  border: 0;
  border-radius: 9px;
  color: var(--app-text-secondary);
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  transition:
    color var(--duration-normal) var(--ease-standard),
    background var(--duration-normal) var(--ease-standard),
    box-shadow var(--duration-normal) var(--ease-standard);
}

.login-tab.is-active {
  color: #1677ff;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(24, 76, 166, 0.08);
}

.login-alert {
  margin-top: 20px;
}

.wecom-panel,
.email-login-form {
  margin-top: 32px;
}

.wecom-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wecom-qr {
  position: relative;
  display: grid;
  width: 212px;
  height: 212px;
  place-items: center;
  border: 1px solid #d8e4f5;
  border-radius: 18px;
  background:
    linear-gradient(90deg, #1f315d 10px, transparent 10px) 0 0 / 42px 42px,
    linear-gradient(#1f315d 10px, transparent 10px) 0 0 / 42px 42px,
    linear-gradient(90deg, rgba(22, 119, 255, 0.18) 2px, transparent 2px) 0 0 /
      14px 14px,
    linear-gradient(rgba(22, 119, 255, 0.18) 2px, transparent 2px) 0 0 / 14px
      14px,
    #ffffff;
  box-shadow: 0 14px 34px rgba(24, 76, 166, 0.08);
  overflow: hidden;
}

.wecom-qr__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: #ffffff;
}

.wecom-qr-mark {
  position: relative;
  z-index: 1;
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border-radius: 20px;
  color: #ffffff;
  background: linear-gradient(135deg, #1677ff, #4ea1ff);
  box-shadow: 0 10px 24px rgba(22, 119, 255, 0.22);
}

.wecom-qr-mark .el-icon {
  font-size: 32px;
}

.login-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32px;
  color: #666666;
}

.login-link {
  font-size: 15px;
}

.login-submit-button {
  margin-top: 32px;
}

.login-secondary-button {
  margin-top: 20px;
}

.login-hint {
  margin: 24px 0 0;
  color: var(--app-text-secondary);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-normal);
  text-align: center;
}

@media (max-width: 767px) {
  .login-card :deep(.brand-title-large) {
    font-size: 28px;
  }

  .login-card :deep(.brand-subtitle) {
    white-space: normal;
  }
}
</style>
