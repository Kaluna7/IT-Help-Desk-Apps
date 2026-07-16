import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FolderOpen } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import { useResponsive } from '../../../shared/hooks';
import { HistoryItem, HistoryStatus } from '../types';
import { filterHistoryItems, groupByMonth } from '../utils';
import { HistorySearchBar } from './HistorySearchBar';
import { HistoryFilter } from './HistoryFilter';
import { MonthFolderCard } from './MonthFolderCard';

type FilterOption = {
  label: string;
  value: HistoryStatus;
};

type HistoryListPanelProps = {
  items: HistoryItem[];
  filters: FilterOption[];
  searchPlaceholder: string;
  emptyTitle: string;
  emptyMessage: string;
};

export function HistoryListPanel({
  items,
  filters,
  searchPlaceholder,
  emptyTitle,
  emptyMessage,
}: HistoryListPanelProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<HistoryStatus>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { gutter, ms } = useResponsive();

  const folders = useMemo(() => {
    const filtered = filterHistoryItems(items, search, status);
    return groupByMonth(filtered);
  }, [items, search, status]);

  const toggleFolder = (key: string) => {
    setExpanded(prev => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  };

  return (
    <View style={styles.container}>
      <HistorySearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={searchPlaceholder}
      />

      <View
        style={[
          styles.filterWrap,
          { marginHorizontal: -gutter, paddingHorizontal: gutter },
        ]}>
        <HistoryFilter
          options={filters}
          value={status}
          onChange={setStatus}
        />
      </View>

      {folders.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { width: ms(56), height: ms(56) }]}>
            <FolderOpen color={colors.muted} size={ms(28)} />
          </View>
          <AppText weight="bold" style={[styles.emptyTitle, { fontSize: ms(16) }]}>
            {emptyTitle}
          </AppText>
          <AppText
            weight="regular"
            style={[styles.emptyMessage, { fontSize: ms(13) }]}>
            {emptyMessage}
          </AppText>
        </View>
      ) : (
        <View style={styles.folders}>
          {folders.map(folder => (
            <MonthFolderCard
              key={folder.key}
              label={folder.label}
              items={folder.items}
              expanded={expanded[folder.key] ?? true}
              onToggle={() => toggleFolder(folder.key)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
    width: '100%',
  },
  filterWrap: {},
  folders: {
    gap: 12,
    paddingBottom: 8,
    width: '100%',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.lg,
    width: '100%',
  },
  emptyIcon: {
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    textAlign: 'center',
  },
  emptyMessage: {
    marginTop: spacing.xs,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
  },
});
