import {
  ActionSheetIOS,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';

export type PhotoSource = 'camera' | 'library';

const PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  quality: 0.7 as const,
  maxWidth: 1280,
  maxHeight: 1280,
  includeBase64: true,
  selectionLimit: 1,
};

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function ensureCameraPermission(language: 'en' | 'id'): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: language === 'id' ? 'Izin Kamera' : 'Camera Permission',
      message:
        language === 'id'
          ? 'Aplikasi membutuhkan akses kamera untuk foto checklist.'
          : 'The app needs camera access for checklist photos.',
      buttonPositive: 'OK',
      buttonNegative: language === 'id' ? 'Batal' : 'Cancel',
    },
  );

  return status === PermissionsAndroid.RESULTS.GRANTED;
}

async function ensureGalleryPermission(language: 'en' | 'id'): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      {
        title: language === 'id' ? 'Izin Galeri' : 'Gallery Permission',
        message:
          language === 'id'
            ? 'Aplikasi membutuhkan akses galeri untuk memilih foto.'
            : 'The app needs gallery access to choose photos.',
        buttonPositive: 'OK',
        buttonNegative: language === 'id' ? 'Batal' : 'Cancel',
      },
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    {
      title: language === 'id' ? 'Izin Galeri' : 'Gallery Permission',
      message:
        language === 'id'
          ? 'Aplikasi membutuhkan akses galeri untuk memilih foto.'
          : 'The app needs gallery access to choose photos.',
      buttonPositive: 'OK',
      buttonNegative: language === 'id' ? 'Batal' : 'Cancel',
    },
  );
  return status === PermissionsAndroid.RESULTS.GRANTED;
}

export function choosePhotoSource(
  language: 'en' | 'id',
): Promise<PhotoSource | null> {
  const title = language === 'id' ? 'Pilih foto' : 'Select photo';
  const takePhoto = language === 'id' ? 'Ambil foto' : 'Take photo';
  const fromGallery =
    language === 'id' ? 'Pilih dari galeri' : 'Choose from gallery';
  const cancel = language === 'id' ? 'Batal' : 'Cancel';

  return new Promise(resolve => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: [cancel, takePhoto, fromGallery],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            resolve('camera');
            return;
          }
          if (buttonIndex === 2) {
            resolve('library');
            return;
          }
          resolve(null);
        },
      );
      return;
    }

    Alert.alert(title, '', [
      { text: takePhoto, onPress: () => resolve('camera') },
      { text: fromGallery, onPress: () => resolve('library') },
      { text: cancel, style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

function showPickerError(
  language: 'en' | 'id',
  result: ImagePickerResponse,
) {
  const message =
    result.errorMessage ||
    result.errorCode ||
    (language === 'id'
      ? 'Gagal membuka kamera/galeri.'
      : 'Failed to open camera/gallery.');

  Alert.alert(language === 'id' ? 'Gagal' : 'Failed', message);
}

export async function pickChecklistPhoto(
  language: 'en' | 'id',
): Promise<ImagePickerResponse | null> {
  const source = await choosePhotoSource(language);
  if (!source) {
    return null;
  }

  // Android: tunggu Alert tutup dulu sebelum buka camera/gallery
  await wait(Platform.OS === 'android' ? 450 : 100);

  if (source === 'camera') {
    const allowed = await ensureCameraPermission(language);
    if (!allowed) {
      Alert.alert(
        language === 'id' ? 'Izin ditolak' : 'Permission denied',
        language === 'id'
          ? 'Izinkan akses kamera di pengaturan aplikasi.'
          : 'Allow camera access in app settings.',
      );
      return null;
    }

    const result = await launchCamera({
      ...PICKER_OPTIONS,
      cameraType: 'back',
      saveToPhotos: false,
    });

    if (result.errorCode || result.errorMessage) {
      showPickerError(language, result);
      return null;
    }

    return result;
  }

  const allowed = await ensureGalleryPermission(language);
  if (!allowed) {
    Alert.alert(
      language === 'id' ? 'Izin ditolak' : 'Permission denied',
      language === 'id'
        ? 'Izinkan akses galeri di pengaturan aplikasi.'
        : 'Allow gallery access in app settings.',
    );
    return null;
  }

  const result = await launchImageLibrary(PICKER_OPTIONS);

  if (result.errorCode || result.errorMessage) {
    showPickerError(language, result);
    return null;
  }

  return result;
}
