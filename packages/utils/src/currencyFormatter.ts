export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount,
  );
}

export function parseCurrency(value: string, locale = "en-US"): number | null {
  if (!value) return null;
  const separators = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const groupSeparator = separators.find(
    (part) => part.type === "group",
  )?.value;
  const decimalSeparator = separators.find(
    (part) => part.type === "decimal",
  )?.value;
  const normalized = value
    .split(groupSeparator ?? "\0")
    .join("")
    .replace(decimalSeparator ?? ".", ".")
    .replace(/[^0-9.-]+/g, "");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}
