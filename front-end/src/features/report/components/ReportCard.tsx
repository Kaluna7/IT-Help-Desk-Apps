import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, Lock, UserRound } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing, typeScale } from '../../../shared/constants';
import { ReportItem } from '../../../services/api';
import { WorkingLock } from '../../../services/socket';

type ReportCardProps = {
  report: ReportItem;
  lockedBy?: WorkingLock;
  isLockedByOther: boolean;
  isLockedByMe: boolean;
  onPress: () => void;
  labels: {
    createdBy: string;
    working: string;
    youWorking: string;
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

export function ReportCard({
  report,
  lockedBy,
  isLockedByOther,
  isLockedByMe,
  onPress,
  labels,
}: ReportCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLockedByOther}
      style={[
        styles.card,
        isLockedByOther && styles.cardDisabled,
        (isLockedByMe || isLockedByOther) && styles.cardBusy,
      ]}>
      <View style={styles.top}>
        <View style={styles.badge}>
          <AppText weight="medium" style={styles.badgeText}>
            {report.status.replace('_', ' ')}
          </AppText>
        </View>
        {isLockedByOther || isLockedByMe ? (
          <View style={styles.lockPill}>
            {isLockedByOther ? (
              <Lock color={colors.warning} size={13} strokeWidth={1.75} />
            ) : (
              <UserRound color={colors.accent} size={13} strokeWidth={1.75} />
            )}
            <AppText weight="medium" style={styles.lockText} numberOfLines={1}>
              {isLockedByMe
                ? labels.youWorking
                : `${lockedBy?.userName || 'User'} ${labels.working}`}
            </AppText>
          </View>
        ) : null}
      </View>

      <AppText weight="semiBold" style={styles.title}>
        {report.locationName}
      </AppText>

      <View style={styles.metaRow}>
        <CalendarDays color={colors.muted} size={14} strokeWidth={1.75} />
        <AppText weight="regular" style={styles.meta}>
          {formatDate(report.createdAt)}
        </AppText>
      </View>

      <View style={styles.metaRow}>
        <UserRound color={colors.muted} size={14} strokeWidth={1.75} />
        <AppText weight="regular" style={styles.meta}>
          {labels.createdBy}: {report.createdByName}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardBusy: {
    borderColor: colors.accent,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.accent}40`,
  },
  badgeText: {
    ...typeScale.micro,
    color: colors.accent,
    textTransform: 'capitalize',
  },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    maxWidth: '62%',
  },
  lockText: {
    ...typeScale.micro,
    color: colors.text,
    flexShrink: 1,
  },
  title: {
    ...typeScale.section,
    color: colors.text,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    ...typeScale.label,
    color: colors.muted,
    flex: 1,
  },
});
