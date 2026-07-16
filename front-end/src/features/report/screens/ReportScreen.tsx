import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus } from 'lucide-react-native';
import { AppText, SafeScreen } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import { useLanguage } from '../../../shared/i18n';
import { useAuth } from '../../auth';
import {
  createReport,
  getLocations,
  getReports,
  LocationItem,
  reopenReport,
  ReportItem,
} from '../../../services/api';
import { getSocket, WorkingLocks } from '../../../services/socket';
import {
  CreateReportModal,
  EditCompletedModal,
  ReportCard,
} from '../components';
import type { ReportStackParamList } from '../ReportNavigator';

const ADD_SIZE = 40;

type Nav = NativeStackNavigationProp<ReportStackParamList, 'ReportList'>;
type TabKey = 'ongoing' | 'complete';

export function ReportScreen() {
  const navigation = useNavigation<Nav>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editReport, setEditReport] = useState<ReportItem | null>(null);
  const [tab, setTab] = useState<TabKey>('ongoing');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [locks, setLocks] = useState<WorkingLocks>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const labels = {
    createTitle: language === 'id' ? 'Buat Laporan' : 'Create Report',
    location: language === 'id' ? 'Lokasi' : 'Location',
    selectLocation: language === 'id' ? 'Pilih lokasi' : 'Select location',
    noLocation:
      language === 'id'
        ? 'Lokasi tidak ditemukan?'
        : "Can't find your location?",
    addNewLocation:
      language === 'id' ? 'Tambah lokasi baru' : 'Add new location',
    newLocationName: language === 'id' ? 'Nama lokasi' : 'Location name',
    saveLocation: language === 'id' ? 'Simpan lokasi' : 'Save location',
    cancel: language === 'id' ? 'Batal' : 'Cancel',
    create: language === 'id' ? 'Create' : 'Create',
    createdBy: language === 'id' ? 'Dibuat oleh' : 'Created by',
    working: language === 'id' ? 'sedang bekerja' : 'working',
    youWorking: language === 'id' ? 'Anda sedang bekerja' : 'You are working',
    ongoing: language === 'id' ? 'Ongoing' : 'Ongoing',
    complete: language === 'id' ? 'Complete' : 'Complete',
    emptyOngoing:
      language === 'id' ? 'Belum ada laporan berjalan' : 'No ongoing reports',
    emptyComplete:
      language === 'id' ? 'Belum ada laporan selesai' : 'No completed reports',
    emptyMessage:
      language === 'id'
        ? 'Tekan tombol + untuk membuat laporan lokasi.'
        : 'Tap the + button to create a location report.',
  };

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [locationData, reportData] = await Promise.all([
        getLocations(),
        getReports(),
      ]);
      setLocations(locationData);
      setReports(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  }, []);

  const ongoingReports = useMemo(
    () => reports.filter(item => item.status !== 'completed'),
    [reports],
  );
  const completedReports = useMemo(
    () => reports.filter(item => item.status === 'completed'),
    [reports],
  );

  const completedDayGroups = useMemo(() => {
    const map = new Map<string, ReportItem[]>();
    const sorted = [...completedReports].sort(
      (a, b) =>
        new Date(b.completedAt || b.createdAt).getTime() -
        new Date(a.completedAt || a.createdAt).getTime(),
    );
    for (const item of sorted) {
      const date = new Date(item.completedAt || item.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const date = new Date(items[0].completedAt || items[0].createdAt);
      const checkers: string[] = [];
      for (const item of items) {
        for (const person of item.contributors || []) {
          if (person.userName && !checkers.includes(person.userName)) {
            checkers.push(person.userName);
          }
        }
        if (item.checkedBy) {
          for (const part of item.checkedBy.split(',')) {
            const name = part.trim();
            if (name && !checkers.includes(name)) {
              checkers.push(name);
            }
          }
        }
      }
      return {
        key,
        label: date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        items,
        checkers: checkers.join(', ') || '-',
      };
    });
  }, [completedReports]);

  const visibleReports =
    tab === 'ongoing' ? ongoingReports : completedReports;

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      await loadData();
      if (mounted) {
        setLoading(false);
      }
    })();

    const socket = getSocket();

    const onSync = (payload: WorkingLocks) => setLocks(payload || {});
    const onUpdated = (payload: WorkingLocks) => setLocks(payload || {});
    const onCreated = (report: ReportItem) => {
      setReports(prev => {
        if (prev.some(item => item._id === report._id)) {
          return prev;
        }
        return [report, ...prev];
      });
    };
    const upsertReport = (report: ReportItem) => {
      setReports(prev => {
        const exists = prev.some(item => item._id === report._id);
        if (!exists) {
          return [report, ...prev];
        }
        return prev.map(item => (item._id === report._id ? report : item));
      });
    };
    const onCompleted = (report: ReportItem) => upsertReport(report);
    const onReportUpdated = (report: ReportItem) => upsertReport(report);
    const onReopened = (report: ReportItem) => upsertReport(report);

    socket.on('working:sync', onSync);
    socket.on('working:updated', onUpdated);
    socket.on('report:created', onCreated);
    socket.on('report:completed', onCompleted);
    socket.on('report:updated', onReportUpdated);
    socket.on('report:reopened', onReopened);

    return () => {
      mounted = false;
      socket.off('working:sync', onSync);
      socket.off('working:updated', onUpdated);
      socket.off('report:created', onCreated);
      socket.off('report:completed', onCompleted);
      socket.off('report:updated', onReportUpdated);
      socket.off('report:reopened', onReopened);
    };
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreate = async (location: LocationItem) => {
    if (!user) {
      throw new Error('User not ready');
    }

    const report = await createReport({
      locationId: location._id,
      createdById: user.id,
      createdByName: user.name,
    });

    setReports(prev => {
      if (prev.some(item => item._id === report._id)) {
        return prev;
      }
      return [report, ...prev];
    });
    setTab('ongoing');

    const socket = getSocket();
    socket.emit('working:start', {
      reportId: report._id,
      userId: user.id,
      userName: user.name,
    });

    navigation.navigate('ReportDetail', { reportId: report._id });
  };

  const handleCardPress = (report: ReportItem) => {
    if (!user) {
      return;
    }

    if (report.status === 'completed') {
      setEditReport(report);
      return;
    }

    const lock = locks[report._id];
    if (lock && lock.userId !== user.id) {
      return;
    }

    const socket = getSocket();
    if (!lock || lock.userId !== user.id) {
      socket.emit('working:start', {
        reportId: report._id,
        userId: user.id,
        userName: user.name,
      });
    }

    navigation.navigate('ReportDetail', { reportId: report._id });
  };

  const handleEditChecklist = async (report: ReportItem) => {
    if (!user) {
      return;
    }

    try {
      const reopened = await reopenReport(report._id);
      setReports(prev =>
        prev.map(item => (item._id === reopened._id ? reopened : item)),
      );
      setEditReport(null);
      setTab('ongoing');

      getSocket().emit('working:start', {
        reportId: reopened._id,
        userId: user.id,
        userName: user.name,
      });

      navigation.navigate('ReportDetail', { reportId: reopened._id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reopen report');
    }
  };

  return (
    <>
      <SafeScreen
        title={t.report.title}
        scroll
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        headerRight={
          tab === 'ongoing' ? (
            <View style={styles.circleWrap}>
              <Pressable
                onPress={() => setModalOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Add report"
                hitSlop={10}
                android_ripple={{
                  color: `${colors.hover}55`,
                  borderless: false,
                  foreground: true,
                }}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && Platform.OS === 'ios' && styles.addButtonPressed,
                ]}>
                <Plus color={colors.onPrimary} size={22} strokeWidth={2.75} />
              </Pressable>
            </View>
          ) : undefined
        }>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === 'ongoing' && styles.tabActive]}
            onPress={() => setTab('ongoing')}>
            <AppText
              weight="semiBold"
              style={[
                styles.tabText,
                tab === 'ongoing' && styles.tabTextActive,
              ]}>
              {labels.ongoing} ({ongoingReports.length})
            </AppText>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'complete' && styles.tabActive]}
            onPress={() => setTab('complete')}>
            <AppText
              weight="semiBold"
              style={[
                styles.tabText,
                tab === 'complete' && styles.tabTextActive,
              ]}>
              {labels.complete} ({completedReports.length})
            </AppText>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={styles.list}>
            {error ? (
              <AppText weight="regular" style={styles.error}>
                {error}
              </AppText>
            ) : null}

            {tab === 'ongoing' && visibleReports.length === 0 ? (
              <View style={styles.empty}>
                <AppText weight="bold" style={styles.emptyTitle}>
                  {labels.emptyOngoing}
                </AppText>
                <AppText weight="regular" style={styles.emptyMessage}>
                  {labels.emptyMessage}
                </AppText>
              </View>
            ) : null}

            {tab === 'complete' && completedDayGroups.length === 0 ? (
              <View style={styles.empty}>
                <AppText weight="bold" style={styles.emptyTitle}>
                  {labels.emptyComplete}
                </AppText>
              </View>
            ) : null}

            {tab === 'ongoing'
              ? visibleReports.map(report => {
                  const lock = locks[report._id];
                  const isLockedByMe = Boolean(
                    user && lock?.userId === user.id,
                  );
                  const isLockedByOther = Boolean(
                    user && lock && lock.userId !== user.id,
                  );

                  return (
                    <ReportCard
                      key={report._id}
                      report={report}
                      lockedBy={lock}
                      isLockedByMe={isLockedByMe}
                      isLockedByOther={isLockedByOther}
                      onPress={() => handleCardPress(report)}
                      labels={{
                        createdBy: labels.createdBy,
                        working: labels.working,
                        youWorking: labels.youWorking,
                      }}
                    />
                  );
                })
              : completedDayGroups.map(group => (
                  <View key={group.key} style={styles.dayGroup}>
                    <View style={styles.dayHeader}>
                      <AppText weight="bold" style={styles.dayTitle}>
                        {group.label}
                      </AppText>
                      <AppText weight="regular" style={styles.dayMeta}>
                        {group.items.length}{' '}
                        {language === 'id' ? 'data' : 'reports'}
                      </AppText>
                    </View>
                    <AppText weight="regular" style={styles.dayCheckers}>
                      {language === 'id' ? 'Dicek Oleh' : 'Checked By'}:{' '}
                      {group.checkers}
                    </AppText>
                    <View style={styles.dayList}>
                      {group.items.map(report => (
                        <ReportCard
                          key={report._id}
                          report={report}
                          isLockedByMe={false}
                          isLockedByOther={false}
                          onPress={() => handleCardPress(report)}
                          labels={{
                            createdBy: labels.createdBy,
                            working: labels.working,
                            youWorking: labels.youWorking,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                ))}
          </View>
        )}
      </SafeScreen>

      <CreateReportModal
        visible={modalOpen}
        locations={locations}
        onClose={() => setModalOpen(false)}
        onCreatedLocation={location => {
          setLocations(prev => {
            if (prev.some(item => item._id === location._id)) {
              return prev;
            }
            return [...prev, location].sort((a, b) =>
              a.name.localeCompare(b.name),
            );
          });
        }}
        onSubmit={handleCreate}
        labels={{
          title: labels.createTitle,
          location: labels.location,
          selectLocation: labels.selectLocation,
          noLocation: labels.noLocation,
          addNewLocation: labels.addNewLocation,
          newLocationName: labels.newLocationName,
          saveLocation: labels.saveLocation,
          cancel: labels.cancel,
          create: labels.create,
        }}
      />

      <EditCompletedModal
        visible={Boolean(editReport)}
        report={editReport}
        language={language}
        onClose={() => setEditReport(null)}
        onSaved={updated => {
          setReports(prev =>
            prev.map(item => (item._id === updated._id ? updated : item)),
          );
        }}
        onEditChecklist={handleEditChecklist}
      />
    </>
  );
}

const styles = StyleSheet.create({
  circleWrap: {
    width: ADD_SIZE,
    height: ADD_SIZE,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  addButton: {
    width: ADD_SIZE,
    height: ADD_SIZE,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addButtonPressed: {
    backgroundColor: colors.hover,
    opacity: 0.92,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.onPrimary,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  dayGroup: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    gap: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayTitle: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  dayMeta: {
    fontSize: 12,
    color: colors.muted,
  },
  dayCheckers: {
    fontSize: 12,
    color: colors.text,
  },
  dayList: {
    gap: spacing.sm,
  },
  center: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  empty: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.text,
  },
  emptyMessage: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
