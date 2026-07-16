import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import { WorkPeriod } from '../types';

type FilterOption = {
  label: string;
  value: WorkPeriod;
};

type WorkPeriodFilterProps = {
  options: FilterOption[];
  value: WorkPeriod;
  onChange: (value: WorkPeriod) => void;
};

export function WorkPeriodFilter({
  options,
  value,
  onChange,
}: WorkPeriodFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {options.map(option => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.chip, active && styles.chipActive]}
            android_ripple={{ color: 'transparent' }}>
            <AppText
              weight="medium"
              style={[styles.chipText, active && styles.chipTextActive]}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
});
