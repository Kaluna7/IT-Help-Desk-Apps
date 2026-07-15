export const CHECKLIST_SECTIONS = [
  {
    id: 'hardware',
    title: 'CEK HARDWARE',
    items: [
      { key: 'cpu', label: 'CPU', labelEn: 'CPU', linkLabel: 'CPU', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'monitor1', label: 'MONITOR 1', labelEn: 'MONITOR 1', linkLabel: 'Display', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'monitor2', label: 'MONITOR 2', labelEn: 'MONITOR 2', linkLabel: 'Layar Utama', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'scanner', label: 'SCANNER', labelEn: 'SCANNER', linkLabel: 'Scanner', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'printerTmu', label: 'PRINTER TMU220', labelEn: 'PRINTER TMU220', linkLabel: 'TMU', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'printerLaser', label: 'PRINTER LASERJET', labelEn: 'PRINTER LASERJET', linkLabel: 'LaserJet', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'mouse', label: 'MOUSE', labelEn: 'MOUSE', linkLabel: 'Mouse', requiresPhoto: true, defaultStatus: 'Good' },
      { key: 'keyboard', label: 'KEY BOARD', labelEn: 'KEY BOARD', linkLabel: 'Keyboard', requiresPhoto: true, defaultStatus: 'Good' },
    ],
  },
  {
    id: 'software',
    title: 'SOFTWARE',
    items: [
      { key: 'windows', label: 'WINDOWS', labelEn: 'WINDOWS', linkLabel: 'Windows', requiresPhoto: true, defaultStatus: 'Active' },
      { key: 'browser', label: 'BROWSER', labelEn: 'BROWSER', linkLabel: 'Browser', requiresPhoto: true, defaultStatus: 'Clear History' },
      { key: 'antivirus', label: 'ANTIVIRUS', labelEn: 'ANTIVIRUS', linkLabel: 'Antivirus', requiresPhoto: true, defaultStatus: 'Secure' },
      { key: 'office', label: 'MS. OFFICE', labelEn: 'MS. OFFICE', linkLabel: 'MS. Office', requiresPhoto: true, defaultStatus: 'Active' },
    ],
  },
  {
    id: 'internet',
    title: 'INTERNET POS',
    items: [
      { key: 'connection', label: 'KONEKSI', labelEn: 'KONEKSI', linkLabel: 'Koneksi', requiresPhoto: true, defaultStatus: 'Connected' },
    ],
  },
];

export const STATUS_OPTIONS = {
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

export function buildDefaultChecklist() {
  const checklist = {};
  for (const section of CHECKLIST_SECTIONS) {
    for (const item of section.items) {
      checklist[item.key] = {
        status: item.defaultStatus,
        photoUrl: '',
        photoPath: '',
      };
    }
  }
  return checklist;
}
