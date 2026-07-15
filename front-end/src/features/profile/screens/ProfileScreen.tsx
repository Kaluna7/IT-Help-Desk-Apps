import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, Check, Languages, LogOut, UserRound } from 'lucide-react-native';
import { AppText, SafeScreen } from '../../../shared/components';
import { colors } from '../../../shared/constants';
import { useResponsive } from '../../../shared/hooks';
import { Language, useLanguage } from '../../../shared/i18n';
import { useAuth } from '../../auth';

const LANGUAGE_OPTIONS: {
  value: Language;
  labelKey: 'english' | 'indonesian';
  nativeKey: 'englishNative' | 'indonesianNative';
  flag: string;
}[] = [
  {
    value: 'en',
    labelKey: 'english',
    nativeKey: 'englishNative',
    flag: 'EN',
  },
  {
    value: 'id',
    labelKey: 'indonesian',
    nativeKey: 'indonesianNative',
    flag: 'ID',
  },
];

export function ProfileScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, updateProfile } = useAuth();
  const { isSmall, ms } = useResponsive();
  const [uploading, setUploading] = useState(false);

  const handleChangePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: true,
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert(
        language === 'id' ? 'Gagal' : 'Failed',
        language === 'id'
          ? 'Tidak bisa membaca gambar.'
          : 'Could not read the selected image.',
      );
      return;
    }

    const mime = asset.type || 'image/jpeg';
    const avatar = `data:${mime};base64,${asset.base64}`;

    try {
      setUploading(true);
      await updateProfile({ avatar });
    } catch (err) {
      Alert.alert(
        language === 'id' ? 'Gagal' : 'Failed',
        err instanceof Error ? err.message : 'Update failed',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'id' ? 'Keluar' : 'Logout',
      language === 'id'
        ? 'Yakin ingin keluar dari akun?'
        : 'Are you sure you want to log out?',
      [
        { text: language === 'id' ? 'Batal' : 'Cancel', style: 'cancel' },
        {
          text: language === 'id' ? 'Keluar' : 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ],
    );
  };

  return (
    <SafeScreen title={t.profile.title} subtitle={t.profile.subtitle}>
      <View style={styles.profileCard}>
        <Pressable
          onPress={handleChangePhoto}
          disabled={uploading}
          style={styles.avatarWrap}
          android_ripple={{ color: 'transparent' }}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <UserRound color={colors.primary} size={36} />
            </View>
          )}
          <View style={styles.cameraBadge}>
            {uploading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Camera color={colors.background} size={14} />
            )}
          </View>
        </Pressable>

        <AppText weight="bold" style={styles.name}>
          {user?.name || '-'}
        </AppText>
        <AppText weight="regular" style={styles.email}>
          {user?.email || ''}
        </AppText>
        <AppText weight="medium" style={styles.changeHint}>
          {language === 'id'
            ? 'Ketuk foto untuk ganti gambar'
            : 'Tap photo to change image'}
        </AppText>
      </View>

      <View style={[styles.section, { padding: isSmall ? 14 : 16 }]}>
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.sectionIcon,
              {
                width: ms(40),
                height: ms(40),
              },
            ]}>
            <Languages color={colors.primary} size={ms(20)} />
          </View>
          <View style={styles.sectionText}>
            <AppText
              weight="bold"
              style={[styles.sectionTitle, { fontSize: ms(16) }]}>
              {t.profile.language}
            </AppText>
            <AppText
              weight="regular"
              style={[styles.sectionDesc, { fontSize: ms(13) }]}>
              {t.profile.languageDesc}
            </AppText>
          </View>
        </View>

        <View style={styles.options}>
          {LANGUAGE_OPTIONS.map(option => {
            const active = language === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setLanguage(option.value)}
                style={[styles.option, active && styles.optionActive]}
                android_ripple={{ color: 'transparent' }}>
                <View
                  style={[
                    styles.flagBadge,
                    active && styles.flagBadgeActive,
                    { width: ms(42), height: ms(42) },
                  ]}>
                  <AppText
                    weight="bold"
                    style={[
                      styles.flagText,
                      active && styles.flagTextActive,
                      { fontSize: ms(13) },
                    ]}>
                    {option.flag}
                  </AppText>
                </View>
                <View style={styles.optionText}>
                  <AppText
                    weight="bold"
                    style={[
                      styles.optionTitle,
                      active && styles.optionTitleActive,
                      { fontSize: ms(15) },
                    ]}
                    numberOfLines={1}>
                    {t.profile[option.labelKey]}
                  </AppText>
                  <AppText
                    weight="regular"
                    style={[styles.optionNative, { fontSize: ms(12) }]}
                    numberOfLines={1}>
                    {t.profile[option.nativeKey]}
                  </AppText>
                </View>
                {active ? (
                  <View style={styles.checkWrap}>
                    <Check color={colors.background} size={14} strokeWidth={3} />
                  </View>
                ) : (
                  <View style={styles.checkPlaceholder} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut color={colors.danger} size={18} />
        <AppText weight="semiBold" style={styles.logoutText}>
          {language === 'id' ? 'Keluar' : 'Logout'}
        </AppText>
      </Pressable>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 14,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.border,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    fontSize: 20,
    color: colors.text,
  },
  email: {
    marginTop: 4,
    fontSize: 13,
    color: colors.secondary,
  },
  changeHint: {
    marginTop: 10,
    fontSize: 12,
    color: colors.primary,
  },
  section: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    borderRadius: 12,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionText: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    color: colors.text,
  },
  sectionDesc: {
    marginTop: 4,
    lineHeight: 18,
    color: colors.secondary,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    width: '100%',
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  flagBadge: {
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flagBadgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  flagText: {
    color: colors.secondary,
  },
  flagTextActive: {
    color: colors.background,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    color: colors.text,
  },
  optionTitleActive: {
    color: colors.hover,
  },
  optionNative: {
    marginTop: 2,
    color: colors.secondary,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  logoutBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.danger}55`,
    backgroundColor: `${colors.danger}10`,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
  },
});
