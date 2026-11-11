import { toCssVariables } from "./colors";
import { typographyToCssVars } from "./typography";
import { spacingToCssVars } from "./spacing";
import { borderRadiusToCssVars } from "./borderRadius";
import { shadowsToCssVars } from "./shadows";

export const lightTheme = {
  name: "light",
  vars: {
    // color tokens
    "--color-bg": "#ffffff",
    "--color-surface": "#ffffff",
    "--color-text": "#0f172a",
    "--color-muted": "#6b7280",
    // merge other token groups
    ...toCssVariables(),
    ...typographyToCssVars(),
    ...spacingToCssVars(),
    ...borderRadiusToCssVars(),
    ...shadowsToCssVars(),
  } as Record<string, string>,
};

export function applyTheme(theme: typeof lightTheme) {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}

export type Theme = typeof lightTheme;
