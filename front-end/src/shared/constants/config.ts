import { Platform } from 'react-native';

/**
 * Emulator Android biasanya pakai 10.0.2.2
 * HP fisik harus pakai IP PC di Wi-Fi yang sama.
 * IP PC saat ini: 192.168.2.144
 */
export const MANUAL_HOST = '192.168.2.144';

const DEV_HOST =
  MANUAL_HOST ||
  (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const API_BASE_URL = `http://${DEV_HOST}:3000`;
export const SOCKET_URL = API_BASE_URL;
