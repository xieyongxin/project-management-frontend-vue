import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterEach } from 'vitest'
import { setCsrfToken } from '@/shared/api/client'

afterEach(() => {
  cleanup()
  setCsrfToken(undefined)
})
