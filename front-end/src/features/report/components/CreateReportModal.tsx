import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ChevronDown, MapPin, Plus, X } from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing } from '../../../shared/constants';
import { createLocation, LocationItem } from '../../../services/api';

type CreateReportModalProps = {
  visible: boolean;
  locations: LocationItem[];
  onClose: () => void;
  onCreatedLocation: (location: LocationItem) => void;
  onSubmit: (location: LocationItem) => Promise<void>;
  labels: {
    title: string;
    location: string;
    selectLocation: string;
    noLocation: string;
    addNewLocation: string;
    newLocationName: string;
    saveLocation: string;
    cancel: string;
    create: string;
  };
};

export function CreateReportModal({
  visible,
  locations,
  onClose,
  onCreatedLocation,
  onSubmit,
  labels,
}: CreateReportModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      setSelectedId(null);
      setDropdownOpen(false);
      setShowAddLocation(false);
      setNewLocationName('');
      setError('');
      setCreating(false);
    }
  }, [visible]);

  const selected = useMemo(
    () => locations.find(item => item._id === selectedId) || null,
    [locations, selectedId],
  );

  const canCreate = Boolean(selected) && !creating;

  const handleSaveLocation = async () => {
    const name = newLocationName.trim();
    if (!name) {
      setError('Location name is required');
      return;
    }

    try {
      setSavingLocation(true);
      setError('');
      const location = await createLocation(name);
      onCreatedLocation(location);
      setSelectedId(location._id);
      setShowAddLocation(false);
      setNewLocationName('');
      setDropdownOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add location');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleCreate = async () => {
    if (!selected) {
      return;
    }

    try {
      setCreating(true);
      setError('');
      await onSubmit(selected);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText weight="bold" style={styles.title}>
              {labels.title}
            </AppText>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <AppText weight="semiBold" style={styles.label}>
            {labels.location}
          </AppText>

          <Pressable
            style={styles.dropdown}
            onPress={() => {
              setDropdownOpen(prev => !prev);
              setShowAddLocation(false);
            }}>
            <View style={styles.dropdownLeft}>
              <MapPin color={colors.accent} size={18} />
              <AppText
                weight="medium"
                style={[styles.dropdownText, !selected && styles.placeholder]}
                numberOfLines={1}>
                {selected?.name || labels.selectLocation}
              </AppText>
            </View>
            <ChevronDown color={colors.muted} size={18} />
          </Pressable>

          {dropdownOpen ? (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {locations.map(item => (
                  <Pressable
                    key={item._id}
                    style={[
                      styles.option,
                      selectedId === item._id && styles.optionActive,
                    ]}
                    onPress={() => {
                      setSelectedId(item._id);
                      setDropdownOpen(false);
                      setShowAddLocation(false);
                    }}>
                    <AppText
                      weight={selectedId === item._id ? 'semiBold' : 'regular'}
                      style={styles.optionText}>
                      {item.name}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.hintRow}>
            <AppText weight="regular" style={styles.hintText}>
              {labels.noLocation}{' '}
            </AppText>
            <Pressable
              onPress={() => {
                setShowAddLocation(true);
                setDropdownOpen(false);
              }}
              hitSlop={6}>
              <AppText weight="semiBold" style={styles.link}>
                {labels.addNewLocation}
              </AppText>
            </Pressable>
          </View>

          {showAddLocation ? (
            <View style={styles.addBox}>
              <AppText weight="semiBold" style={styles.addTitle}>
                {labels.addNewLocation}
              </AppText>
              <TextInput
                value={newLocationName}
                onChangeText={setNewLocationName}
                placeholder={labels.newLocationName}
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
              <Pressable
                style={[
                  styles.secondaryBtn,
                  (!newLocationName.trim() || savingLocation) && styles.btnDisabled,
                ]}
                disabled={!newLocationName.trim() || savingLocation}
                onPress={handleSaveLocation}>
                {savingLocation ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <>
                    <Plus color={colors.onPrimary} size={16} />
                    <AppText weight="semiBold" style={styles.secondaryBtnText}>
                      {labels.saveLocation}
                    </AppText>
                  </>
                )}
              </Pressable>
            </View>
          ) : null}

          {error ? (
            <AppText weight="regular" style={styles.error}>
              {error}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <AppText weight="semiBold" style={styles.cancelText}>
                {labels.cancel}
              </AppText>
            </Pressable>
            <Pressable
              style={[styles.createBtn, !canCreate && styles.btnDisabled]}
              disabled={!canCreate}
              onPress={handleCreate}>
              {creating ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <AppText weight="bold" style={styles.createText}>
                  {labels.create}
                </AppText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  label: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8,
  },
  dropdown: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  placeholder: {
    color: colors.muted,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 160,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionActive: {
    backgroundColor: `${colors.accent}18`,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  link: {
    fontSize: 13,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  hintRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 13,
    color: colors.muted,
  },
  addBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 10,
  },
  addTitle: {
    fontSize: 14,
    color: colors.text,
  },
  input: {
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 14,
  },
  secondaryBtn: {
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
  },
  error: {
    marginTop: 10,
    color: colors.danger,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  cancelText: {
    color: colors.muted,
    fontSize: 14,
  },
  createBtn: {
    flex: 1,
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  createText: {
    color: colors.onPrimary,
    fontSize: 14,
  },
  btnDisabled: {
    backgroundColor: colors.border,
    opacity: 0.8,
  },
});
