export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 18px 50px rgba(0,0,0,0.12)",
};
export function shadowsToCssVars(prefix = "") {
  const map = {};
  Object.entries(shadows).forEach(([k, v]) => {
    map[`--${prefix}shadow-${k}`] = v;
  });
  return map;
}
