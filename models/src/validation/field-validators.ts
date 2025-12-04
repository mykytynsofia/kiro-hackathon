/**
 * Basic field validation utilities
 */

/**
 * Validate string length is within range
 */
export function isStringLengthValid(value: unknown, min: number, max: number): boolean {
  if (typeof value !== 'string') return false;
  return value.length >= min && value.length <= max;
}

/**
 * Validate number is within range
 */
export function isNumberInRange(value: unknown, min: number, max: number): boolean {
  if (typeof value !== 'number') return false;
  if (isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Validate value is one of the enum values
 */
export function isValidEnumValue<T>(value: unknown, enumObj: Record<string, T>): boolean {
  const validValues = Object.values(enumObj);
  return validValues.includes(value as T);
}

/**
 * Validate hex color format (#RGB or #RRGGBB)
 */
export function isValidHexColor(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexColorRegex.test(value);
}

/**
 * Validate UUID v4 format
 */
export function isValidUUID(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate value is a non-empty string
 */
export function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validate value is a positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validate value is an array
 */
export function isArray(value: unknown): boolean {
  return Array.isArray(value);
}

/**
 * Validate array has minimum length
 */
export function hasMinLength(value: unknown, min: number): boolean {
  return Array.isArray(value) && value.length >= min;
}

/**
 * Validate value is an object (not null, not array)
 */
export function isObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate timestamp is valid
 */
export function isValidTimestamp(value: unknown): boolean {
  if (typeof value !== 'number') return false;
  if (isNaN(value)) return false;
  // Check if it's a reasonable timestamp (after year 2000, before year 2100)
  return value > 946684800000 && value < 4102444800000;
}
