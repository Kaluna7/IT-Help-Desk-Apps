import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import type { WorkPeriod } from '../types';

type FilterOption = {
  label: string;
  value: WorkPeriod;
};

type WorkLocationFilterProps = {
  options: FilterOption[];
  value: WorkPeriod;
  onChange: (value: WorkPeriod) => void;
};

export function WorkLocationFilter({
  options,
  value,
  onChange,
}: WorkLocationFilterProps) {
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
    borderColor: colors.borderSoft,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
});
