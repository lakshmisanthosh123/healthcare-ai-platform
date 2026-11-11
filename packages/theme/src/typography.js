export const typography = {
  fontFamily:
    'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  fontSizeBase: "16px",
  sizes: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "20px",
    xl: "24px",
  },
  weights: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
};
export function typographyToCssVars(prefix = "") {
  return {
    ["--" + prefix + "font-family"]: typography.fontFamily,
    ["--" + prefix + "font-size-base"]: typography.fontSizeBase,
    ["--" + prefix + "font-size-xs"]: typography.sizes.xs,
    ["--" + prefix + "font-size-sm"]: typography.sizes.sm,
    ["--" + prefix + "font-size-md"]: typography.sizes.md,
    ["--" + prefix + "font-size-lg"]: typography.sizes.lg,
    ["--" + prefix + "font-size-xl"]: typography.sizes.xl,
    ["--" + prefix + "font-weight-regular"]: String(typography.weights.regular),
    ["--" + prefix + "font-weight-medium"]: String(typography.weights.medium),
    ["--" + prefix + "font-weight-bold"]: String(typography.weights.bold),
  };
}
