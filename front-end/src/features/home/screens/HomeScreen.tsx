import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUpRight, Bell, CalendarCheck2, Gauge, MapPin } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '../../../shared/components';
import { colors, spacing } from '../../../shared/constants';
import { useLanguage } from '../../../shared/i18n';
import { useResponsive } from '../../../shared/hooks';
import { useAuth } from '../../auth';
import {
  createReport,
  getLocations,
  getReports,
  LocationItem,
  ReportItem,
} from '../../../services/api';
import { getSocket } from '../../../services/socket';
import { CreateReportModal } from '../../report/components';
import { HistorySearchBar } from '../../history/components/HistorySearchBar';
import { WorkLocationCard, WorkLocationFilter } from '../components';
import type { WorkPeriod } from '../types';
import type { ReportStackParamList } from '../../report/ReportNavigator';
import type { RootTabParamList } from '../../../app/AppNavigator';
import { CHECKLIST_SECTIONS } from '../../report/checklist';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Home'>,
  NativeStackNavigationProp<ReportStackParamList>
>;

function getGreetingKey(
  hour: number,
): 'goodMorning' | 'goodAfternoon' | 'goodNight' {
  if (hour >= 5 && hour < 12) {
    return 'goodMorning';
  }
  if (hour >= 12 && hour < 18) {
    return 'goodAfternoon';
  }
  return 'goodNight';
}

function isSameDay(iso: string, date = new Date()) {
  const value = new Date(iso);
  return (
    value.getFullYear() === date.getFullYear() &&
    value.getMonth() === date.getMonth() &&
    value.getDate() === date.getDate()
  );
}

function isSameMonth(iso: string, date = new Date()) {
  const value = new Date(iso);
  return (
    value.getFullYear() === date.getFullYear() &&
    value.getMonth() === date.getMonth()
  );
}

function isSameWeek(iso: string, date = new Date()) {
  const value = new Date(iso);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return value >= start && value < end;
}

function getReportActivityDate(report: ReportItem) {
  return report.completedAt || report.updatedAt || report.createdAt;
}

function isUserReport(report: ReportItem, userId?: string) {
  if (!userId) {
    return true;
  }
  if (report.createdById === userId) {
    return true;
  }
  return report.contributors?.some(item => item.userId === userId) ?? false;
}

function matchesWorkPeriod(report: ReportItem, period: WorkPeriod) {
  return matchesDatePeriod(getReportActivityDate(report), period);
}

function matchesDatePeriod(iso: string, period: WorkPeriod) {
  if (period === 'today') {
    return isSameDay(iso);
  }
  if (period === 'week') {
    return isSameWeek(iso);
  }
  return isSameMonth(iso);
}

function isChecklistItemDone(
  checklist: Record<string, { status?: string; photoUrl?: string }> | undefined,
  key: string,
  requiresPhoto: boolean,
) {
  const check = checklist?.[key];
  if (!check?.status) {
    return false;
  }
  if (requiresPhoto && !check.photoUrl) {
    return false;
  }
  return true;
}

/** Checklist completion % across active (non-completed) reports. */
function getWorkPerformancePercent(reports: ReportItem[]) {
  let complete = 0;
  let total = 0;

  const activeReports = reports.filter(item => item.status !== 'completed');

  for (const report of activeReports) {
    const units = report.units?.length ? report.units : [{ checklist: {} }];
    for (const unit of units) {
      for (const section of CHECKLIST_SECTIONS) {
        for (const item of section.items) {
          total += 1;
          if (
            isChecklistItemDone(
              unit.checklist,
              item.key,
              item.requiresPhoto,
            )
          ) {
            complete += 1;
          }
        }
      }
    }
  }

  if (total === 0) {
    return 0;
  }
  return Math.round((complete / total) * 100);
}

