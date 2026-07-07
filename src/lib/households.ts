import { supabase } from './supabase'
import type { Household, HouseholdMemberWithProfile } from '@/types/household'

/**
 * Maps a raw database row from the households table to a camelCase Household type.
 */
const mapHousehold = (row: {
  id: string
  name: string
  join_code: string
  created_by: string
  created_at: string
}): Household => ({
  id: row.id,
  name: row.name,
  joinCode: row.join_code,
  createdBy: row.created_by,
  createdAt: row.created_at,
})

/**
 * Fetches the household for a given user by looking up their membership.
 *
 * Queries household_members joined with households and returns the first match.
 * Returns null if the user has no household membership.
 *
 * @param userId - The authenticated user's ID
 * @returns The household if found, null otherwise
 */
export const getHouseholdByUserId = async (
  userId: string,
): Promise<Household | null> => {
  const { data, error } = await supabase
    .from('household_members')
    .select('household:households(id, name, join_code, created_by, created_at)')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // The join returns the household object nested under the alias key
  const household = data.household as unknown as {
    id: string
    name: string
    join_code: string
    created_by: string
    created_at: string
  } | null

  if (!household) return null

  return mapHousehold(household)
}

/**
 * Creates a new household and adds the creator as the 'owner' member.
 *
 * Performs two sequential writes in a transaction-like manner:
 * 1. Inserts into the households table
 * 2. Inserts into the household_members table with role 'owner'
 *
 * @param name - The household name
 * @param joinCode - The join code (generated client-side, must be unique)
 * @param userId - The authenticated user creating the household
 * @returns The created household
 */
export const createHousehold = async (
  name: string,
  joinCode: string,
  userId: string,
): Promise<Household> => {
  // 1. Insert the household
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({
      name,
      join_code: joinCode,
      created_by: userId,
    })
    .select()
    .single()

  if (householdError) throw householdError
  if (!household) throw new Error('Failed to create household')

  // 2. Add the creator as the owner member
  const { error: memberError } = await supabase.from('household_members').insert({
    household_id: household.id,
    user_id: userId,
    role: 'owner',
  })

  if (memberError) throw memberError

  return mapHousehold(household)
}

/**
 * Joins an existing household using a valid join code.
 *
 * Looks up the household by its join_code, then inserts a membership
 * with role 'member'. Throws an error if the join code is invalid
 * or the user is already a member.
 *
 * @param joinCode - The household's join code (e.g. "XK4-92T")
 * @param userId - The authenticated user's ID
 * @returns The joined household
 */
export const joinHousehold = async (
  joinCode: string,
  userId: string,
): Promise<Household> => {
  // 1. Find the household by join code
  const { data: household, error: lookupError } = await supabase
    .from('households')
    .select('id, name, join_code, created_by, created_at')
    .eq('join_code', joinCode)
    .single()

  if (lookupError) throw lookupError
  if (!household) throw new Error('Invalid join code. Please check and try again.')

  // 2. Insert the membership
  const { error: memberError } = await supabase.from('household_members').insert({
    household_id: household.id,
    user_id: userId,
    role: 'member',
  })

  if (memberError) throw memberError

  return mapHousehold(household)
}

export const getHouseholdMembers = async (
  householdId: string,
): Promise<HouseholdMemberWithProfile[]> => {
  const { data, error } = await supabase
    .from('household_members')
    .select(`
      id,
      household_id,
      user_id,
      role,
      joined_at,
      profile:profiles(display_name, email, avatar_url)
    `)
    .eq('household_id', householdId)

  if (error) throw error

  return data.map((row) => {
    const profile = row.profile as unknown as {
      display_name: string
      email: string
      avatar_url: string
    } | null

    return {
      id: row.id,
      householdId: row.household_id,
      userId: row.user_id,
      role: row.role as 'owner' | 'member',
      joinedAt: row.joined_at,
      displayName: profile?.display_name ?? '',
      email: profile?.email ?? '',
      avatarUrl: profile?.avatar_url ?? '',
    }
  })
}

export const updateHouseholdName = async (
  householdId: string,
  name: string,
): Promise<void> => {
  const { error } = await supabase
    .from('households')
    .update({ name })
    .eq('id', householdId)

  if (error) throw error
}

export const deleteHousehold = async (
  householdId: string,
  userId: string,
): Promise<void> => {
  const { data: member, error: memberError } = await supabase
    .from('household_members')
    .select('role')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .single()

  if (memberError) throw memberError
  if (member?.role !== 'owner') throw new Error('Only the owner can close the household')

  const { error: deleteMembersError } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)

  if (deleteMembersError) throw deleteMembersError

  const { error: deleteHouseholdError } = await supabase
    .from('households')
    .delete()
    .eq('id', householdId)

  if (deleteHouseholdError) throw deleteHouseholdError
}

export const leaveHousehold = async (
  householdId: string,
  userId: string,
): Promise<void> => {
  const { data: member, error: memberError } = await supabase
    .from('household_members')
    .select('role')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .single()

  if (memberError) throw memberError

  if (member?.role === 'owner') {
    const { data: nextMember, error: nextError } = await supabase
      .from('household_members')
      .select('user_id')
      .eq('household_id', householdId)
      .neq('user_id', userId)
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (nextError) throw nextError

    if (nextMember) {
      const { error: transferError } = await supabase
        .from('household_members')
        .update({ role: 'owner' })
        .eq('household_id', householdId)
        .eq('user_id', nextMember.user_id)

      if (transferError) throw transferError
    }
  }

  const { error: deleteError } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', userId)

  if (deleteError) throw deleteError
}
