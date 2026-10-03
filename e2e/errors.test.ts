import { describe, expect, it } from 'vitest'
import { redactSecrets } from './errors'

describe('redactSecrets', () => {
  it('replaces each secret and leaves the rest of the message', () => {
    expect(redactSecrets('sign-in failed for p@ss word', ['p@ss'])).toBe(
      'sign-in failed for [redacted] word',
    )
  })
})
