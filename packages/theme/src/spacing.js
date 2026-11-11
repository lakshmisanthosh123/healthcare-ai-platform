export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
};
export function spacingToCssVars(prefix = "") {
  const map = {};
  Object.entries(spacing).forEach(([k, v]) => {
    map[`--${prefix}space-${k}`] = v;
  });
  return map;
}
