import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { redactSecrets } from './errors'
import { planHouseholdCleanup, type Membership } from './memberships'

export type CleanupClient = {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ userId: string } | { error: string }>
  listMemberships: (userId: string) => Promise<Membership[]>
  deleteHousehold: (householdId: string) => Promise<void>
  deleteMembership: (householdId: string, userId: string) => Promise<void>
}

export async function clearAccountHouseholds(
  client: CleanupClient,
  email: string,
  password: string,
): Promise<void> {
  const signedIn = await client.signIn(email, password)
  if ('error' in signedIn) {
    throw new Error(
      redactSecrets(`Test account sign-in failed for household cleanup: ${signedIn.error}`, [
        password,
        email,
      ]),
    )
  }

  const memberships = await client.listMemberships(signedIn.userId)
  const plan = planHouseholdCleanup(signedIn.userId, memberships)

  for (const householdId of plan.householdIdsToDelete) {
    try {
      await client.deleteHousehold(householdId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(
        redactSecrets(`Failed to delete household ${householdId}: ${message}`, [password, email]),
      )
    }
  }

  for (const membership of plan.membershipsToDelete) {
    try {
      await client.deleteMembership(membership.householdId, membership.userId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(
        redactSecrets(
          `Failed to delete membership ${membership.householdId}: ${message}`,
          [password, email],
        ),
      )
    }
  }
}

export function createSupabaseCleanupClient(supabase: SupabaseClient): CleanupClient {
  return {
    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) return { error: error?.message ?? 'No user returned' }
      return { userId: data.user.id }
    },
    async listMemberships(userId) {
      const { data, error } = await supabase
        .from('household_members')
        .select('household_id, role')
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
      return (data ?? []).map((row) => ({
        householdId: String(row.household_id),
        role: row.role === 'owner' ? 'owner' : 'member',
      }))
    },
    async deleteHousehold(householdId) {
      const { error } = await supabase.from('households').delete().eq('id', householdId)
      if (error) throw new Error(error.message)
    },
    async deleteMembership(householdId, userId) {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
    },
  }
}

export async function resetTestAccount(): Promise<void> {
  const { loadE2EEnv } = await import('./env')
  const env = loadE2EEnv()
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
  await clearAccountHouseholds(
    createSupabaseCleanupClient(supabase),
    env.E2E_USER_EMAIL,
    env.E2E_USER_PASSWORD,
  )
}
