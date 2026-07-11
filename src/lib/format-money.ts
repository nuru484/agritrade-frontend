/** Formats an amount in minor units (pesewas) as e.g. "GH₵ 12,500.00".
 * Money is ALWAYS integer minor units end to end (backend convention). */
export function formatMoney(minorUnits: number, currency = "GH₵"): string {
  return `${currency} ${(minorUnits / 100).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
