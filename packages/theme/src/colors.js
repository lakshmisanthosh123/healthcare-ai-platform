export const colors = {
  // neutrals
  white: "#ffffff",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray500: "#6b7280",
  // primary
  primary: "#0b6efd",
  primaryHover: "#0958d1",
  // semantic
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#dc2626",
};
export function toCssVariables(prefix = "") {
  const map = {};
  Object.entries(colors).forEach(([k, v]) => {
    map[`--${prefix}${k}`] = v;
  });
  return map;
}
