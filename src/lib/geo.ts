/** Great-circle distance between two coordinates, in kilometres. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** The closest point to (lat, lng); undefined for an empty list. */
export function nearestLocation<T extends { lat: number; lng: number }>(lat: number, lng: number, points: readonly T[]): T | undefined {
  let best: T | undefined;
  let bestKm = Infinity;
  for (const p of points) {
    const km = haversineKm(lat, lng, p.lat, p.lng);
    if (km < bestKm) {
      best = p;
      bestKm = km;
    }
  }
  return best;
}
