const FRIENDLY_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Invalid email or password.',
  'Email not confirmed': 'Please confirm your email before signing in.',
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters':
    'Password must be at least 6 characters.',
  'Unable to validate email address: invalid format':
    'Please enter a valid email address.',
  'Signup requires a valid password': 'Please enter a valid password.',
}

export const toFriendlyAuthError = (error: Error | null): string | null => {
  if (!error) return null
  return FRIENDLY_MESSAGES[error.message] ?? 'Something went wrong. Please try again.'
}
