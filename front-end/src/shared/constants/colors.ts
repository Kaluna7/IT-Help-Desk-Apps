export const colors = {
  background: '#FFFFFF',
  primary: '#65C466',
  hover: '#4CAF50',
  active: '#43A047',
  card: '#F8FAFC',
  border: '#E5E7EB',
  text: '#1F2937',
  secondary: '#6B7280',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

export type ColorToken = keyof typeof colors;
