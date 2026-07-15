import { ReactNode } from 'react';
import {
  Pressable,
  RefreshControlProps,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors, fonts } from '../constants';
import { useResponsive } from '../hooks';
import { AppText } from './AppText';

type SafeScreenProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  onBack?: () => void;
  headerRight?: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

export function SafeScreen({
  title,
  subtitle,
  children,
  scroll = true,
  style,
  onBack,
  headerRight,
  refreshControl,
}: SafeScreenProps) {
  const { gutter, titleSize, bodySize, contentMaxWidth, isSmall } =
    useResponsive();

  const body = (
    <View
      style={[
        styles.body,
        contentMaxWidth
          ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }
          : null,
      ]}>
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <View style={styles.headerRow}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={styles.backButton}
              android_ripple={{ color: 'transparent' }}>
              <ChevronLeft color={colors.text} size={isSmall ? 22 : 24} />
            </Pressable>
          ) : null}
          <View style={styles.headerText}>
            <AppText
              weight="bold"
              style={[
                styles.title,
                { fontSize: titleSize, fontFamily: fonts.bold },
              ]}
              numberOfLines={1}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText
                weight="regular"
                style={[styles.subtitle, { fontSize: bodySize }]}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {headerRight ? (
            <View style={styles.headerRight}>{headerRight}</View>
          ) : null}
        </View>
      </View>
      <View style={[styles.content, { paddingHorizontal: gutter }, style]}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}>
          {body}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}
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
  body: {
    flexGrow: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerRight: {
    marginLeft: 8,
    flexShrink: 0,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
  subtitle: {
    marginTop: 6,
    color: colors.secondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
});
