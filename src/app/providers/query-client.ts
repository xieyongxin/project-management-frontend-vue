import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        const status =
          typeof error === 'object' && error !== null && 'status' in error
            ? (error.status as number | undefined)
            : undefined

        if (status === 401 || status === 403) {
          return false
        }

        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
