export const colors = {
  // ——— Core app palette (neo-minimal) ———
  background: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#1E293B',
  accent: '#F59E0B',
  surface: '#FFFBEB',
  border: '#E2E8F0',
  text: '#111827',

  /** Secondary text — labels, placeholders, inactive icons */
  muted: '#64748B',
  secondary: '#64748B',
  /** Pressed state of primary */
  hover: '#334155',
  active: '#F59E0B',
  onPrimary: '#FFFFFF',
  glass: '#FFFFFF',
  disabled: '#CBD5E1',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // ——— Additional palette (optional accents / features) ———
  // Primary blue family
  primaryBlue: '#4F6DFF',
  primaryBlueHover: '#3D5AF1',
  lightBlue: '#EEF2FF',

  // Purple
  purple: '#B7A8FF',
  lightPurple: '#F3EFFF',

  // Lime / green
  lime: '#C8F542',
  lightLime: '#F5FFD6',

  // Extra backgrounds / cards
  backgroundSecondary: '#F4F6FB',
  cardSecondary: '#F8FAFC',

  // Extra text
  textPrimary: '#202338',
  textSecondary: '#8A91A8',
  textDisabled: '#C7CBD8',

  // Extra border
  borderSoft: '#ECEEF5',

  // Accent rainbow (use sparingly)
  accentBlue: '#4F6DFF',
  accentPurple: '#B7A8FF',
  accentLime: '#C8F542',
  accentOrange: '#FFB547',
  accentCyan: '#4DD7FF',
  accentPink: '#FF8DBA',
} as const;

export type ColorToken = keyof typeof colors;