function CircularProgress({
  percent,
  size,
  strokeWidth = 8,
  trackColor,
  fillColor,
  labelSize,
  labelColor = colors.textPrimary,
}: {
  percent: number;
  size: number;
  strokeWidth?: number;
  trackColor: string;
  fillColor: string;
  labelSize: number;
  labelColor?: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <AppText
        weight="bold"
        style={{
          fontSize: labelSize,
          color: labelColor,
          letterSpacing: -0.6,
        }}>
        {clamped}%
      </AppText>
    </View>
  );
}

export function HomeScreen() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation<HomeNavigation>();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { gutter, isSmall, ms } = useResponsive();
  const horizontalPad = Math.max(gutter, insets.left, insets.right);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationPeriod, setLocationPeriod] = useState<WorkPeriod>('today');

  const createLabels = useMemo(
    () => ({
      title: language === 'id' ? 'Buat Laporan' : 'Create Report',
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
    }),
    [language],
  );

  const loadReports = useCallback(async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (focused) {
      loadReports();
    }
  }, [focused, loadReports]);

  const loadLocations = useCallback(async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch {
      setLocations([]);
    }
  }, []);

  useEffect(() => {
    if (modalOpen) {
      loadLocations();
    }
  }, [modalOpen, loadLocations]);

  const handleCreateReport = useCallback(
    async (location: LocationItem) => {
      if (!user) {
        throw new Error('User not ready');
      }

      const report = await createReport({
        locationId: location._id,
        createdById: user.id,
        createdByName: user.name,
      });

      setModalOpen(false);
      await loadReports();

      getSocket().emit('working:start', {
        reportId: report._id,
        userId: user.id,
        userName: user.name,
      });

      navigation.navigate('Report', {
        screen: 'ReportDetail',
        params: { reportId: report._id },
      });
    },
    [loadReports, navigation, user],
  );

  const handleOpenAddLocation = useCallback(() => {
    setModalOpen(true);
  }, []);

  const periodOptions = useMemo(
    () => [
      { label: t.home.filterToday, value: 'today' as const },
      { label: t.home.filterWeek, value: 'week' as const },
      { label: t.home.filterMonth, value: 'month' as const },
    ],
    [t.home],
  );

  const workedLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    const byLocation = new Map<string, ReportItem>();

    for (const report of reports) {
      if (!isUserReport(report, user?.id)) {
        continue;
      }
      if (!matchesWorkPeriod(report, locationPeriod)) {
        continue;
      }
      if (query && !report.locationName.toLowerCase().includes(query)) {
        continue;
      }

      const key = report.locationId || report.locationName;
      const existing = byLocation.get(key);
      if (
        !existing ||
        new Date(getReportActivityDate(report)).getTime() >
          new Date(getReportActivityDate(existing)).getTime()
      ) {
        byLocation.set(key, report);
      }
    }

    return Array.from(byLocation.values()).sort(
      (a, b) =>
        new Date(getReportActivityDate(b)).getTime() -
        new Date(getReportActivityDate(a)).getTime(),
    );
  }, [locationPeriod, locationSearch, reports, user?.id]);

  const handleWorkLocationPress = useCallback(
    (report: ReportItem) => {
      navigation.navigate('Report', {
        screen: 'ReportDetail',
        params: { reportId: report._id },
      });
    },
    [navigation],
  );

  const greeting = useMemo(() => {
    const key = getGreetingKey(new Date().getHours());
    return t.home[key];
  }, [t.home]);

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';

  const stats = useMemo(() => {
    const userReports = reports.filter(item => isUserReport(item, user?.id));
    const periodReports = userReports.filter(item =>
      matchesWorkPeriod(item, locationPeriod),
    );

    const periodLocations = new Set(
      periodReports.map(item => item.locationId || item.locationName),
    ).size;

    const periodCompleted = userReports.filter(item => {
      if (item.status !== 'completed') {
        return false;
      }
      const completedDate =
        item.completedAt || item.updatedAt || item.createdAt;
      return matchesDatePeriod(completedDate, locationPeriod);
    }).length;

    const periodCopy =
      locationPeriod === 'today'
        ? {
            reportTitle: t.home.todayReport,
            reportHint: t.home.todayReportHint,
            completeTitle: t.home.completeToday,
          }
        : locationPeriod === 'week'
          ? {
              reportTitle: t.home.weekReport,
              reportHint: t.home.weekReportHint,
              completeTitle: t.home.completeWeek,
            }
          : {
              reportTitle: t.home.monthReport,
              reportHint: t.home.monthReportHint,
              completeTitle: t.home.completeMonth,
            };

    return {
      periodLocations,
      periodCompleted,
      performance: getWorkPerformancePercent(reports),
      ...periodCopy,
    };
  }, [locationPeriod, reports, t.home, user?.id]);

  const handleNotificationsPress = useCallback(() => {
    // Notification screen can be wired here later.
  }, []);

  return (
    <View style={styles.root}>
      {focused ? (
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
      ) : null}

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never">
        <View
          style={[
            styles.page,
            {
              paddingBottom: ms(28),
            },
          ]}>
          <View style={styles.header}>
            <View pointerEvents="none" style={styles.headerDecor}>
              <View style={styles.headerBlobA} />
              <View style={styles.headerBlobB} />
            </View>

            <View
              style={[
                styles.headerContent,
                {
                  paddingHorizontal: horizontalPad,
                  paddingTop: insets.top + ms(16),
                  paddingBottom: ms(16),
                },
              ]}>
              <View style={styles.headerTopRow}>
                  <View style={styles.headerTextBlock}>
                    <AppText
                      weight="medium"
                      style={[
                        styles.greeting,
                        {
                          fontSize: isSmall ? ms(30) : ms(34),
                          lineHeight: isSmall ? ms(38) : ms(42),
                        },
                      ]}>
                      {greeting},
                    </AppText>

                    <AppText
                      weight="bold"
                      style={[
                        styles.name,
                        {
                          fontSize: isSmall ? ms(30) : ms(34),
                          lineHeight: isSmall ? ms(38) : ms(42),
                          marginTop: ms(4),
                        },
                      ]}
                      numberOfLines={1}>
                      {firstName || t.home.title}
                    </AppText>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t.home.notifications}
                    onPress={handleNotificationsPress}
                    style={({ pressed }) => [
                      styles.notificationButton,
                      {
                        width: ms(44),
                        height: ms(44),
                        borderRadius: ms(22),
                        marginTop: ms(2),
                      },
                      pressed && styles.notificationButtonPressed,
                    ]}>
                    <Bell
                      color={colors.primaryBlue}
                      size={ms(20)}
                      strokeWidth={2}
                    />
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.home.addLocation}
                onPress={handleOpenAddLocation}
                style={({ pressed }) => [
                  styles.addLocationButton,
                  {
                    marginTop: ms(22),
                    marginBottom: ms(0),
                    paddingVertical: ms(16),
                    borderRadius: ms(18),
                  },
                  pressed && styles.addLocationButtonPressed,
                ]}>
                <View style={[styles.addLocationContent, { gap: ms(10) }]}>
                  <MapPin
                    color={colors.onPrimary}
                    size={ms(18)}
                    strokeWidth={2.25}
                  />
                  <AppText
                    weight="semiBold"
                    style={[styles.addLocationText, { fontSize: ms(15) }]}>
                    {t.home.addLocation}
                  </AppText>
                </View>
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.overviewSection,
              {
                marginTop: ms(12),
                paddingHorizontal: horizontalPad,
              },
            ]}>
            <AppText
              weight="bold"
              style={[
                styles.sheetTitle,
                {
                  fontSize: ms(22),
                  lineHeight: ms(28),
                },
              ]}>
              {t.home.sheetTitle}
            </AppText>

            <View style={{ marginTop: ms(16), gap: ms(12) }}>
              <WorkLocationFilter
                options={periodOptions}
                value={locationPeriod}
                onChange={setLocationPeriod}
              />

              <HistorySearchBar
                value={locationSearch}
                onChangeText={setLocationSearch}
                placeholder={t.home.searchLocation}
              />
            </View>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.primaryBlue} />
              </View>
            ) : (
              <View style={[styles.statsBlock, { marginTop: ms(20), gap: ms(14) }]}>
                <View
                  style={[
                    styles.heroStatCard,
                    {
                      borderRadius: ms(32),
                      padding: ms(20),
                      minHeight: ms(160),
                    },
                  ]}>
                  <View style={styles.heroStatDecor} pointerEvents="none">
                    <View style={styles.heroCircleA} />
                    <View style={styles.heroCircleB} />
                  </View>

                  <View style={styles.statIconBadge}>
                    <ArrowUpRight
                      color={colors.primaryBlue}
                      size={ms(16)}
                      strokeWidth={2.25}
                    />
                  </View>

                  <View style={styles.heroStatContent}>
                    <AppText
                      weight="medium"
                      style={[styles.heroStatLabel, { fontSize: ms(14) }]}>
                      {stats.reportTitle}
                    </AppText>
                    <AppText
                      weight="bold"
                      style={[styles.heroStatValue, { fontSize: ms(44) }]}>
                      {stats.periodLocations}
                    </AppText>
                    <AppText
                      weight="regular"
                      style={[styles.heroStatHint, { fontSize: ms(13) }]}>
                      {stats.reportHint}
                    </AppText>
                  </View>
                </View>

                <View style={[styles.statsRow, { gap: ms(12) }]}>
                  <View
                    style={[
                      styles.softStatCard,
                      styles.softStatPurple,
                      {
                        borderRadius: ms(32),
                        padding: ms(20),
                        minHeight: ms(160),
                      },
                    ]}>
                    <View style={styles.statIconBadge}>
                      <Gauge
                        color={colors.primaryBlue}
                        size={ms(14)}
                        strokeWidth={2.25}
                      />
                    </View>

                    <View style={styles.softStatContent}>
                      <AppText
                        weight="medium"
                        style={[styles.softStatLabel, { fontSize: ms(12) }]}
                        numberOfLines={1}>
                        {t.home.performance}
                      </AppText>

                      <View style={styles.softStatMetric}>
                        <CircularProgress
                          percent={stats.performance}
                          size={ms(68)}
                          strokeWidth={ms(6)}
                          trackColor="rgba(79, 109, 255, 0.18)"
                          fillColor={colors.primaryBlue}
                          labelSize={ms(13)}
                        />
                      </View>

                      <AppText
                        weight="regular"
                        style={[styles.softStatHint, { fontSize: ms(11) }]}
                        numberOfLines={1}>
                        {t.home.performanceHint}
                      </AppText>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.softStatCard,
                      styles.softStatGrey,
                      {
                        borderRadius: ms(32),
                        padding: ms(20),
                        minHeight: ms(160),
                      },
                    ]}>
                    <View style={styles.statIconBadge}>
                      <CalendarCheck2
                        color={colors.primaryBlue}
                        size={ms(14)}
                        strokeWidth={2.25}
                      />
                    </View>

                    <View style={styles.softStatContent}>
                      <AppText
                        weight="medium"
                        style={[styles.softStatLabel, { fontSize: ms(12) }]}
                        numberOfLines={2}>
                        {stats.completeTitle}
                      </AppText>

                      <View style={styles.softStatMetric}>
                        <AppText
                          weight="bold"
                          style={[styles.softStatValue, { fontSize: ms(36) }]}>
                          {stats.periodCompleted}
                        </AppText>
                      </View>

                      <AppText
                        weight="regular"
                        style={[styles.softStatHint, { fontSize: ms(12) }]}>
                        {t.home.reports}
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>
          )}
          </View>

          <View
            style={[
              styles.workSection,
              {
                marginTop: ms(24),
                paddingHorizontal: horizontalPad,
                gap: ms(14),
              },
            ]}>
            <View>
              <AppText
                weight="bold"
                style={[
                  styles.sheetTitle,
                  {
                    fontSize: ms(22),
                    lineHeight: ms(28),
                  },
                ]}>
                {t.home.workLocationsTitle}
              </AppText>
              <AppText
                weight="regular"
                style={[
                  styles.sheetHint,
                  {
                    fontSize: ms(13),
                    lineHeight: ms(20),
                    marginTop: ms(6),
                  },
                ]}>
                {t.home.workLocationsHint}
              </AppText>
            </View>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.primaryBlue} />
              </View>
            ) : workedLocations.length === 0 ? (
              <View style={styles.emptyWorkWrap}>
                <AppText weight="regular" style={styles.emptyWorkText}>
                  {t.home.emptyWorkLocations}
                </AppText>
              </View>
            ) : (
              <View style={{ gap: ms(10) }}>
                {workedLocations.map(report => (
                  <WorkLocationCard
                    key={report._id}
                    report={report}
                    labels={{
                      complete: t.home.statusComplete,
                      ongoing: t.home.statusOngoing,
                    }}
                    onPress={() => handleWorkLocationPress(report)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <CreateReportModal
        visible={modalOpen}
        locations={locations}
        onClose={() => setModalOpen(false)}
        onCreatedLocation={location =>
          setLocations(prev => {
            if (prev.some(item => item._id === location._id)) {
              return prev;
            }
            return [location, ...prev];
          })
        }
        onSubmit={handleCreateReport}
        labels={createLabels}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  page: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  header: {
    width: '100%',
    backgroundColor: colors.background,
  },
  headerDecor: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  headerBlobA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.lightBlue,
    top: -40,
    right: -16,
  },
  headerBlobB: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightPurple,
    top: 32,
    right: 24,
    opacity: 0.7,
  },
  headerContent: {
    width: '100%',
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingVertical: spacing.xs,
  },
  notificationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBlue,
    borderWidth: 1,
    borderColor: 'rgba(79, 109, 255, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notificationButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  addLocationButton: {
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addLocationButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  addLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLocationText: {
    color: colors.onPrimary,
    letterSpacing: -0.2,
  },
  greeting: {
    color: colors.text,
    letterSpacing: -0.8,
    textAlign: 'left',
  },
  name: {
    color: colors.primaryBlue,
    letterSpacing: -0.8,
    textAlign: 'left',
    paddingBottom: Platform.OS === 'android' ? 2 : 0,
  },
  overviewSection: {
    width: '100%',
  },
  workSection: {
    width: '100%',
  },
  emptyWorkWrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyWorkText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  sheetTitle: {
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  sheetHint: {
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  loadingWrap: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  statsBlock: {
    width: '100%',
  },
  heroStatCard: {
    backgroundColor: colors.primaryBlue,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryBlue,
        shadowOpacity: 0.28,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroStatDecor: {
    ...StyleSheet.absoluteFill,
  },
  heroCircleA: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
    right: -40,
    top: -50,
  },
  heroCircleB: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: 30,
    bottom: -40,
  },
  statIconBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  heroStatContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: spacing.xxl,
    zIndex: 1,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.9)',
  },
  heroStatValue: {
    color: '#FFFFFF',
    letterSpacing: -1.2,
    marginVertical: spacing.sm,
  },
  heroStatHint: {
    color: 'rgba(255,255,255,0.75)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  softStatCard: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  softStatPurple: {
    backgroundColor: colors.lightPurple,
  },
  softStatGrey: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
  },
  softStatContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: spacing.xxl,
    zIndex: 1,
  },
  softStatLabel: {
    color: colors.textSecondary,
  },
  softStatMetric: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  softStatValue: {
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  softStatHint: {
    color: colors.textSecondary,
  },
});