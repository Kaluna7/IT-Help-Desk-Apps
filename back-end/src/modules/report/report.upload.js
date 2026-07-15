import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_ROOT = path.resolve(__dirname, '../../../uploads');

function monthFolder(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function ensurePhotosMonthDir(date = new Date()) {
  const month = monthFolder(date);
  const dir = path.join(UPLOAD_ROOT, 'photos', month);
  fs.mkdirSync(dir, { recursive: true });
  return { dir, month, relativeDir: `photos/${month}` };
}

export function ensureExcelMonthDir(date = new Date()) {
  const month = monthFolder(date);
  const dir = path.join(UPLOAD_ROOT, 'excel', month);
  fs.mkdirSync(dir, { recursive: true });
  return { dir, month, relativeDir: `excel/${month}` };
}

/** @deprecated use ensurePhotosMonthDir / ensureExcelMonthDir */
export function ensureUploadDirs(reportId) {
  const dir = path.join(UPLOAD_ROOT, 'reports', String(reportId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveChecklistPhoto({
  reportId,
  unitId,
  key,
  base64Data,
  ext = 'jpg',
}) {
  const { dir, relativeDir } = ensurePhotosMonthDir();
  const safeKey = String(key).replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `${reportId}_${unitId}_${safeKey}_${Date.now()}.${ext}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

  return {
    fileName,
    filePath,
    photoUrl: `/uploads/${relativeDir}/${fileName}`,
    month: relativeDir.split('/')[1],
  };
}

export function initUploadFolders() {
  fs.mkdirSync(path.join(UPLOAD_ROOT, 'photos'), { recursive: true });
  fs.mkdirSync(path.join(UPLOAD_ROOT, 'excel'), { recursive: true });
  ensurePhotosMonthDir();
  ensureExcelMonthDir();
}
