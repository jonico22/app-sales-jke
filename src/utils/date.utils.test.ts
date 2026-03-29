import { formatDateToLima, formatDateToUTC } from './date.utils';
import { describe, it, expect } from 'vitest';

describe('dateUtils', () => {
    const testDate = new Date('2024-03-29T12:00:00Z'); // Midday UTC

    it('should format date to Lima timezone correctly (UTC-5)', () => {
        const formatted = formatDateToLima(testDate);
        // Midday UTC should be 07:00:00 in Lima (America/Lima)
        expect(formatted).toContain('07:00:00-05:00');
    });

    it('should format date to UTC correctly', () => {
        const formatted = formatDateToUTC(testDate);
        expect(formatted).toBe('2024-03-29T12:00:00.000Z');
    });

    it('should handle string dates correctly', () => {
        const dateString = '2024-03-29T15:00:00Z';
        const formatted = formatDateToLima(dateString);
        // 15:00 UTC should be 10:00 Lima
        expect(formatted).toContain('10:00:00-05:00');
    });
});
