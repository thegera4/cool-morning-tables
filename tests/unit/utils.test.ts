import { describe, it, expect } from 'vitest';
import { formatCurrency, cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500');
    });

    it('handles conditional classes', () => {
      expect(cn('p-4', true && 'bg-red-500', false && 'hidden')).toBe('p-4 bg-red-500');
    });

    it('merges tailwind conflicts correctly', () => {
      expect(cn('p-4 p-2')).toBe('p-2'); // twMerge should resolve this
    });
  });

  describe('formatCurrency', () => {
    it('formats positive numbers correctly as MXN', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(50)).toBe('$50.00');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });
  });
});
