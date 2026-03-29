import { parseBackendError } from './error.utils';
import { describe, it, expect } from 'vitest';

describe('errorUtils', () => {
    it('should return default message if error is null or undefined', () => {
        expect(parseBackendError(null)).toBe('Ocurrió un error desconocido');
        expect(parseBackendError(undefined)).toBe('Ocurrió un error desconocido');
    });

    it('should return the string if error is a string', () => {
        expect(parseBackendError('Error message')).toBe('Error message');
    });

    it('should return standard axios error message', () => {
        const axiosError = {
            response: {
                data: {
                    message: 'Server side error message'
                }
            }
        };
        expect(parseBackendError(axiosError)).toBe('Server side error message');
    });

    it('should parse nested JSON error in axios response data.errors', () => {
        const complexError = {
            response: {
                data: {
                    message: 'Generic failure',
                    errors: 'HTTP 500: {"error": "Specific database constraint error", "code": 123}'
                }
            }
        };
        expect(parseBackendError(complexError)).toBe('Specific database constraint error');
    });

    it('should handle nested JSON without error field using message field', () => {
        const complexError = {
            response: {
                data: {
                    errors: 'HTTP 400: {"message": "Invalid input format"}'
                }
            }
        };
        expect(parseBackendError(complexError)).toBe('Invalid input format');
    });

    it('should fallback to data.errors string if JSON parsing fails', () => {
        const badFormatError = {
            response: {
                data: {
                    errors: 'HTTP 500: Not a JSON string here'
                }
            }
        };
        expect(parseBackendError(badFormatError)).toBe('HTTP 500: Not a JSON string here');
    });

    it('should return error.message property if available', () => {
        const simpleError = new Error('Custom JS Error');
        expect(parseBackendError(simpleError)).toBe('Custom JS Error');
    });

    it('should return generic error for unknown error types', () => {
        expect(parseBackendError({ something: 'wrong' })).toBe('Error de conexión o desconocido');
    });
});
