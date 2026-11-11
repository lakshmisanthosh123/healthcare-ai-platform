export declare const typography: {
  fontFamily: string;
  fontSizeBase: string;
  sizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  weights: {
    regular: number;
    medium: number;
    bold: number;
  };
};
export type Typography = typeof typography;
export declare function typographyToCssVars(
  prefix?: string,
): Record<string, string>;
//# sourceMappingURL=typography.d.ts.map
