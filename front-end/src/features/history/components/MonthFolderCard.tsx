import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors } from '../../../shared/constants';
import { useResponsive } from '../../../shared/hooks';
import { HistoryItem } from '../types';
import { formatItemDate, formatStatusLabel } from '../utils';

type MonthFolderCardProps = {
  label: string;
  items: HistoryItem[];
  expanded: boolean;
  onToggle: () => void;
};

export function MonthFolderCard({
  label,
  items,
  expanded,
  onToggle,
}: MonthFolderCardProps) {
  const { ms } = useResponsive();

  return (
    <View style={styles.folder}>
      <Pressable
        onPress={onToggle}
        style={styles.folderHeader}
        android_ripple={{ color: 'transparent' }}>
        <View style={styles.folderLeft}>
          <View
            style={[
              styles.folderIcon,
              { width: ms(40), height: ms(40) },
            ]}>
            <Folder color={colors.primary} size={ms(18)} />
          </View>
          <View style={styles.folderText}>
            <AppText
              weight="bold"
              style={[styles.folderTitle, { fontSize: ms(15) }]}
              numberOfLines={1}>
              {label}
            </AppText>
            <AppText
              weight="regular"
              style={[styles.folderMeta, { fontSize: ms(12) }]}>
              {items.length} item{items.length === 1 ? '' : 's'}
            </AppText>
          </View>
        </View>
        {expanded ? (
          <ChevronDown color={colors.secondary} size={ms(18)} />
        ) : (
          <ChevronRight color={colors.secondary} size={ms(18)} />
        )}
      </Pressable>

      {expanded
        ? items.map(item => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemDot} />
              <View style={styles.itemBody}>
                <AppText
                  weight="semiBold"
                  style={[styles.itemTitle, { fontSize: ms(14) }]}
                  numberOfLines={2}>
                  {item.title}
                </AppText>
                <AppText
                  weight="regular"
                  style={[styles.itemMeta, { fontSize: ms(12) }]}>
                  {formatStatusLabel(item.status)} ·{' '}
                  {formatItemDate(item.createdAt)}
                </AppText>
              </View>
            </View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  folder: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  folderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  folderIcon: {
    borderRadius: 12,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  folderText: {
    flex: 1,
    minWidth: 0,
  },
  folderTitle: {
    color: colors.text,
  },
  folderMeta: {
    marginTop: 2,
    color: colors.secondary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: colors.text,
  },
  itemMeta: {
    marginTop: 4,
    color: colors.secondary,
  },
});
