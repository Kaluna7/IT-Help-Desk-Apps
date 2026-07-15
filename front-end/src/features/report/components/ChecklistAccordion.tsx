import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
} from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors } from '../../../shared/constants';
import { fileUrl } from '../../../services/api';
import {
  CHECKLIST_SECTIONS,
  STATUS_OPTIONS,
  isSectionComplete,
} from '../checklist';

type CheckValue = {
  status?: string;
  photoUrl?: string;
};

type ChecklistAccordionProps = {
  checklist: Record<string, CheckValue>;
  onChangeStatus: (key: string, status: string) => void;
  onCapturePhoto: (key: string) => void;
  language: 'en' | 'id';
};

export function ChecklistAccordion({
  checklist,
  onChangeStatus,
  onCapturePhoto,
  language,
}: ChecklistAccordionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hardware: true,
    software: false,
    internet: false,
  });
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.wrap}>
      {CHECKLIST_SECTIONS.map(section => {
        const sectionOpen = openSections[section.id] ?? false;
        const complete = isSectionComplete(checklist, section.id);

        return (
          <View key={section.id} style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
              android_ripple={{ color: 'transparent' }}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.checkBadge,
                    complete && styles.checkBadgeDone,
                  ]}>
                  {complete ? (
                    <Check color={colors.background} size={14} strokeWidth={3} />
                  ) : null}
                </View>
                <AppText weight="bold" style={styles.sectionTitle}>
                  {section.title}
                </AppText>
              </View>
              {sectionOpen ? (
                <ChevronDown color={colors.secondary} size={18} />
              ) : (
                <ChevronRight color={colors.secondary} size={18} />
              )}
            </Pressable>

            {sectionOpen
              ? section.items.map(item => {
                  const value = checklist[item.key] || {};
                  const options = STATUS_OPTIONS[item.key] || ['Good', 'Bad'];
                  const itemOpen = openItems[item.key] ?? false;
                  const photo = fileUrl(value.photoUrl);

                  return (
                    <View key={item.key} style={styles.itemBlock}>
                      <Pressable
                        style={styles.itemHeader}
                        onPress={() => toggleItem(item.key)}
                        android_ripple={{ color: 'transparent' }}>
                        <View style={styles.itemHeaderLeft}>
                          <AppText weight="semiBold" style={styles.itemLabel}>
                            {item.label}
                          </AppText>
                          {item.requiresPhoto ? (
                            <AppText weight="medium" style={styles.photoRequired}>
                              {language === 'id' ? 'Wajib foto' : 'Photo required'}
                            </AppText>
                          ) : null}
                        </View>
                        <View style={styles.itemHeaderRight}>
                          <AppText weight="medium" style={styles.selectedValue}>
                            {value.status ||
                              (language === 'id' ? 'Pilih' : 'Select')}
                          </AppText>
                          {itemOpen ? (
                            <ChevronDown color={colors.secondary} size={16} />
                          ) : (
                            <ChevronRight color={colors.secondary} size={16} />
                          )}
                        </View>
                      </Pressable>

                      {itemOpen ? (
                        <View style={styles.dropdownPanel}>
                          {options.map(option => {
                            const active = value.status === option;
                            return (
                              <Pressable
                                key={option}
                                onPress={() => {
                                  onChangeStatus(item.key, option);
                                  setOpenItems(prev => ({
                                    ...prev,
                                    [item.key]: false,
                                  }));
                                }}
                                style={[
                                  styles.optionRow,
                                  active && styles.optionRowActive,
                                ]}>
                                <AppText
                                  weight="semiBold"
                                  style={[
                                    styles.optionText,
                                    active && styles.optionTextActive,
                                  ]}>
                                  {option}
                                </AppText>
                                {active ? (
                                  <Check
                                    color={colors.background}
                                    size={14}
                                    strokeWidth={3}
                                  />
                                ) : null}
                              </Pressable>
                            );
                          })}

                          {item.requiresPhoto ? (
                            <View style={styles.photoBlock}>
                              {photo ? (
                                <Image
                                  source={{ uri: photo }}
                                  style={styles.photo}
                                />
                              ) : (
                                <View style={styles.photoEmpty}>
                                  <Camera color={colors.secondary} size={22} />
                                  <AppText
                                    weight="regular"
                                    style={styles.photoEmptyText}>
                                    {language === 'id'
                                      ? `Belum ada foto ${item.label}`
                                      : `No ${item.label} photo yet`}
                                  </AppText>
                                </View>
                              )}
                              <Pressable
                                style={styles.cameraBtn}
                                onPress={() => {
                                  onCapturePhoto(item.key);
                                }}
                                hitSlop={8}>
                                <Camera color={colors.background} size={16} />
                                <AppText
                                  weight="semiBold"
                                  style={styles.cameraBtnText}>
                                  {photo
                                    ? language === 'id'
                                      ? 'Ganti foto'
                                      : 'Change photo'
                                    : language === 'id'
                                      ? 'Tambah foto'
                                      : 'Add photo'}
                                </AppText>
                              </Pressable>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  );
                })
              : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.text,
    letterSpacing: 0.3,
  },
  itemBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: colors.card,
  },
  itemHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  itemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemLabel: {
    fontSize: 13,
    color: colors.text,
  },
  photoRequired: {
    fontSize: 11,
    color: colors.warning,
  },
  selectedValue: {
    fontSize: 12,
    color: colors.primary,
  },
  dropdownPanel: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 6,
    backgroundColor: colors.background,
  },
  optionRow: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
  },
  optionRowActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 13,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.background,
  },
  photoBlock: {
    marginTop: 6,
    gap: 10,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  photoEmpty: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
  },
  photoEmptyText: {
    fontSize: 12,
    color: colors.secondary,
  },
  cameraBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraBtnText: {
    color: colors.background,
    fontSize: 13,
  },
});
