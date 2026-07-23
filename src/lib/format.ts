export function metresToFeet(m: number): string {
  const totalInches = Math.round(m * 39.3701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return inches === 0 ? `${feet}′` : `${feet}′${inches}″`;
}

export function formatPrice(eur: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(eur);
}
