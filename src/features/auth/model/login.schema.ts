import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效邮箱地址。'),
})

export type LoginCredentials = z.infer<typeof loginSchema>
