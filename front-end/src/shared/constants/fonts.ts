export const fonts = {
  regular: 'GeneralSans-Regular',
  medium: 'GeneralSans-Medium',
  semiBold: 'GeneralSans-Semibold',
  bold: 'GeneralSans-Bold',
} as const;

export const typography = {
  regular: {
    fontFamily: fonts.regular,
  },
  medium: {
    fontFamily: fonts.medium,
  },
  semiBold: {
    fontFamily: fonts.semiBold,
  },
  bold: {
    fontFamily: fonts.bold,
  },
} as const;

/** Neo-minimal type ramp */
export const typeScale = {
  display: { fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  title: { fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  section: { fontSize: 16, lineHeight: 22 },
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  micro: { fontSize: 11, lineHeight: 14 },
} as const;
