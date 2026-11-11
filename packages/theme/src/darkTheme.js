import { toCssVariables } from "./colors";
import { typographyToCssVars } from "./typography";
import { spacingToCssVars } from "./spacing";
import { borderRadiusToCssVars } from "./borderRadius";
import { shadowsToCssVars } from "./shadows";
export const darkTheme = {
  name: "dark",
  vars: {
    "--color-bg": "#0b1220",
    "--color-surface": "#071127",
    "--color-text": "#e6eef8",
    "--color-muted": "#9ca3af",
    // merge other token groups (colors overridden where appropriate)
    ...toCssVariables(),
    ...typographyToCssVars(),
    ...spacingToCssVars(),
    ...borderRadiusToCssVars(),
    ...shadowsToCssVars(),
  },
};
export function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}
