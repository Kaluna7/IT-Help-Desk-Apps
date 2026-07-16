import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Pencil, X } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, fonts, radii, spacing } from '../../../shared/constants';
import { ReportItem, updateReport } from '../../../services/api';

type EditCompletedModalProps = {
  visible: boolean;
  report: ReportItem | null;
  language: 'en' | 'id';
  onClose: () => void;
  onSaved: (report: ReportItem) => void;
  onEditChecklist: (report: ReportItem) => void;
};

export function EditCompletedModal({
  visible,
  report,
  language,
  onClose,
  onSaved,
  onEditChecklist,
}: EditCompletedModalProps) {
  const [note, setNote] = useState('');
  const [leaderSign, setLeaderSign] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && report) {
      setNote(report.note || '');
      setLeaderSign(report.leaderSign || '');
      setError('');
      setSaving(false);
    }
  }, [visible, report]);

  if (!report) {
    return null;
  }

  const labels = {
    title: language === 'id' ? 'Edit Laporan' : 'Edit Report',
    location: language === 'id' ? 'Lokasi' : 'Location',
    checkedBy: language === 'id' ? 'Dicek Oleh' : 'Checked By',
    note: 'Note',
    leader: language === 'id' ? 'TTD Leader' : 'Leader Sign',
    save: language === 'id' ? 'Simpan' : 'Save',
    editChecklist:
      language === 'id' ? 'Edit Checklist' : 'Edit Checklist',
    cancel: language === 'id' ? 'Tutup' : 'Close',
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const updated = await updateReport(report._id, {
        note,
        leaderSign,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pencil color={colors.accent} size={18} />
              <AppText weight="bold" style={styles.title}>
                {labels.title}
              </AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <AppText weight="semiBold" style={styles.label}>
            {labels.location}
          </AppText>
          <AppText weight="regular" style={styles.value}>
            {report.locationName}
          </AppText>

          <AppText weight="semiBold" style={styles.label}>
            {labels.checkedBy}
          </AppText>
          <AppText weight="regular" style={styles.value}>
            {report.checkedBy || '-'}
          </AppText>

          <AppText weight="semiBold" style={styles.label}>
            {labels.note}
          </AppText>
          <TextInput
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="—"
            placeholderTextColor={colors.muted}
          />

          <AppText weight="semiBold" style={styles.label}>
            {labels.leader}
          </AppText>
          <TextInput
            value={leaderSign}
            onChangeText={setLeaderSign}
            style={styles.input}
            placeholder="—"
            placeholderTextColor={colors.muted}
          />

          {error ? (
            <AppText weight="regular" style={styles.error}>
              {error}
            </AppText>
          ) : null}

          <Pressable
            style={styles.primaryBtn}
            onPress={() => onEditChecklist(report)}
            disabled={saving}>
            <AppText weight="semiBold" style={styles.primaryBtnText}>
              {labels.editChecklist}
            </AppText>
          </Pressable>

          <Pressable
            style={[styles.secondaryBtn, saving && styles.disabled]}
            onPress={handleSave}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <AppText weight="semiBold" style={styles.secondaryBtnText}>
                {labels.save}
              </AppText>
            )}
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <AppText weight="medium" style={styles.cancelText}>
              {labels.cancel}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    color: colors.text,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: colors.muted,
  },
  value: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  input: {
    minHeight: 46,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  primaryBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: colors.accent,
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.muted,
    fontSize: 13,
  },
});
