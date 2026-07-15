export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export {
  getBreakpoint,
  hp,
  ms,
  useResponsive,
  vs,
  wp,
} from './responsive';
export type { Breakpoint } from './responsive';
