import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  AppWindow,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';
import { AppText } from '../../../shared/components';
import { colors, radii, spacing, typeScale } from '../../../shared/constants';
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

const SECTION_META: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  hardware: { label: 'HARDWARE', icon: Cpu },
  software: { label: 'SOFTWARE', icon: AppWindow },
  internet: { label: 'NETWORK', icon: Wifi },
};

export function ChecklistAccordion({
  checklist,
  onChangeStatus,
  onCapturePhoto,
  language,
}: ChecklistAccordionProps) {
  const [activeSection, setActiveSection] = useState<string>(
    CHECKLIST_SECTIONS[0].id,
  );
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const active = CHECKLIST_SECTIONS.find(
    section => section.id === activeSection,
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.heroRow}>
        {CHECKLIST_SECTIONS.map(section => {
          const meta = SECTION_META[section.id];
          const Icon = meta?.icon ?? Cpu;
          const selected = activeSection === section.id;
          const complete = isSectionComplete(checklist, section.id);

          return (
            <Pressable
              key={section.id}
              style={[styles.heroBtn, selected && styles.heroBtnActive]}
              onPress={() => setActiveSection(section.id)}
              android_ripple={{ color: 'transparent' }}>
              <Icon
                color={selected ? colors.onPrimary : colors.primary}
                size={20}
                strokeWidth={1.75}
              />
              <AppText
                weight="semiBold"
                style={[styles.heroLabel, selected && styles.heroLabelActive]}>
                {meta?.label ?? section.title}
              </AppText>
              {complete ? (
                <View style={[styles.heroBadge, selected && styles.heroBadgeOnPrimary]}>
                  <Check
                    color={selected ? colors.primary : colors.card}
                    size={10}
                    strokeWidth={3}
                  />
                </View>
              ) : (
                <View style={[styles.heroDot, selected && styles.heroDotSelected]} />
              )}
            </Pressable>
          );
        })}
      </View>

      {active ? (
        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <AppText weight="semiBold" style={styles.contentTitle}>
              {active.title}
            </AppText>
            <AppText weight="regular" style={styles.contentHint}>
              {language === 'id'
                ? `${active.items.length} item`
                : `${active.items.length} items`}
            </AppText>
          </View>

          {active.items.map(item => {
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
                    <AppText weight="medium" style={styles.itemLabel}>
                      {item.label}
                    </AppText>
                    {item.requiresPhoto ? (
                      <AppText weight="regular" style={styles.photoRequired}>
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
                      <ChevronDown color={colors.muted} size={16} strokeWidth={1.75} />
                    ) : (
                      <ChevronRight color={colors.muted} size={16} strokeWidth={1.75} />
                    )}
                  </View>
                </Pressable>

                {itemOpen ? (
                  <View style={styles.dropdownPanel}>
                    {options.map(option => {
                      const optionActive = value.status === option;
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
                            optionActive && styles.optionRowActive,
                          ]}>
                          <AppText
                            weight="medium"
                            style={[
                              styles.optionText,
                              optionActive && styles.optionTextActive,
                            ]}>
                            {option}
                          </AppText>
                          {optionActive ? (
                            <Check
                              color={colors.onPrimary}
                              size={14}
                              strokeWidth={2.5}
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
                            <Camera color={colors.muted} size={20} strokeWidth={1.75} />
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
                          <Camera color={colors.onPrimary} size={16} strokeWidth={1.75} />
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
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroBtn: {
    flex: 1,
    minHeight: 88,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  heroBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  heroLabel: {
    ...typeScale.micro,
    color: colors.text,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  heroLabelActive: {
    color: colors.onPrimary,
  },
  heroBadge: {
    width: 16,
    height: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeOnPrimary: {
    backgroundColor: colors.primary,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  heroDotSelected: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  contentCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  contentHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  contentTitle: {
    ...typeScale.label,
    color: colors.text,
    letterSpacing: 0.3,
  },
  contentHint: {
    ...typeScale.caption,
    color: colors.muted,
  },
  itemBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  itemHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.card,
  },
  itemHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  itemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemLabel: {
    ...typeScale.label,
    color: colors.text,
  },
  photoRequired: {
    ...typeScale.micro,
    color: colors.warning,
  },
  selectedValue: {
    ...typeScale.caption,
    color: colors.primary,
  },
  dropdownPanel: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  optionRow: {
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
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
    ...typeScale.label,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.onPrimary,
  },
  photoBlock: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: radii.md,
    backgroundColor: colors.border,
  },
  photoEmpty: {
    height: 112,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
  },
  photoEmptyText: {
    ...typeScale.caption,
    color: colors.muted,
  },
  cameraBtn: {
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cameraBtnText: {
    color: colors.onPrimary,
    fontSize: 13,
  },
});
