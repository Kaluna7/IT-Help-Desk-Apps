export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
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
