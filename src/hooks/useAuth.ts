import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'
import type { AuthUser } from '@/types/auth'

const FIVE_MINUTES = 1000 * 60 * 5

const mapUser = (user: { id: string; email?: string; user_metadata: Record<string, string> }): AuthUser => ({
  id: user.id,
  email: user.email ?? '',
  displayName: user.user_metadata.full_name ?? user.user_metadata.name ?? '',
  avatarUrl: user.user_metadata.avatar_url ?? '',
})

export const useAuth = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) return null
      return data.session
    },
    staleTime: FIVE_MINUTES,
  })

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(queryKeys.auth.session, session)
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  return {
    session: data ?? null,
    user: data?.user ? mapUser(data.user) : null,
    isLoading,
    isAuthenticated: !!data?.user,
  }
}
