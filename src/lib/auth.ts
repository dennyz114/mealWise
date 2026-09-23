import { supabase } from './supabase'

export type AuthResult = {
  error: Error | null
}

export const signInWithPassword = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error }
}

export const signUp = async (params: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<AuthResult> => {
  const fullName = `${params.firstName} ${params.lastName}`.trim()

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: fullName,
        first_name: params.firstName,
        last_name: params.lastName,
        name: fullName,
      },
    },
  })

  if (error) return { error }

  // Keep the user on the login screen after registering — clear any auto-session
  if (data.session) {
    await supabase.auth.signOut()
  }

  return { error: null }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}
