/**
 * Typed JSON helpers for the audit scripts.
 *
 * JSON.parse always yields `any`, which the strict type-aware lint forbids
 * from flowing. These helpers confine the parse to `unknown` and narrow with
 * real runtime checks, so callers get honest optional types.
 */

/**
 * Narrows an unknown value to a plain object record, or null.
 * @param {unknown} value
 * @returns {Record<string, unknown> | null}
 */
export function asRecord(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  return /** @type {Record<string, unknown>} */ (value)
}

/**
 * Narrows an unknown value to an array, or null.
 * @param {unknown} value
 * @returns {unknown[] | null}
 */
export function asArray(value) {
  return Array.isArray(value) ? value : null
}

/**
 * Reads a numeric field from a record.
 * @param {Record<string, unknown>} record
 * @param {string} key
 * @returns {number | undefined}
 */
export function numField(record, key) {
  const value = record[key]
  return typeof value === 'number' ? value : undefined
}

/**
 * Reads a string field from a record.
 * @param {Record<string, unknown>} record
 * @param {string} key
 * @returns {string | undefined}
 */
export function strField(record, key) {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}
