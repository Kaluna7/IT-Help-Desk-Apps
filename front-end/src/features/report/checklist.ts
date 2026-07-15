export const CHECKLIST_SECTIONS = [
  {
    id: 'hardware',
    title: 'CEK HARDWARE',
    items: [
      { key: 'cpu', label: 'CPU', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'monitor1', label: 'MONITOR 1', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'monitor2', label: 'MONITOR 2', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'scanner', label: 'SCANNER', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'printerTmu', label: 'PRINTER TMU220', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'printerLaser', label: 'PRINTER LASERJET', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'mouse', label: 'MOUSE', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'keyboard', label: 'KEY BOARD', requiresPhoto: true, defaultStatus: 'Good' },
    ],
  },
  {
    id: 'software',
    title: 'SOFTWARE',
    items: [
      { key: 'windows', label: 'WINDOWS', requiresPhoto: true, defaultStatus: 'Active' },
      { key: 'browser', label: 'BROWSER', requiresPhoto: true, defaultStatus: 'Clear History' },
      { key: 'antivirus', label: 'ANTIVIRUS', requiresPhoto: true, defaultStatus: 'Secure' },
      { key: 'office', label: 'MS. OFFICE', requiresPhoto: true, defaultStatus: 'Active' },
    ],
  },
  {
    id: 'internet',
    title: 'INTERNET POS',
    items: [
      { key: 'connection', label: 'KONEKSI', requiresPhoto: true, defaultStatus: 'Connected' },
    ],
  },
] as const;

export const STATUS_OPTIONS: Record<string, string[]> = {
  cpu: ['Good', 'Bad', 'Repair'],
  monitor1: ['Good', 'Bad', 'Repair'],
  monitor2: ['Good', 'Bad', 'Repair'],
  scanner: ['Good', 'Bad', 'Repair'],
  printerTmu: ['Good', 'Bad', 'Repair', '-'],
  printerLaser: ['Good', 'Bad', 'Repair', '-'],
  mouse: ['Good', 'Bad', 'Repair'],
  keyboard: ['Good', 'Bad', 'Repair'],
  windows: ['Active', 'Inactive', 'Update'],
  browser: ['Clear History', 'Not Cleared'],
  antivirus: ['Secure', 'Risk'],
  office: ['Active', 'Inactive'],
  connection: ['Connected', 'Disconnected'],
};

export function isSectionComplete(
  checklist: Record<string, { status?: string; photoUrl?: string }>,
  sectionId: string,
) {
  const section = CHECKLIST_SECTIONS.find(item => item.id === sectionId);
  if (!section) {
    return false;
  }

  return section.items.every(item => {
    const check = checklist?.[item.key];
    if (!check?.status) {
      return false;
    }
    if (item.requiresPhoto && !check.photoUrl) {
      return false;
    }
    return true;
  });
}

export function isReportChecklistComplete(
  units: Array<{
    checklist?: Record<string, { status?: string; photoUrl?: string }>;
  }>,
) {
  if (!units?.length) {
    return false;
  }

  return units.every(unit =>
    CHECKLIST_SECTIONS.every(section =>
      isSectionComplete(unit.checklist || {}, section.id),
    ),
  );
}
