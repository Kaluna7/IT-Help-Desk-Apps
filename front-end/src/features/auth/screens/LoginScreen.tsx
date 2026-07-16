import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LockKeyhole, Mail } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import { useLanguage } from '../../../shared/i18n';
import { useAuth } from '../AuthContext';
import type { AuthStackParamList } from '../AuthNavigator';
import { AuthField, AuthLayout } from '../components';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const labels = {
    eyebrow: language === 'id' ? 'Selamat datang' : 'Welcome back',
    title: language === 'id' ? 'Masuk ke akun Anda' : 'Sign in to your account',
    subtitle:
      language === 'id'
        ? 'Kelola laporan dan request IT dengan aman.'
        : 'Manage IT reports and requests securely.',
    email: 'Email',
    password: language === 'id' ? 'Kata sandi' : 'Password',
    button: language === 'id' ? 'Masuk' : 'Continue',
    noAccount:
      language === 'id' ? 'Belum punya akun?' : "Don't have an account?",
    signup: language === 'id' ? 'Buat akun' : 'Create account',
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = Boolean(email.trim() && password) && !loading;

  return (
    <AuthLayout
      eyebrow={labels.eyebrow}
      title={labels.title}
      subtitle={labels.subtitle}>
      <AuthField
        label={labels.email}
        icon={Mail}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="name@company.com"
      />

      <AuthField
        label={labels.password}
        icon={LockKeyhole}
        value={password}
        onChangeText={setPassword}
        isPassword
        autoComplete="password"
        placeholder="••••••••"
      />

      {error ? (
        <View style={styles.errorBox}>
          <AppText weight="medium" style={styles.error}>
            {error}
          </AppText>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canSubmit && styles.buttonDisabled,
          pressed && canSubmit && styles.buttonPressed,
        ]}
        disabled={!canSubmit}
        onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <AppText weight="bold" style={styles.buttonText}>
            {labels.button}
          </AppText>
        )}
      </Pressable>

      <View style={styles.footer}>
        <AppText weight="regular" style={styles.footerText}>
          {labels.noAccount}
        </AppText>
        <Pressable
          onPress={() => navigation.navigate('Signup')}
          hitSlop={8}
          style={styles.footerLinkWrap}>
          <AppText weight="semiBold" style={styles.link}>
            {labels.signup}
          </AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    backgroundColor: `${colors.danger}10`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.danger}40`,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: spacing.sm,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.hover,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 15,
    letterSpacing: 0.1,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: 13,
    color: colors.muted,
  },
  footerLinkWrap: {
    paddingVertical: spacing.xs,
  },
  link: {
    fontSize: 14,
    color: colors.accent,
  },
});
