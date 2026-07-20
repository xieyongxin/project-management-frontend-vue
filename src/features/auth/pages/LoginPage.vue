<template>
  <AuthLayout>
    <LoginForm
      :initial-email="rememberedEmail"
      :initial-remember-email="Boolean(rememberedEmail)"
      :email-loading="loginMutation.isPending.value"
      :wecom-loading="wecomAuthorizeMutation.isPending.value"
      :wecom-target="wecomTarget"
      :error-message="errorMessage"
      @submit="handleEmailLogin"
      @refresh-wecom="loadWecomTarget"
      @wecom-login="startWecomLogin"
      @reset-help="showResetHelp"
    />

    <template #hero>
      <AuthHero />
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AuthLayout } from '@/layouts'
import { AppError } from '@/shared/api'
import AuthHero from '../components/AuthHero.vue'
import LoginForm from '../components/LoginForm.vue'
import { useLogin, useWecomAuthorize } from '../composables/auth.queries'
import type { WecomAuthorizeResponse } from '../model/current-user'
import { resolveSafeReturnTo } from '../model/return-to'
import type { LoginCredentials } from '../model/login.schema'

const rememberedEmailStorageKey = 'project-management.remembered-email'
const router = useRouter()
const route = useRoute()
const loginMutation = useLogin()
const wecomAuthorizeMutation = useWecomAuthorize()
const wecomTarget = ref<WecomAuthorizeResponse>()
const rememberedEmail =
  window.localStorage.getItem(rememberedEmailStorageKey) ?? ''
const errorMessage = computed(() => {
  const error = loginMutation.error.value

  if (!error) {
    return undefined
  }

  return error instanceof AppError ? error.message : '登录失败，请重试。'
})

onMounted(() => {
  document.title = '登录 · 项目协作工作台'
  void loadWecomTarget()
})

const loadWecomTarget = async () => {
  try {
    wecomTarget.value = await wecomAuthorizeMutation.mutateAsync(
      resolveSafeReturnTo(route.query.returnTo),
    )
  } catch {
    ElMessage.error('企业微信扫码入口获取失败，请稍后重试。')
  }
}

const startWecomLogin = async () => {
  if (!wecomTarget.value) {
    await loadWecomTarget()
  }

  if (wecomTarget.value?.authorize_url) {
    window.location.assign(wecomTarget.value.authorize_url)
  }
}

const handleEmailLogin = async (payload: {
  credentials: LoginCredentials
  rememberEmail: boolean
}) => {
  try {
    await loginMutation.mutateAsync(payload.credentials)

    if (payload.rememberEmail) {
      window.localStorage.setItem(
        rememberedEmailStorageKey,
        payload.credentials.email,
      )
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
