import { Pressable, StyleSheet, View } from 'react-native';
import { LucideIcon, ChevronRight } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors } from '../../../shared/constants';
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
        { padding: isSmall ? 14 : 16, gap: isSmall ? 10 : 14 },
        pressed && styles.cardPressed,
      ]}
      android_ripple={{ color: 'transparent' }}>
      <View
        style={[
          styles.iconWrap,
          { width: ms(48), height: ms(48), borderRadius: ms(14) },
        ]}>
        <Icon color={colors.primary} size={ms(24)} />
      </View>
      <View style={styles.textWrap}>
        <AppText
          weight="bold"
          style={[styles.title, { fontSize: ms(16) }]}
          numberOfLines={1}>
          {title}
        </AppText>
        <AppText
          weight="regular"
          style={[styles.description, { fontSize: ms(13) }]}>
          {description}
        </AppText>
      </View>
      <ChevronRight color={colors.secondary} size={ms(20)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    width: '100%',
  },
  cardPressed: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  iconWrap: {
    backgroundColor: `${colors.primary}18`,
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
    marginTop: 4,
    lineHeight: 18,
    color: colors.secondary,
  },
});
