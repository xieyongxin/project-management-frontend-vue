<template>
  <ElConfigProvider :size="'large'">
    <ElCard class="login-card" shadow="never">
      <BrandMark size="large" subtitle="内部研发与测试协作管理系统" />

      <div class="login-tabs" role="tablist" aria-label="登录方式">
        <button
          type="button"
          :class="['login-tab', { 'is-active': activeLoginMode === 'wecom' }]"
          role="tab"
          :aria-selected="activeLoginMode === 'wecom'"
          aria-controls="wecom-login-panel"
          @click="activeLoginMode = 'wecom'"
        >
          企业微信扫码
        </button>
        <button
          type="button"
          :class="['login-tab', { 'is-active': activeLoginMode === 'email' }]"
          role="tab"
          :aria-selected="activeLoginMode === 'email'"
          aria-controls="email-login-panel"
          @click="activeLoginMode = 'email'"
        >
          邮箱登录
        </button>
      </div>

      <ElAlert
        v-if="errorMessage"
        class="login-alert"
        type="error"
        show-icon
        :closable="false"
        :title="errorMessage"
      />

      <section
        v-show="activeLoginMode === 'wecom'"
        id="wecom-login-panel"
        class="wecom-panel"
        role="tabpanel"
        aria-label="企业微信扫码登录"
      >
        <div class="wecom-qr" aria-hidden="true">
          <div class="wecom-qr-mark">
            <ElIcon><Connection /></ElIcon>
          </div>
        </div>
        <p class="login-hint">
          使用企业微信扫码完成统一身份认证。若当前浏览器无法唤起扫码，请打开授权入口继续。
        </p>
        <ElButton
          class="login-submit-button"
          type="primary"
          size="large"
          :loading="wecomAuthorizeMutation.isPending.value"
          @click="startWecomLogin"
        >
          打开扫码授权
        </ElButton>
      </section>

      <ElForm
        v-show="activeLoginMode === 'email'"
        id="email-login-panel"
        class="email-login-form"
        novalidate
        role="tabpanel"
        aria-label="邮箱登录"
        @submit.prevent="submit"
      >
        <div class="login-fields">
          <FormTextField
            v-model="form.email"
            label="邮箱地址"
            hide-label
            autocomplete="username"
            placeholder="请输入邮箱地址"
            :error="fieldErrors.email"
            size="large"
          >
            <template #prefix>
              <ElIcon><Message /></ElIcon>
            </template>
          </FormTextField>
          <FormTextField
            v-model="form.password"
            label="密码"
            hide-label
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            :error="fieldErrors.password"
            size="large"
          >
            <template #prefix>
              <ElIcon><Lock /></ElIcon>
            </template>
          </FormTextField>
        </div>

        <div class="login-options">
          <ElCheckbox v-model="rememberEmail">记住账号</ElCheckbox>
          <ElButton
            class="login-link"
            link
            type="primary"
            @click="showResetHelp"
          >
            忘记密码？
          </ElButton>
        </div>

        <ElButton
          class="login-submit-button"
          type="primary"
          native-type="submit"
          size="large"
          :loading="loginMutation.isPending.value"
        >
          登录
        </ElButton>
      </ElForm>
    </ElCard>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { Connection, Lock, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppError } from '@/shared/api'
import { BrandMark } from '@/shared/components'
import { FormTextField } from '@/shared/form'
import { useLogin, useWecomAuthorize } from '../composables/auth.queries'
import { loginSchema } from '../model/login.schema'
import { resolveSafeReturnTo } from '../model/return-to'
import type { LoginCredentials } from '../model/login.schema'

const rememberedEmailStorageKey = 'project-management.remembered-email'
const router = useRouter()
const route = useRoute()
const loginMutation = useLogin()
const wecomAuthorizeMutation = useWecomAuthorize()
const activeLoginMode = ref<'wecom' | 'email'>('wecom')
const rememberEmail = ref(
  Boolean(window.localStorage.getItem(rememberedEmailStorageKey)),
)
const form = reactive<LoginCredentials>({
  email: window.localStorage.getItem(rememberedEmailStorageKey) ?? '',
  password: '',
})
const fieldErrors = reactive<
  Record<keyof LoginCredentials, string | undefined>
>({
  email: undefined,
  password: undefined,
})
const errorMessage = computed(() => {
  const error = loginMutation.error.value

  if (!error) {
    return undefined
  }

  return error instanceof AppError ? error.message : '登录失败，请重试。'
})

onMounted(() => {
  document.title = '登录 · 项目协作工作台'
})

const startWecomLogin = async () => {
  try {
    const authorizeUrl = await wecomAuthorizeMutation.mutateAsync(
      resolveSafeReturnTo(route.query.returnTo),
    )
    window.location.assign(authorizeUrl)
  } catch {
    ElMessage.error('企业微信授权地址获取失败，请稍后重试。')
  }
}

const validateForm = () => {
  fieldErrors.email = undefined
  fieldErrors.password = undefined
  const result = loginSchema.safeParse(form)

  if (result.success) {
    return result.data
  }

  result.error.issues.forEach((issue) => {
    const field = issue.path[0]

    if (field === 'email' || field === 'password') {
      fieldErrors[field] = issue.message
    }
  })

  return undefined
}

const submit = async () => {
  const credentials = validateForm()

  if (!credentials) {
    return
  }

  try {
    await loginMutation.mutateAsync(credentials)

    if (rememberEmail.value) {
      window.localStorage.setItem(rememberedEmailStorageKey, credentials.email)
    } else {
      window.localStorage.removeItem(rememberedEmailStorageKey)
    }

    await router.replace(resolveSafeReturnTo(route.query.returnTo))
  } catch {
    // Mutation 状态负责渲染统一 AppError，保留表单输入供用户修正。
  }
}

const showResetHelp = () => {
  ElMessage.info('请联系系统管理员重置密码。')
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

.login-card :deep(.el-input__wrapper) {
  min-height: var(--auth-control-height);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 0 0 1px #d8e4f5 inset;
}

.login-card :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px #1677ff inset,
    0 0 0 4px rgba(22, 119, 255, 0.08);
}

.login-card :deep(.el-button--large) {
  min-height: var(--auth-control-height);
  border-radius: 10px;
  font-size: 22px;
}

.login-card :deep(.el-button--primary) {
  background: linear-gradient(90deg, #1a73ff, #1570ff);
  border-color: transparent;
}

.login-card :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(22, 119, 255, 0.25);
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
  color: var(--color-text-secondary);
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
}

.wecom-qr-mark {
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
  width: 100%;
  margin-top: 32px;
}

.login-hint {
  margin: 24px 0 0;
  color: var(--color-text-secondary);
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
