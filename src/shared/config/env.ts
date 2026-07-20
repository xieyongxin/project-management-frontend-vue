import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('/api/v1'),
  VITE_APP_TITLE: z.string().min(1).default('项目协作工作台'),
})

const parsedEnv = envSchema.parse(import.meta.env)

export const env = {
  apiBaseUrl: parsedEnv.VITE_API_BASE_URL,
  appTitle: parsedEnv.VITE_APP_TITLE,
} as const
