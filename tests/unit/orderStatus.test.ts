import { describe, it, expect } from 'vitest';
import {
  getOrderStatus,
  getOrderStatusEmoji,
  ORDER_STATUS_VALUES,
  ORDER_STATUS_TABS,
  ORDER_STATUS_SANITY_LIST
} from '@/lib/constants/orderStatus';

describe('orderStatus constants', () => {
  it('returns correct config for valid status', () => {
    const config = getOrderStatus('pagada');
    expect(config.label).toBe('Pagada');
    expect(config.emoji).toBe('✅');
  });

  it('returns fallback config for invalid status', () => {
    const config = getOrderStatus('invalid-status');
    expect(config.value).toBe('pagada'); // Fallback is pagada
  });

  it('returns correct emoji string', () => {
    expect(getOrderStatusEmoji('terminada')).toBe('🎉 Terminada');
  });

  it('returns valid config for all defined statuses', () => {
    ORDER_STATUS_VALUES.forEach(status => {
      const config = getOrderStatus(status);
      expect(config).toBeDefined();
      expect(config.label).toBeDefined();
      expect(config.color).toBeDefined();
      expect(config.icon).toBeDefined();
      expect(config.emoji).toBeDefined();
    });
  });

  it('exports tabs including "all"', () => {
    expect(ORDER_STATUS_TABS[0].value).toBe('all');
    expect(ORDER_STATUS_TABS).toHaveLength(ORDER_STATUS_VALUES.length + 1);
  });

  it('exports sanity list correctly', () => {
    expect(ORDER_STATUS_SANITY_LIST).toHaveLength(ORDER_STATUS_VALUES.length);
    expect(ORDER_STATUS_SANITY_LIST[0].title).toBeDefined();
    expect(ORDER_STATUS_SANITY_LIST[0].value).toBeDefined();
  });
});
