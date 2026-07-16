import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LockKeyhole, Mail, UserRound } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import { useLanguage } from '../../../shared/i18n';
import { useAuth } from '../AuthContext';
import type { AuthStackParamList } from '../AuthNavigator';
import { AuthField, AuthLayout } from '../components';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const { signup } = useAuth();
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const labels = {
    eyebrow: language === 'id' ? 'Mulai sekarang' : 'Get started',
    title: language === 'id' ? 'Buat akun baru' : 'Create your account',
    subtitle:
      language === 'id'
        ? 'Daftarkan akun untuk mengakses fitur IT Report.'
        : 'Register to access IT Report features.',
    name: language === 'id' ? 'Nama lengkap' : 'Full name',
    email: 'Email',
    password: language === 'id' ? 'Kata sandi' : 'Password',
    hint:
      language === 'id'
        ? 'Gunakan minimal 6 karakter.'
        : 'Use at least 6 characters.',
    button: language === 'id' ? 'Buat akun' : 'Create account',
    hasAccount:
      language === 'id' ? 'Sudah punya akun?' : 'Already have an account?',
    login: language === 'id' ? 'Masuk' : 'Sign in',
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      await signup(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    Boolean(name.trim() && email.trim() && password.length >= 6) && !loading;

  return (
    <AuthLayout
      eyebrow={labels.eyebrow}
      title={labels.title}
      subtitle={labels.subtitle}>
      <AuthField
        label={labels.name}
        icon={UserRound}
        value={name}
        onChangeText={setName}
        autoComplete="name"
        placeholder={language === 'id' ? 'Nama Anda' : 'Your name'}
      />

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
        autoComplete="new-password"
        placeholder="••••••••"
      />
      <AppText weight="regular" style={styles.hint}>
        {labels.hint}
      </AppText>

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
        onPress={handleSignup}>
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
          {labels.hasAccount}
        </AppText>
        <Pressable
          onPress={() => navigation.navigate('Login')}
          hitSlop={8}
          style={styles.footerLinkWrap}>
          <AppText weight="semiBold" style={styles.link}>
            {labels.login}
          </AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    fontSize: 12,
    color: colors.muted,
  },
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
