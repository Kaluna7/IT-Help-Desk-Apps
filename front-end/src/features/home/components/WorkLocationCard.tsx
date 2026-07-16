import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import { ReportItem } from '../../../services/api';

type WorkLocationCardProps = {
  report: ReportItem;
  onPress: () => void;
  labels: {
    complete: string;
    ongoing: string;
  };
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WorkLocationCard({
  report,
  onPress,
  labels,
}: WorkLocationCardProps) {
  const activityDate =
    report.completedAt || report.updatedAt || report.createdAt;
  const isCompleted = report.status === 'completed';

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.iconWrap}>
        <MapPin color={colors.primaryBlue} size={18} strokeWidth={2} />
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <AppText weight="semiBold" style={styles.title} numberOfLines={1}>
            {report.locationName}
          </AppText>
          <View
            style={[
              styles.badge,
              isCompleted ? styles.badgeComplete : styles.badgeOngoing,
            ]}>
            <AppText weight="medium" style={styles.badgeText}>
              {isCompleted ? labels.complete : labels.ongoing}
            </AppText>
          </View>
        </View>

        <View style={styles.metaRow}>
          <CalendarDays color={colors.muted} size={14} strokeWidth={1.75} />
          <AppText weight="regular" style={styles.meta}>
            {formatDate(activityDate)}
          </AppText>
        </View>
      </View>

      <ChevronRight color={colors.muted} size={18} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  badge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeComplete: {
    backgroundColor: colors.lightLime,
  },
  badgeOngoing: {
    backgroundColor: colors.lightPurple,
  },
  badgeText: {
    fontSize: 11,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
