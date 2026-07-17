import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetMockSession } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { setCsrfToken } from '@/shared/api/client'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetMockSession()
  setCsrfToken(undefined)
})

afterAll(() => server.close())
