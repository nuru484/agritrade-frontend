/** Formats an amount in minor units (pesewas) as e.g. "GH₵ 12,500.00".
 * Money is ALWAYS integer minor units end to end (backend convention). */
export function formatMoney(minorUnits: number, currency = "GH₵"): string {
  return `${currency} ${(minorUnits / 100).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Console tables state money in MAJOR units (e.g. price/kg 4.20). */
export function formatCedis(major: number, currency = "GH₵"): string {
  return `${currency} ${major.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** "12,400 kg" — weights across the console. */
export function formatKg(kg: number): string {
  return `${kg.toLocaleString("en-GH")} kg`;
}
