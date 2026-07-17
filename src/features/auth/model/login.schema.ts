import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效邮箱地址。'),
  password: z.string().min(1, '请输入密码。'),
})

export type LoginCredentials = z.infer<typeof loginSchema>
