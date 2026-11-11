export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
};

export function spacingToCssVars(prefix = ""): Record<string, string> {
  const map: Record<string, string> = {};
  Object.entries(spacing).forEach(([k, v]) => {
    map[`--${prefix}space-${k}`] = v;
  });
  return map;
}
