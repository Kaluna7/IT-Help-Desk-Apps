import { Text, TextProps, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { fonts } from '../constants/fonts';

type Weight = 'regular' | 'medium' | 'semiBold' | 'bold';

const weightMap: Record<Weight, string> = {
  regular: fonts.regular,
  medium: fonts.medium,
  semiBold: fonts.semiBold,
  bold: fonts.bold,
};

type AppTextProps = TextProps & {
  weight?: Weight;
};

export function AppText({
  weight = 'regular',
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[style, { fontFamily: weightMap[weight] }]}
    />
  );
}

type AppTextInputProps = TextInputProps & {
  weight?: Weight;
};

export function AppTextInput({
  weight = 'regular',
  style,
  ...props
}: AppTextInputProps) {
  return (
    <TextInput
      {...props}
      style={[{ fontFamily: weightMap[weight] }, style]}
    />
  );
}

export const fontStyles = StyleSheet.create({
  regular: { fontFamily: fonts.regular },
  medium: { fontFamily: fonts.medium },
  semiBold: { fontFamily: fonts.semiBold },
  bold: { fontFamily: fonts.bold },
});
