<template>
  <ElConfigProvider :size="'large'">
    <ElCard
      class="auth-card w-full max-w-[var(--auth-card-width)]"
      shadow="never"
    >
      <BrandMark size="large" subtitle="内部研发与测试协作管理系统" />

      <ElAlert
        v-if="errorMessage"
        class="mt-8"
        type="error"
        show-icon
        :closable="false"
        :title="errorMessage"
      />

      <section class="mt-12" aria-label="企业微信登录">
        <ElButton
          class="auth-wecom-button w-full"
          type="primary"
          size="large"
          :loading="wecomAuthorizeMutation.isPending.value"
          @click="startWecomLogin"
        >
          <ElIcon><Connection /></ElIcon>
          企业微信授权登录
        </ElButton>
        <p class="auth-login-hint">
          员工使用企业微信统一身份登录；停用、离职或未同步用户将被拒绝访问。
        </p>
      </section>

      <ElDivider class="auth-divider">应急管理员入口</ElDivider>

      <ElForm class="mt-8" novalidate @submit.prevent="submit">
        <div class="flex flex-col gap-8">
          <FormTextField
            v-model="form.email"
            label="邮箱地址"
            hide-label
            autocomplete="username"
            placeholder="请输入应急管理员邮箱"
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

        <div class="mt-10 flex items-center justify-between">
          <ElCheckbox v-model="rememberEmail">记住邮箱</ElCheckbox>
          <ElButton link type="primary" @click="showResetHelp">
            忘记密码？
          </ElButton>
        </div>

        <ElButton
          class="mt-12 w-full"
          type="primary"
          native-type="submit"
          size="large"
          :loading="loginMutation.isPending.value"
        >
          应急登录
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
.auth-card {
  background: var(--auth-card-bg);
  border: var(--border-width) solid var(--auth-card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(var(--auth-backdrop-blur));
}

.auth-card :deep(.el-card__body) {
  padding: var(--auth-card-padding-block) var(--auth-card-padding-inline);
}

.auth-card :deep(.el-input__wrapper) {
  min-height: var(--auth-control-height);
  background: var(--auth-field-bg);
}

.auth-card :deep(.el-button--large) {
  min-height: var(--auth-control-height);
  font-size: var(--font-size-title-sm);
}

.auth-wecom-button {
  box-shadow: var(--shadow-primary);
}

.auth-login-hint {
  margin: var(--space-2) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-normal);
}

.auth-divider {
  margin: var(--space-4) 0 var(--space-2);
}
</style>
