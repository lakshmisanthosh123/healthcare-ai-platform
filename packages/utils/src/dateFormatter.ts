export function formatDate(
  input: Date | string | number,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const date =
    typeof input === "string" || typeof input === "number"
      ? new Date(input)
      : input;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateISO(input: Date | string | number): string {
  const date =
    typeof input === "string" || typeof input === "number"
      ? new Date(input)
      : input;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}
