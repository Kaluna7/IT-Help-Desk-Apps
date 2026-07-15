import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText, SafeScreen } from '../../../shared/components';
import { colors, fonts } from '../../../shared/constants';
import { useLanguage } from '../../../shared/i18n';
import { useAuth } from '../../auth';
import {
  CheckItem,
  completeReport,
  getReport,
  ReportItem,
  updateReport,
  uploadCheckPhoto,
} from '../../../services/api';
import { getSocket } from '../../../services/socket';
import { isReportChecklistComplete } from '../checklist';
import { ChecklistAccordion } from '../components/ChecklistAccordion';
import { pickChecklistPhoto } from '../pickPhoto';
import type { ReportStackParamList } from '../ReportNavigator';

type Nav = NativeStackNavigationProp<ReportStackParamList, 'ReportDetail'>;
type Route = RouteProp<ReportStackParamList, 'ReportDetail'>;

export function ReportDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const labels = {
    title: language === 'id' ? 'Detail Laporan' : 'Report Detail',
    unitNo: language === 'id' ? 'No Unit / POS' : 'Unit / POS No',
    complete: language === 'id' ? 'Selesaikan Report' : 'Complete Report',
    incomplete:
      language === 'id'
        ? 'Lengkapi semua dropdown dan foto untuk setiap item.'
        : 'Complete all checklist items and photos first.',
  };

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await getReport(route.params.reportId);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [route.params.reportId]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (!user) {
          return;
        }
        getSocket().emit('working:stop', {
          reportId: route.params.reportId,
          userId: user.id,
        });
      };
    }, [route.params.reportId, user]),
  );

  const unit = report?.units?.[0];
  const canComplete = useMemo(
    () => (report ? isReportChecklistComplete(report.units || []) : false),
    [report],
  );

  const persistUnits = async (
    nextChecklist: Record<string, CheckItem>,
    fields?: {
      no?: string;
    },
  ) => {
    if (!report || !unit) {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateReport(report._id, {
        status: 'in_progress',
        userId: user?.id,
        userName: user?.name,
        units: [
          {
            _id: unit._id,
            no: fields?.no ?? unit.no,
            name: unit.name || report.locationName,
            checklist: nextChecklist,
          },
        ],
      });
      setReport(updated);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onChangeStatus = async (key: string, status: string) => {
    if (!unit) {
      return;
    }
    const next = {
      ...(unit.checklist || {}),
      [key]: {
        ...(unit.checklist?.[key] || {}),
        status,
      },
    };
    setReport(prev =>
      prev
        ? {
            ...prev,
            units: prev.units?.map((item, index) =>
              index === 0 ? { ...item, checklist: next } : item,
            ),
          }
        : prev,
    );
    await persistUnits(next);
  };

  const onCapturePhoto = async (key: string) => {
    if (!report || !unit) {
      return;
    }

    try {
      const result = await pickChecklistPhoto(language);
      if (!result || result.didCancel) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.base64 && !asset?.uri) {
        Alert.alert(
          language === 'id' ? 'Gagal' : 'Failed',
          language === 'id'
            ? 'Tidak bisa membaca foto. Coba lagi.'
            : 'Could not read the photo. Please try again.',
        );
        return;
      }

      const localPreview = asset.uri || '';
      if (localPreview) {
        setReport(prev => {
          if (!prev?.units?.[0]) {
            return prev;
          }
          const current = prev.units[0];
          return {
            ...prev,
            units: [
              {
                ...current,
                checklist: {
                  ...(current.checklist || {}),
                  [key]: {
                    ...(current.checklist?.[key] || {}),
                    photoUrl: localPreview,
                    status: current.checklist?.[key]?.status || 'Good',
                  },
                },
              },
              ...(prev.units.slice(1) || []),
            ],
          };
        });
      }

      if (!asset.base64) {
        Alert.alert(
          language === 'id' ? 'Gagal' : 'Failed',
          language === 'id'
            ? 'Foto tidak bisa di-upload. Coba ambil ulang.'
            : 'Photo could not be uploaded. Please try again.',
        );
        return;
      }

      const mime = asset.type || 'image/jpeg';
      const imageBase64 = `data:${mime};base64,${asset.base64}`;

      setSaving(true);
      const updated = await uploadCheckPhoto(
        report._id,
        unit._id,
        key,
        imageBase64,
        user ? { userId: user.id, userName: user.name } : undefined,
      );
      setReport(updated);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Upload photo failed',
      );
    } finally {
      setSaving(false);
    }
  };

  const onComplete = async () => {
    if (!report) {
      return;
    }
    if (!user?.name) {
      Alert.alert(
        'Error',
        language === 'id'
          ? 'User belum siap. Login ulang.'
          : 'User not ready. Please login again.',
      );
      return;
    }
    if (!canComplete) {
      Alert.alert(
        language === 'id' ? 'Belum lengkap' : 'Incomplete',
        labels.incomplete,
      );
      return;
    }

    try {
      setSaving(true);
      const updated = await completeReport(report._id, {
        checkedBy: user.name,
        userId: user.id,
      });
      setReport(updated);
      Alert.alert(
        language === 'id' ? 'Selesai' : 'Completed',
        language === 'id'
          ? 'Report selesai dan masuk ke History (Excel siap).'
          : 'Report completed and moved to History (Excel ready).',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ReportList'),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Complete failed',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen title={labels.title} onBack={() => navigation.goBack()}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <AppText weight="regular" style={styles.loadingText}>
            {language === 'id' ? 'Memuat checklist...' : 'Loading checklist...'}
          </AppText>
        </View>
      </SafeScreen>
    );
  }

  if (error && !report) {
    return (
      <SafeScreen title={labels.title} onBack={() => navigation.goBack()}>
        <AppText weight="regular" style={styles.error}>
          {error}
        </AppText>
        <Pressable onPress={load} style={styles.retryBtn}>
          <AppText weight="semiBold" style={styles.retryText}>
            {language === 'id' ? 'Coba lagi' : 'Retry'}
          </AppText>
        </Pressable>
      </SafeScreen>
    );
  }

  if (!report || !unit) {
    return (
      <SafeScreen
        title={report?.locationName || labels.title}
        subtitle={report ? labels.title : undefined}
        onBack={() => navigation.goBack()}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <AppText weight="regular" style={styles.loadingText}>
            {language === 'id'
              ? 'Menyiapkan form checklist...'
              : 'Preparing checklist form...'}
          </AppText>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen
      title={report.locationName}
      subtitle={labels.title}
      onBack={() => navigation.goBack()}>
      <View style={styles.metaCard}>
        <AppText weight="semiBold" style={styles.label}>
          {labels.unitNo}
        </AppText>
        <TextInput
          value={unit.no}
          onChangeText={text =>
            setReport(prev =>
              prev
                ? {
                    ...prev,
                    units: prev.units?.map((item, index) =>
                      index === 0 ? { ...item, no: text } : item,
                    ),
                  }
                : prev,
            )
          }
          onEndEditing={() => persistUnits(unit.checklist)}
          style={styles.input}
          keyboardType="number-pad"
        />
      </View>

      <ChecklistAccordion
        checklist={unit.checklist || {}}
        onChangeStatus={onChangeStatus}
        onCapturePhoto={onCapturePhoto}
        language={language}
      />

      {error ? (
        <AppText weight="regular" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <Pressable
        style={[styles.completeBtn, !canComplete && styles.completeDisabled]}
        disabled={!canComplete || saving || report.status === 'completed'}
        onPress={onComplete}>
        {saving ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <AppText weight="bold" style={styles.completeText}>
            {report.status === 'completed'
              ? language === 'id'
                ? 'Sudah selesai'
                : 'Already completed'
              : labels.complete}
          </AppText>
        )}
      </Pressable>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  metaCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  label: {
    marginTop: 4,
    fontSize: 13,
    color: colors.secondary,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    marginBottom: 10,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.background,
    fontSize: 14,
  },
  completeBtn: {
    marginTop: 8,
    marginBottom: 20,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeDisabled: {
    backgroundColor: '#D1D5DB',
  },
  completeText: {
    color: colors.background,
    fontSize: 15,
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.secondary,
    fontSize: 13,
  },
});
