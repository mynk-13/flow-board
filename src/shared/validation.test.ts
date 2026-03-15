import { describe, it, expect } from 'vitest'
import { isValidEmail, getEmailValidationMessage } from './validation'

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('user.name+tag@sub.domain.io')).toBe(true)
    expect(isValidEmail('admin@flowboard.app')).toBe(true)
  })

  it('rejects email with no @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('rejects email with no domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('rejects email with no TLD', () => {
    expect(isValidEmail('user@example')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('rejects whitespace-only string', () => {
    expect(isValidEmail('   ')).toBe(false)
  })

  it('trims before validating', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true)
  })
})

describe('getEmailValidationMessage', () => {
  it('returns empty string for valid email', () => {
    expect(getEmailValidationMessage('user@example.com')).toBe('')
  })

  it('returns empty string for empty input (no premature error)', () => {
    expect(getEmailValidationMessage('')).toBe('')
    expect(getEmailValidationMessage('   ')).toBe('')
  })

  it('returns a message when @ is missing', () => {
    const msg = getEmailValidationMessage('userexample.com')
    expect(msg).toBeTruthy()
    expect(typeof msg).toBe('string')
  })

  it('returns a message for partial email', () => {
    expect(getEmailValidationMessage('user@')).toBeTruthy()
  })
})
