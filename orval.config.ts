import { defineConfig } from 'orval'

const openApiSpec =
  process.env.OPENAPI_SPEC ??
  '../project-management-backend-go/openapi/openapi.yaml'

export default defineConfig({
  authApi: {
    input: {
      target: openApiSpec,
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
