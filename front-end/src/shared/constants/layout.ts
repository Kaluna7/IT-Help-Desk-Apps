export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
