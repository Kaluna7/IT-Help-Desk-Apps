import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function wp(percent: number): number {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percent) / 100);
}

export function hp(percent: number): number {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percent) / 100);
}

/** Moderate scale — adapts size across phone widths without exploding on tablets */
export function ms(size: number, factor = 0.4): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const moderated = size + (scale * size - size) * factor;
  return PixelRatio.roundToNearestPixel(moderated);
}

export function vs(size: number, factor = 0.35): number {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const moderated = size + (scale * size - size) * factor;
  return PixelRatio.roundToNearestPixel(moderated);
}

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg';

export function getBreakpoint(width = SCREEN_WIDTH): Breakpoint {
  if (width < 360) {
    return 'xs';
  }
  if (width < 400) {
    return 'sm';
  }
  if (width < 768) {
    return 'md';
  }
  return 'lg';
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  const isSmall = breakpoint === 'xs' || breakpoint === 'sm';
  const contentMaxWidth = breakpoint === 'lg' ? 720 : undefined;

  return {
    width,
    height,
    breakpoint,
    isSmall,
    contentMaxWidth,
    gutter: isSmall ? 16 : 20,
    titleSize: isSmall ? 26 : 30,
    bodySize: isSmall ? 14 : 15,
    tabLabelSize: isSmall ? 11 : 12,
    wp: (percent: number) =>
      PixelRatio.roundToNearestPixel((width * percent) / 100),
    hp: (percent: number) =>
      PixelRatio.roundToNearestPixel((height * percent) / 100),
    ms,
    vs,
  };
}
