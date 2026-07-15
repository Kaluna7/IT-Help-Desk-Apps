import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../../shared/components';
import { colors } from '../../../shared/constants';
import { HistoryStatus } from '../types';

type FilterOption = {
  label: string;
  value: HistoryStatus;
};

type HistoryFilterProps = {
  options: FilterOption[];
  value: HistoryStatus;
  onChange: (value: HistoryStatus) => void;
};

export function HistoryFilter({ options, value, onChange }: HistoryFilterProps) {
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
              weight="semiBold"
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
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.secondary,
  },
  chipTextActive: {
    color: colors.background,
  },
});
