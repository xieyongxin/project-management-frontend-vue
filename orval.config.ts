import { defineConfig } from 'orval'

export default defineConfig({
  authApi: {
    input: {
      target: './openapi/openapi.yaml',
    },
    output: {
      target: './src/shared/api/generated/auth-api.ts',
      schemas: './src/shared/api/generated/models',
      client: 'axios-functions',
      mode: 'single',
      clean: true,
      formatter: 'prettier',
      override: {
        mutator: {
          path: './src/shared/api/client.ts',
          name: 'apiClient',
        },
      },
    },
  },
})
