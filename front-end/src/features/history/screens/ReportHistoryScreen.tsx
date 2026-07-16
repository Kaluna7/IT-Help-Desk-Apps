import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Folder,
} from 'lucide-react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { AppText, SafeScreen } from '../../../shared/components';
import { colors } from '../../../shared/constants';
import { useLanguage } from '../../../shared/i18n';
import { fileUrl, getReports, ReportItem } from '../../../services/api';
import { HistorySearchBar } from '../components';

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type DayGroup = {
  key: string;
  label: string;
  items: ReportItem[];
  checkers: string;
  excelUrl?: string;
};

type MonthFolder = {
  key: string;
  label: string;
  days: DayGroup[];
  total: number;
};

function collectCheckers(items: ReportItem[]) {
  const names: string[] = [];
  for (const item of items) {
    let added = false;
    for (const person of item.contributors || []) {
      const name = person.userName?.trim();
      if (name && !names.includes(name)) {
        names.push(name);
        added = true;
      }
    }
    if (!added && item.checkedBy) {
      for (const part of item.checkedBy.split(',')) {
        const name = part.trim();
        if (name && !names.includes(name)) {
          names.push(name);
        }
      }
    }
  }
  return names.join(', ') || '-';
}

function groupCompleted(items: ReportItem[]): MonthFolder[] {
  const monthMap = new Map<string, Map<string, ReportItem[]>>();
  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.completedAt || b.createdAt).getTime() -
      new Date(a.completedAt || a.createdAt).getTime(),
  );

  for (const item of sorted) {
    const date = new Date(item.completedAt || item.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = `${monthKey}-${String(date.getDate()).padStart(2, '0')}`;
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, new Map());
    }
    const days = monthMap.get(monthKey)!;
    const list = days.get(dayKey) ?? [];
    list.push(item);
    days.set(dayKey, list);
  }

  return Array.from(monthMap.entries()).map(([monthKey, daysMap]) => {
    const [year, month] = monthKey.split('-');
    const days = Array.from(daysMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([dayKey, dayItems]) => {
        const date = new Date(dayItems[0].completedAt || dayItems[0].createdAt);
        return {
          key: dayKey,
          label: date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
          items: dayItems,
          checkers: collectCheckers(dayItems),
          excelUrl: dayItems.find(item => item.excelUrl)?.excelUrl,
        };
      });

    return {
      key: monthKey,
      label: `${MONTH_LABELS[Number(month) - 1]} ${year}`,
      days,
      total: days.reduce((sum, day) => sum + day.items.length, 0),
    };
  });
}

export function ReportHistoryScreen() {
  const navigation = useNavigation();
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await getReports('completed');
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const folders = useMemo(() => {
    const filtered = reports.filter(item => {
      const q = search.trim().toLowerCase();
      if (!q) {
        return true;
      }
      return (
        item.locationName.toLowerCase().includes(q) ||
        item.createdByName.toLowerCase().includes(q) ||
        (item.checkedBy || '').toLowerCase().includes(q)
      );
    });
    return groupCompleted(filtered);
  }, [reports, search]);

  const openExcel = async (day: DayGroup) => {
    if (!day.excelUrl) {
      return;
    }

    const url = fileUrl(day.excelUrl);
    const fileName = `ITReport-${day.key}.xlsx`;

    try {
      const result = await ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: 'xlsx',
        path: `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'IT Report Excel',
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          mediaScannable: true,
        },
      }).fetch('GET', url);

      const path = result.path();
      await ReactNativeBlobUtil.android.actionViewIntent(
        path,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    } catch {
      Linking.openURL(url);
    }
  };

  return (
    <SafeScreen
      title={t.history.reportHistoryTitle}
      subtitle={t.history.reportHistorySubtitle}
      onBack={() => navigation.goBack()}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }>
      <HistorySearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t.history.searchReport}
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : error ? (
        <AppText weight="regular" style={styles.error}>
          {error}
        </AppText>
      ) : folders.length === 0 ? (
        <View style={styles.empty}>
          <AppText weight="bold" style={styles.emptyTitle}>
            {t.history.emptyReportTitle}
          </AppText>
          <AppText weight="regular" style={styles.emptyMessage}>
            {t.history.emptyReportMessage}
          </AppText>
        </View>
      ) : (
        <View style={styles.folders}>
          {folders.map(folder => {
            const open = expanded[folder.key] ?? true;
            return (
              <View key={folder.key} style={styles.folder}>
                <Pressable
                  style={styles.folderHeader}
                  onPress={() =>
                    setExpanded(prev => ({
                      ...prev,
                      [folder.key]: !open,
                    }))
                  }>
                  <View style={styles.folderLeft}>
                    <View style={styles.folderIcon}>
                      <Folder color={colors.accent} size={18} />
                    </View>
                    <View>
                      <AppText weight="bold" style={styles.folderTitle}>
                        {folder.label}
                      </AppText>
                      <AppText weight="regular" style={styles.folderMeta}>
                        {folder.days.length}{' '}
                        {language === 'id' ? 'hari' : 'days'} · {folder.total}{' '}
                        {language === 'id' ? 'data' : 'reports'}
                      </AppText>
                    </View>
                  </View>
                  {open ? (
                    <ChevronDown color={colors.muted} size={18} />
                  ) : (
                    <ChevronRight color={colors.muted} size={18} />
                  )}
                </Pressable>

                {open
                  ? folder.days.map(day => (
                      <Pressable
                        key={day.key}
                        style={styles.dayCard}
                        onPress={() => openExcel(day)}>
                        <View style={styles.dayTop}>
                          <FileSpreadsheet color={colors.active} size={20} />
                          <View style={styles.fileInfo}>
                            <AppText weight="semiBold" style={styles.fileTitle}>
                              {day.label}
                            </AppText>
                            <AppText weight="regular" style={styles.fileMeta}>
                              {day.items.length}{' '}
                              {language === 'id'
                                ? 'data publish'
                                : 'published reports'}
                            </AppText>
                          </View>
                        </View>
                        <AppText weight="regular" style={styles.checkers}>
                          {language === 'id' ? 'Dicek Oleh' : 'Checked By'}:{' '}
                          {day.checkers}
                        </AppText>
                        <View style={styles.locations}>
                          {day.items.map(item => (
                            <AppText
                              key={item._id}
                              weight="medium"
                              style={styles.locationItem}>
                              • {item.locationName}
                            </AppText>
                          ))}
                        </View>
                      </Pressable>
                    ))
                  : null}
              </View>
            );
          })}
        </View>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  folders: {
    marginTop: 14,
    gap: 12,
  },
  folder: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  folderHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  folderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  folderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.accent}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderTitle: {
    fontSize: 15,
    color: colors.text,
  },
  folderMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
  },
  dayCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    padding: 12,
    backgroundColor: colors.background,
    gap: 8,
  },
  dayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileTitle: {
    fontSize: 14,
    color: colors.text,
  },
  fileMeta: {
    marginTop: 3,
    fontSize: 12,
    color: colors.muted,
  },
  checkers: {
    fontSize: 12,
    color: colors.text,
  },
  locations: {
    gap: 2,
    paddingLeft: 4,
  },
  locationItem: {
    fontSize: 12,
    color: colors.muted,
  },
  empty: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.text,
  },
  emptyMessage: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  error: {
    marginTop: 14,
    color: colors.danger,
  },
});
