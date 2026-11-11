export const borderRadius = {
  small: "6px",
  base: "8px",
  large: "12px",
};

export function borderRadiusToCssVars(prefix = ""): Record<string, string> {
  return {
    ["--" + prefix + "radius-small"]: borderRadius.small,
    ["--" + prefix + "radius-base"]: borderRadius.base,
    ["--" + prefix + "radius-large"]: borderRadius.large,
  };
}
