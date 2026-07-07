const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const CODE_LENGTH = 3
const CODE_SEPARATOR = '-'
const CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/
const MAX_CODE_LENGTH = 7
const HYPHEN_INSERT_INDEX = 3

/**
 * Generates a random join code in the format XXX-XXX
 * (3 uppercase alphanumeric chars, hyphen, 3 uppercase alphanumeric chars)
 *
 * @returns A join code string, e.g. "XK4-92T"
 */
export const generateJoinCode = (): string => {
  const randomChar = (): string =>
    ALPHANUMERIC_CHARS.charAt(Math.floor(Math.random() * ALPHANUMERIC_CHARS.length))

  const segments = Array.from({ length: 2 }, () =>
    Array.from({ length: CODE_LENGTH }, () => randomChar()).join(''),
  )

  return segments.join(CODE_SEPARATOR)
}

/**
 * Formats a raw join code input by:
 * - Converting to uppercase
 * - Stripping invalid characters (only alphanumeric and hyphen allowed)
 * - Auto-inserting a hyphen after the 3rd character
 * - Truncating to a maximum of 7 characters
 *
 * @param raw - The raw input string from the user
 * @returns The formatted join code string
 */
export const formatJoinCodeInput = (raw: string): string => {
  if (!raw) return ''

  // Strip anything that isn't an uppercase letter, digit, or hyphen
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '')

  // Remove any existing hyphen so we can re-insert it at the correct position
  const withoutHyphen = cleaned.replace(/-/g, '')

  // Insert hyphen after the 3rd character if there are at least 4 characters
  let formatted = withoutHyphen
  if (withoutHyphen.length > HYPHEN_INSERT_INDEX) {
    formatted =
      withoutHyphen.slice(0, HYPHEN_INSERT_INDEX) +
      CODE_SEPARATOR +
      withoutHyphen.slice(HYPHEN_INSERT_INDEX)
  }

  // Truncate to max 7 characters
  return formatted.slice(0, MAX_CODE_LENGTH)
}

/**
 * Validates whether a string is a properly formatted join code (XXX-XXX).
 *
 * @param code - The join code string to validate
 * @returns True if the code matches the XXX-XXX pattern, false otherwise
 */
export const isValidJoinCode = (code: string): boolean => {
  if (!code) return false
  return CODE_PATTERN.test(code)
}
