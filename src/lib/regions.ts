/**
 * ISO 3166-1 alpha-2 country code → continent key.
 * Used by the network page for the region filter and the "continents" stat.
 * Countries missing from the table fall back to 'other'.
 */
export const REGION_KEYS = [
  'europe',
  'north-america',
  'south-america',
  'asia',
  'africa',
  'oceania',
  'other',
] as const;
export type RegionKey = (typeof REGION_KEYS)[number];

const EUROPE =
  'AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC ME MK MT NL NO PL PT RO RS SE SI SK SM UA VA';
const NORTH_AMERICA = 'BS BZ CA CR CU DO GT HN JM MX NI PA PR SV US';
const SOUTH_AMERICA = 'AR BO BR CL CO EC GY PE PY SR UY VE';
const ASIA =
  'AE BH CN HK ID IL IN JP JO KR KW LB LK MY OM PH QA SA SG TH TR TW VN';
const AFRICA = 'DZ EG KE MA MU NA NG SC SN TN TZ ZA';
const OCEANIA = 'AU FJ NZ PF PG';

const TABLE: Record<string, RegionKey> = {};
const fill = (codes: string, region: RegionKey) =>
  codes.split(' ').forEach((c) => { TABLE[c] = region; });
fill(EUROPE, 'europe');
fill(NORTH_AMERICA, 'north-america');
fill(SOUTH_AMERICA, 'south-america');
fill(ASIA, 'asia');
fill(AFRICA, 'africa');
fill(OCEANIA, 'oceania');

export function regionOf(countryCode: string): RegionKey {
  return TABLE[countryCode.toUpperCase()] ?? 'other';
}
