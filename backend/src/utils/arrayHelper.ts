/**
 * Array helper utilities for SQL Server compatibility
 * SQL Server doesn't support native arrays, so Prisma stores them as JSON strings
 * These helpers convert between JSON strings and arrays
 */

/**
 * Parse JSON array string to array
 * Handles both JSON strings and actual arrays (for compatibility)
 */
export function parseArray<T = string>(value: string | string[] | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Stringify array to JSON string
 */
export function stringifyArray<T>(value: T[] | null | undefined): string {
  if (!value || !Array.isArray(value)) return '[]';
  return JSON.stringify(value);
}

/**
 * Type-safe array field getter for Prisma models
 */
export function getArrayField<T = string>(
  model: any,
  fieldName: string
): T[] {
  const value = model[fieldName];
  return parseArray<T>(value);
}

/**
 * Type-safe array field setter for Prisma models
 */
export function setArrayField<T>(
  data: any,
  fieldName: string,
  value: T[]
): void {
  data[fieldName] = stringifyArray(value);
}

