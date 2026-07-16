import { Pressable, StyleSheet, View } from 'react-native';
import { LucideIcon, ChevronRight } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import { useResponsive } from '../../../shared/hooks';

type HistoryTypeCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  onPress: () => void;
};

export function HistoryTypeCard({
  title,
  description,
  icon: Icon,
  onPress,
}: HistoryTypeCardProps) {
  const { ms, isSmall } = useResponsive();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { padding: isSmall ? spacing.md : spacing.lg, gap: spacing.md },
        pressed && styles.cardPressed,
      ]}
      android_ripple={{ color: 'transparent' }}>
      <View
        style={[
          styles.iconWrap,
          { width: ms(44), height: ms(44), borderRadius: radii.md },
        ]}>
        <Icon color={colors.primary} size={ms(20)} strokeWidth={1.75} />
      </View>
      <View style={styles.textWrap}>
        <AppText
          weight="semiBold"
          style={[styles.title, { fontSize: ms(15) }]}
          numberOfLines={1}>
          {title}
        </AppText>
        <AppText
          weight="regular"
          style={[styles.description, { fontSize: ms(13) }]}>
          {description}
        </AppText>
      </View>
      <ChevronRight color={colors.muted} size={ms(18)} strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.lg,
    width: '100%',
  },
  cardPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  iconWrap: {
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
  },
  description: {
    marginTop: spacing.xs,
    lineHeight: 18,
    color: colors.muted,
  },
});
