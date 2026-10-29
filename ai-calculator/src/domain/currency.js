export function convertCurrency(amount, rate) {
  if (typeof amount === "string" && amount.trim() === "") return null;
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) return null;
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return value * rate;
}
