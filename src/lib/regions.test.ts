import { expect, test } from 'vitest';
import { REGION_KEYS, regionOf } from './regions';

test('regionOf: ISO code → continent, case-insensitive, unknown → other', () => {
  expect(regionOf('PL')).toBe('europe');
  expect(regionOf('us')).toBe('north-america');
  expect(regionOf('BR')).toBe('south-america');
  expect(regionOf('AE')).toBe('asia');
  expect(regionOf('ZA')).toBe('africa');
  expect(regionOf('NZ')).toBe('oceania');
  expect(regionOf('XX')).toBe('other');
  expect(REGION_KEYS).toContain('other');
});
