/**
 * Phone number normalization utilities
 *
 * Normalizes phone numbers to E.164 format to ensure:
 * 1. Consistent storage format
 * 2. Prevention of duplicate entries with different formats
 * 3. Race condition protection via database unique constraints
 */

import { parsePhoneNumber, ParseError } from 'libphonenumber-js'

export interface NormalizedPhone {
  /** E.164 format phone number (e.g., "+14155552671") */
  e164: string
  /** Last 4 digits for display (e.g., "2671") */
  last4: string
  /** Original input phone number */
  original: string
}

/**
 * Normalizes a phone number to E.164 format
 *
 * @param phoneInput - Raw phone number input (can be in any format)
 * @param defaultCountry - Default country code (default: 'US')
 * @returns Normalized phone object with e164 and last4 fields
 * @throws Error if phone number is invalid
 *
 * @example
 * normalizePhone('(415) 555-2671') // { e164: '+14155552671', last4: '2671', original: '(415) 555-2671' }
 * normalizePhone('415-555-2671')   // { e164: '+14155552671', last4: '2671', original: '415-555-2671' }
 * normalizePhone('+1 415 555 2671') // { e164: '+14155552671', last4: '2671', original: '+1 415 555 2671' }
 */
export function normalizePhone(
  phoneInput: string,
  defaultCountry: 'US' | 'CA' | 'CN' = 'US'
): NormalizedPhone {
  if (!phoneInput || typeof phoneInput !== 'string') {
    throw new Error('Phone number is required')
  }

  const trimmed = phoneInput.trim()
  if (trimmed.length === 0) {
    throw new Error('Phone number cannot be empty')
  }

  try {
    // Parse phone number with default country
    const phoneNumber = parsePhoneNumber(trimmed, defaultCountry)

    // Validate that it's a valid phone number
    if (!phoneNumber || !phoneNumber.isValid()) {
      throw new Error(`Invalid phone number: ${phoneInput}`)
    }

    // Get E.164 format
    const e164 = phoneNumber.format('E.164')

    // Get national number (without country code) and extract last 4 digits
    const nationalNumber = phoneNumber.nationalNumber.toString()
    const last4 = nationalNumber.slice(-4)

    return {
      e164,
      last4,
      original: phoneInput,
    }
  } catch (error) {
    if (error instanceof ParseError) {
      throw new Error(`Failed to parse phone number: ${phoneInput}`)
    }
    throw error
  }
}

/**
 * Validates if a phone number is in valid format (without normalizing)
 *
 * @param phoneInput - Raw phone number input
 * @param defaultCountry - Default country code (default: 'US')
 * @returns true if valid, false otherwise
 */
export function isValidPhone(
  phoneInput: string,
  defaultCountry: 'US' | 'CA' | 'CN' = 'US'
): boolean {
  try {
    const phoneNumber = parsePhoneNumber(phoneInput, defaultCountry)
    return phoneNumber ? phoneNumber.isValid() : false
  } catch {
    return false
  }
}

/**
 * Formats a phone number for display
 *
 * @param e164Phone - Phone number in E.164 format
 * @param format - Display format ('national' or 'international')
 * @returns Formatted phone number string
 *
 * @example
 * formatPhoneForDisplay('+14155552671', 'national')      // '(415) 555-2671'
 * formatPhoneForDisplay('+14155552671', 'international') // '+1 415 555 2671'
 */
export function formatPhoneForDisplay(
  e164Phone: string,
  format: 'national' | 'international' = 'national'
): string {
  try {
    const phoneNumber = parsePhoneNumber(e164Phone)
    if (!phoneNumber) {
      return e164Phone // Return as-is if can't parse
    }

    return format === 'national'
      ? phoneNumber.formatNational()
      : phoneNumber.formatInternational()
  } catch {
    return e164Phone // Return as-is on error
  }
}
