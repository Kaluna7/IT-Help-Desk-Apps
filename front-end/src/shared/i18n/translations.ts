export type Language = 'en' | 'id';

export const translations = {
  en: {
    tabs: {
      home: 'Home',
      report: 'Report',
      request: 'Request',
      history: 'History',
      profile: 'Profile',
    },
    home: {
      title: 'Home',
      subtitle: "Today's IT report summary",
    },
    report: {
      title: 'Report',
      subtitle: 'Create and send IT incident reports',
    },
    request: {
      title: 'Request',
      subtitle: 'Submit IT service requests',
    },
    history: {
      title: 'History',
      subtitle: 'Choose the history type you want to view',
      reportTitle: 'Report History',
      reportDesc: 'View all incident reports you have submitted',
      requestTitle: 'Request History',
      requestDesc: 'View all service requests you have submitted',
      reportHistoryTitle: 'Report History',
      reportHistorySubtitle: 'Search, filter, and browse folders by month',
      requestHistoryTitle: 'Request History',
      requestHistorySubtitle: 'Search, filter, and browse folders by month',
      searchReport: 'Search report...',
      searchRequest: 'Search request...',
      emptyReportTitle: 'No reports yet',
      emptyReportMessage:
        'Report history will be grouped automatically by month once data is available.',
      emptyRequestTitle: 'No requests yet',
      emptyRequestMessage:
        'Request history will be grouped automatically by month once data is available.',
    },
    profile: {
      title: 'Profile',
      subtitle: 'Account information and preferences',
      language: 'Language',
      languageDesc: 'Choose your preferred app language',
      english: 'English',
      indonesian: 'Indonesian',
      englishNative: 'English',
      indonesianNative: 'Bahasa Indonesia',
    },
  },
  id: {
    tabs: {
      home: 'Beranda',
      report: 'Laporan',
      request: 'Permintaan',
      history: 'Riwayat',
      profile: 'Profil',
    },
    home: {
      title: 'Beranda',
      subtitle: 'Ringkasan laporan IT hari ini',
    },
    report: {
      title: 'Laporan',
      subtitle: 'Buat dan kirim laporan gangguan IT',
    },
    request: {
      title: 'Permintaan',
      subtitle: 'Ajukan permintaan layanan IT',
    },
    history: {
      title: 'Riwayat',
      subtitle: 'Pilih jenis riwayat yang ingin dilihat',
      reportTitle: 'Riwayat Laporan',
      reportDesc: 'Lihat semua laporan gangguan yang pernah dikirim',
      requestTitle: 'Riwayat Permintaan',
      requestDesc: 'Lihat semua permintaan layanan yang pernah diajukan',
      reportHistoryTitle: 'Riwayat Laporan',
      reportHistorySubtitle: 'Cari, filter, dan buka folder per bulan',
      requestHistoryTitle: 'Riwayat Permintaan',
      requestHistorySubtitle: 'Cari, filter, dan buka folder per bulan',
      searchReport: 'Cari laporan...',
      searchRequest: 'Cari permintaan...',
      emptyReportTitle: 'Belum ada laporan',
      emptyReportMessage:
        'Riwayat laporan akan dikelompokkan otomatis per bulan setelah ada data.',
      emptyRequestTitle: 'Belum ada permintaan',
      emptyRequestMessage:
        'Riwayat permintaan akan dikelompokkan otomatis per bulan setelah ada data.',
    },
    profile: {
      title: 'Profil',
      subtitle: 'Informasi akun dan preferensi',
      language: 'Bahasa',
      languageDesc: 'Pilih bahasa aplikasi yang diinginkan',
      english: 'English',
      indonesian: 'Indonesia',
      englishNative: 'English',
      indonesianNative: 'Bahasa Indonesia',
    },
  },
} as const;

export type TranslationKeys = typeof translations.en;
