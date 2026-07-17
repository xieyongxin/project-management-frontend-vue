import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { authKeys } from '../api/auth.keys'
import {
  fetchCurrentUser,
  loginWithCredentials,
  logoutCurrentUser,
} from '../api/auth.service'

export const useCurrentUser = () =>
  useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
  })

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginWithCredentials,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutCurrentUser,
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: authKeys.all })
      queryClient.removeQueries({ queryKey: authKeys.all })
    },
  })
}
