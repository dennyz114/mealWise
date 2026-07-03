import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getHouseholdByUserId } from '@/lib/households'
import { queryKeys } from '@/lib/queryKeys'
import type { Household } from '@/types/household'

type UseHouseholdReturn = {
  household: Household | null
  isLoading: boolean
  error: Error | null
}

const FIVE_MINUTES = 1000 * 60 * 5

export const useHousehold = (): UseHouseholdReturn => {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.households(userId),
    queryFn: () => getHouseholdByUserId(userId),
    staleTime: FIVE_MINUTES,
    enabled: !!userId,
  })

  return {
    household: data ?? null,
    isLoading,
    error: error as Error | null,
  }
}
