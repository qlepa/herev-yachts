import { describe, expect, test } from 'vitest';
import { formatPrice, metresToFeet } from './format';

describe('formatPrice', () => {
  test('formats EUR for en with grouping and no decimals', () => {
    expect(formatPrice(535975, 'EUR', 'en')).toBe('€535,975');
  });

  test('formats GBP for en', () => {
    expect(formatPrice(499950, 'GBP', 'en')).toBe('£499,950');
  });

  test('uses locale grouping and symbol placement for pl', () => {
    expect(formatPrice(604652, 'EUR', 'pl').replace(/\s/g, ' ')).toBe('604 652 €');
  });
});

describe('metresToFeet', () => {
  test('rounds to feet and inches', () => {
    expect(metresToFeet(15.65)).toBe('51′4″');
  });
});
