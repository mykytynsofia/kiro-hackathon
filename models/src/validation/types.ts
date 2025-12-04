/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Helper function to create a successful validation result
 */
export function validResult(): ValidationResult {
  return {
    valid: true,
    errors: []
  };
}

/**
 * Helper function to create a failed validation result
 */
export function invalidResult(errors: ValidationError[]): ValidationResult {
  return {
    valid: false,
    errors
  };
}

/**
 * Helper function to create a single validation error
 */
export function createError(field: string, message: string, value?: unknown): ValidationError {
  return { field, message, value };
}
