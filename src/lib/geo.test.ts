import { expect, test } from 'vitest';
import { haversineKm, nearestLocation } from './geo';

const gdansk = { id: 'gdansk', lat: 54.35, lng: 18.65 };
const palma = { id: 'palma', lat: 39.57, lng: 2.65 };
const miami = { id: 'miami', lat: 25.76, lng: -80.19 };

test('haversineKm: Gdańsk → Palma is about 1 900 km, a point to itself is 0', () => {
  expect(haversineKm(gdansk.lat, gdansk.lng, palma.lat, palma.lng)).toBeCloseTo(2070, -2);
  expect(haversineKm(palma.lat, palma.lng, palma.lat, palma.lng)).toBe(0);
});

test('nearestLocation picks the closest showroom; empty list → undefined, not a crash (B5)', () => {
  expect(nearestLocation(41.4, 2.2, [gdansk, palma, miami])?.id).toBe('palma'); // Barcelona
  expect(nearestLocation(41.4, 2.2, [])).toBeUndefined();
});
