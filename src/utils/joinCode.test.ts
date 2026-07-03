import { describe, it, expect } from 'vitest'
import { generateJoinCode, formatJoinCodeInput, isValidJoinCode } from './joinCode'

describe('generateJoinCode', () => {
  it('generates a code matching the XXX-XXX format', () => {
    const code = generateJoinCode()
    expect(code).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/)
  })

  it('generates codes with varying output across calls', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateJoinCode()))
    // With 36^6 = ~2.1B possibilities, 100 calls should all be unique
    expect(codes.size).toBe(100)
  })
})

describe('formatJoinCodeInput', () => {
  it('auto-inserts hyphen after 3rd character', () => {
    expect(formatJoinCodeInput('XK492T')).toBe('XK4-92T')
  })

  it('preserves existing hyphen at correct position', () => {
    expect(formatJoinCodeInput('XK4-92T')).toBe('XK4-92T')
  })

  it('truncates excess characters beyond 7', () => {
    expect(formatJoinCodeInput('XK4-92T12')).toBe('XK4-92T')
  })

  it('removes invalid characters', () => {
    expect(formatJoinCodeInput('XK4@92T')).toBe('XK4-92T')
  })

  it('converts lowercase to uppercase', () => {
    expect(formatJoinCodeInput('xk4-92t')).toBe('XK4-92T')
  })

  it('returns empty string for empty input', () => {
    expect(formatJoinCodeInput('')).toBe('')
  })

  it('handles partial input without hyphen', () => {
    expect(formatJoinCodeInput('AB')).toBe('AB')
    expect(formatJoinCodeInput('ABC')).toBe('ABC')
  })

  it('inserts hyphen when 4th character is typed', () => {
    expect(formatJoinCodeInput('ABCD')).toBe('ABC-D')
  })
})

describe('isValidJoinCode', () => {
  it('accepts a valid code', () => {
    expect(isValidJoinCode('XK4-92T')).toBe(true)
  })

  it('rejects code without hyphen', () => {
    expect(isValidJoinCode('XK492T')).toBe(false)
  })

  it('rejects lowercase input', () => {
    expect(isValidJoinCode('xk4-92t')).toBe(false)
  })

  it('rejects too short', () => {
    expect(isValidJoinCode('XK-92')).toBe(false)
  })

  it('rejects too long', () => {
    expect(isValidJoinCode('XK4-92T1')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidJoinCode('')).toBe(false)
  })

  it('rejects null or undefined', () => {
    // @ts-expect-error - testing null input
    expect(isValidJoinCode(null)).toBe(false)
    // @ts-expect-error - testing undefined input
    expect(isValidJoinCode(undefined)).toBe(false)
  })

  it('rejects codes with invalid characters', () => {
    expect(isValidJoinCode('XK4-9@T')).toBe(false)
  })

  it('rejects codes with wrong hyphen position', () => {
    expect(isValidJoinCode('X-K492T')).toBe(false)
  })
})
