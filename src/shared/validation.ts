/**
 * Simple email format validation (non-empty, contains @, has domain with TLD).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  if (!value.trim()) return false
  return EMAIL_REGEX.test(value.trim())
}

/**
 * Returns a short validation message for the email field when invalid.
 * Empty string when valid or when input is empty (no message shown).
 */
export function getEmailValidationMessage(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (isValidEmail(value)) return ''
  if (!trimmed.includes('@')) return 'Please enter a valid email'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email'
  return 'Please enter a valid email'
}
