import { ReactNode, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, fonts } from '../../../shared/constants';

type AuthFieldProps = TextInputProps & {
  label: string;
  icon: LucideIcon;
  isPassword?: boolean;
};

export function AuthField({
  label,
  icon: Icon,
  isPassword,
  style,
  ...props
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.field}>
      <AppText weight="semiBold" style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <Icon
          color={focused ? colors.primary : colors.secondary}
          size={18}
        />
        <TextInput
          {...props}
          secureTextEntry={isPassword ? !showPassword : props.secureTextEntry}
          placeholderTextColor={colors.secondary}
          onFocus={e => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, style]}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword(prev => !prev)}
            hitSlop={8}
            accessibilityRole="button">
            {showPassword ? (
              <EyeOff color={colors.secondary} size={18} />
            ) : (
              <Eye color={colors.secondary} size={18} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <AppText weight="bold" style={styles.brandMarkText}>
                  IT
                </AppText>
              </View>
              <AppText weight="bold" style={styles.brandName}>
                IT Report
              </AppText>
            </View>

            <View style={styles.heroCopy}>
              <AppText weight="semiBold" style={styles.eyebrow}>
                {eyebrow}
              </AppText>
              <AppText weight="bold" style={styles.title}>
                {title}
              </AppText>
              <AppText weight="regular" style={styles.subtitle}>
                {subtitle}
              </AppText>
            </View>
          </View>

          <View style={styles.panel}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
    backgroundColor: `${colors.primary}0D`,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.primary}22`,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: colors.background,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  brandName: {
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  heroCopy: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    color: colors.hover,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: colors.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.secondary,
    maxWidth: 320,
  },
  panel: {
    marginTop: -12,
    marginHorizontal: 16,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
  },
  inputWrap: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
});
