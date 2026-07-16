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
import { colors, fonts, radii, spacing, typeScale } from '../../../shared/constants';

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
      <AppText weight="medium" style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <Icon
          color={focused ? colors.primary : colors.muted}
          size={18}
          strokeWidth={1.75}
        />
        <TextInput
          {...props}
          secureTextEntry={isPassword ? !showPassword : props.secureTextEntry}
          placeholderTextColor={colors.muted}
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
              <EyeOff color={colors.muted} size={18} strokeWidth={1.75} />
            ) : (
              <Eye color={colors.muted} size={18} strokeWidth={1.75} />
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
              <AppText weight="medium" style={styles.eyebrow}>
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
    paddingBottom: spacing.xxl,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: colors.onPrimary,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  brandName: {
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.2,
  },
  heroCopy: {
    gap: spacing.sm,
  },
  eyebrow: {
    ...typeScale.caption,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    ...typeScale.display,
    color: colors.text,
  },
  subtitle: {
    ...typeScale.body,
    color: colors.muted,
    maxWidth: 320,
  },
  panel: {
    marginHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: 0,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typeScale.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    minHeight: 52,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  inputWrapFocused: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: typeScale.body.fontSize,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
});
