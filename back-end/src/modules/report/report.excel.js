import path from 'path';
import ExcelJS from 'exceljs';
import { CHECKLIST_SECTIONS } from './checklist.template.js';
import {
  ensureExcelMonthDir,
  ensureUploadDirs,
  UPLOAD_ROOT,
} from './report.upload.js';

export { UPLOAD_ROOT, ensureUploadDirs };

/** Palette — header berwarna, data putih, status seperti badge */
const C = {
  primaryDark: 'FF43A047',
  primaryDeep: 'FF2E7D32',
  primarySoft: 'FFE8F5E9',
  primarySoft2: 'FFF1F8F4',
  hardware: 'FF43A047',
  software: 'FF0288D1',
  internet: 'FF00897B',
  ttd: 'FF5E35B1',
  metaBg: 'FF1B5E20',
  colHeader: 'FF2E7D32',
  white: 'FFFFFFFF',
  text: 'FF1F2937',
  muted: 'FF64748B',
  border: 'FF94A3B8',
  link: 'FF1565C0',
  // Status badges (mengikuti gambar)
  badgeGoodBg: 'FFF5E6C8',
  badgeGoodText: 'FF3E2723',
  badgeConnectedBg: 'FF4A6670',
  badgeConnectedText: 'FFF5F5F5',
  badgeActiveBg: 'FF1B5E20',
  badgeActiveText: 'FFE8F5E9',
  badgeHistoryBg: 'FF374151',
  badgeHistoryText: 'FFF3F4F6',
  badgeSecureBg: 'FF2563EB',
  badgeSecureText: 'FFFFFFFF',
  badgeReplaceBg: 'FFDC2626',
  badgeReplaceText: 'FFFFFFFF',
  badgeIdleBg: 'FFE5E7EB',
  badgeIdleText: 'FF6B7280',
  badgeWarnBg: 'FFF59E0B',
  badgeWarnText: 'FFFFFFFF',
};

const THIN_BORDER = {
  top: { style: 'thin', color: { argb: C.border } },
  left: { style: 'thin', color: { argb: C.border } },
  bottom: { style: 'thin', color: { argb: C.border } },
  right: { style: 'thin', color: { argb: C.border } },
};

const GROUP_BORDER = {
  top: { style: 'medium', color: { argb: C.primaryDeep } },
  left: { style: 'medium', color: { argb: C.primaryDeep } },
  bottom: { style: 'medium', color: { argb: C.primaryDeep } },
  right: { style: 'medium', color: { argb: C.primaryDeep } },
};

function solid(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function getCheck(unit, key) {
  if (!unit?.checklist) {
    return { status: '', photoUrl: '' };
  }
  if (unit.checklist instanceof Map) {
    const value = unit.checklist.get(key);
    if (!value) {
      return { status: '', photoUrl: '' };
    }
    return value.toObject ? value.toObject() : value;
  }
  return unit.checklist[key] || { status: '', photoUrl: '' };
}

function absoluteUrl(baseUrl, photoUrl) {
  if (!photoUrl) {
    return '';
  }
  if (photoUrl.startsWith('http')) {
    return photoUrl;
  }
  return `${baseUrl}${photoUrl}`;
}

export function dayKeyFromDate(dateInput) {
  const date = new Date(dateInput || Date.now());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCheckerNames(report) {
  const names = [];
  for (const person of report.contributors || []) {
    const name = String(person.userName || '').trim();
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }
  // Fallback ke checkedBy hasil complete (sudah dari contributors saja)
  const checkedBy = String(report.checkedBy || '').trim();
  if (checkedBy && names.length === 0) {
    for (const part of checkedBy.split(',')) {
      const name = part.trim();
      if (name && !names.includes(name)) {
        names.push(name);
      }
    }
  }
  return names;
}

function getGroupCheckerNames(reports) {
  const names = [];
  for (const report of reports) {
    for (const name of getCheckerNames(report)) {
      if (!names.includes(name)) {
        names.push(name);
      }
    }
  }
  return names;
}

function styleSectionCell(cell, bg, text = '') {
  if (text !== undefined && text !== null) {
    cell.value = text;
  }
  cell.font = { bold: true, color: { argb: C.white }, size: 11 };
  cell.fill = solid(bg);
  cell.border = THIN_BORDER;
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
}

function styleColHeader(cell, text) {
  cell.value = text;
  cell.font = { bold: true, color: { argb: C.white }, size: 10 };
  cell.fill = solid(C.colHeader);
  cell.border = THIN_BORDER;
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
}

function applyDataBorder(cell) {
  cell.border = THIN_BORDER;
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
}

function applyGroupOuterBorder(sheet, startRow, endRow, startCol, endCol) {
  for (let r = startRow; r <= endRow; r += 1) {
    for (let c = startCol; c <= endCol; c += 1) {
      const cell = sheet.getCell(r, c);
      const border = { ...(cell.border || THIN_BORDER) };
      if (r === startRow) {
        border.top = GROUP_BORDER.top;
      }
      if (r === endRow) {
        border.bottom = GROUP_BORDER.bottom;
      }
      if (c === startCol) {
        border.left = GROUP_BORDER.left;
      }
      if (c === endCol) {
        border.right = GROUP_BORDER.right;
      }
      cell.border = border;
    }
  }
}

function formatDateLabel(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date
    .toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();
}

function statusBadgeStyle(status) {
  const value = String(status || '').trim().toLowerCase();

  if (!value || value === '-') {
    return { bg: C.badgeIdleBg, text: C.badgeIdleText };
  }
  if (value === 'good') {
    return { bg: C.badgeGoodBg, text: C.badgeGoodText };
  }
  if (value === 'connected') {
    return { bg: C.badgeConnectedBg, text: C.badgeConnectedText };
  }
  if (value === 'active') {
    return { bg: C.badgeActiveBg, text: C.badgeActiveText };
  }
  if (value === 'secure') {
    return { bg: C.badgeSecureBg, text: C.badgeSecureText };
  }
  if (value === 'clear history' || value === 'history') {
    return { bg: C.badgeHistoryBg, text: C.badgeHistoryText };
  }
  if (
    value === 'replace' ||
    value === 'repair' ||
    value === 'bad' ||
    value === 'risk' ||
    value === 'disconnected' ||
    value === 'inactive' ||
    value === 'not cleared'
  ) {
    return { bg: C.badgeReplaceBg, text: C.badgeReplaceText };
  }
  if (value === 'update') {
    return { bg: C.badgeWarnBg, text: C.badgeWarnText };
  }
  return { bg: C.badgeGoodBg, text: C.badgeGoodText };
}

function applyStatusBadge(cell, status) {
  const badge = statusBadgeStyle(status);
  cell.value = status || '-';
  cell.fill = solid(badge.bg);
  cell.font = { bold: true, color: { argb: badge.text }, size: 9 };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.border = THIN_BORDER;
}

function paintMetaRow(sheet, row, lastCol, fill) {
  for (let c = 1; c <= lastCol; c += 1) {
    const cell = sheet.getCell(row, c);
    cell.fill = fill;
    cell.border = THIN_BORDER;
  }
}

function writeDayGroup(
  sheet,
  startRow,
  dayReports,
  dayKey,
  allItems,
  lastCol,
  ttdStart,
  ttdEnd,
  baseUrl,
  hardware,
  software,
  internet,
) {
  let row = startRow;
  const groupStart = row;
  const checkers = getGroupCheckerNames(dayReports);
  const checkerText = checkers.length ? checkers.join(', ') : '-';
  const count = dayReports.reduce(
    (sum, report) => sum + (report.units?.length || 1),
    0,
  );

  // Title banner
  sheet.mergeCells(row, 1, row, lastCol);
  const titleCell = sheet.getCell(row, 1);
  titleCell.value = 'IT HARDWARE & SOFTWARE CHECK REPORT';
  titleCell.font = { bold: true, color: { argb: C.white }, size: 14 };
  titleCell.fill = solid(C.metaBg);
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  paintMetaRow(sheet, row, lastCol, solid(C.metaBg));
  sheet.getRow(row).height = 28;
  row += 1;

  // Tanggal
  sheet.mergeCells(row, 1, row, lastCol);
  paintMetaRow(sheet, row, lastCol, solid(C.primarySoft));
  const dateCell = sheet.getCell(row, 1);
  dateCell.value = `Tanggal :  ${formatDateLabel(dayKey)}`;
  dateCell.font = { bold: true, color: { argb: C.primaryDeep }, size: 11 };
  dateCell.fill = solid(C.primarySoft);
  dateCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(row).height = 22;
  row += 1;

  // Dicek Oleh — di bawah tanggal
  sheet.mergeCells(row, 1, row, lastCol);
  paintMetaRow(sheet, row, lastCol, solid(C.primarySoft2));
  const checkerCell = sheet.getCell(row, 1);
  checkerCell.value = `Dicek Oleh :  ${checkerText}`;
  checkerCell.font = { bold: true, color: { argb: C.primaryDark }, size: 11 };
  checkerCell.fill = solid(C.primarySoft2);
  checkerCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  sheet.getRow(row).height = 24;
  row += 1;

  // Ringkasan kecil
  sheet.mergeCells(row, 1, row, lastCol);
  paintMetaRow(sheet, row, lastCol, solid(C.white));
  const summaryCell = sheet.getCell(row, 1);
  summaryCell.value = `Total data publish hari ini : ${count}    |    Kontributor : ${checkers.length || 0} orang`;
  summaryCell.font = { color: { argb: C.muted }, size: 9, italic: true };
  summaryCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(row).height = 18;
  row += 1;

  // Section banners berwarna
  const sectionRow = row;
  const hwStart = 3;
  const hwEnd = 2 + hardware.length * 2;
  const swStart = hwEnd + 1;
  const swEnd = hwEnd + software.length * 2;
  const inetStart = swEnd + 1;
  const inetEnd = swEnd + internet.length * 2;

  for (let c = 1; c <= lastCol; c += 1) {
    styleSectionCell(sheet.getCell(sectionRow, c), C.colHeader, '');
  }
  styleSectionCell(sheet.getCell(sectionRow, 1), C.colHeader, '');
  styleSectionCell(sheet.getCell(sectionRow, 2), C.colHeader, '');

  sheet.mergeCells(sectionRow, hwStart, sectionRow, hwEnd);
  styleSectionCell(sheet.getCell(sectionRow, hwStart), C.hardware, 'CEK HARDWARE');
  for (let c = hwStart; c <= hwEnd; c += 1) {
    styleSectionCell(sheet.getCell(sectionRow, c), C.hardware);
  }
  sheet.getCell(sectionRow, hwStart).value = 'CEK HARDWARE';

  sheet.mergeCells(sectionRow, swStart, sectionRow, swEnd);
  for (let c = swStart; c <= swEnd; c += 1) {
    styleSectionCell(sheet.getCell(sectionRow, c), C.software);
  }
  sheet.getCell(sectionRow, swStart).value = 'SOFTWARE';

  sheet.mergeCells(sectionRow, inetStart, sectionRow, inetEnd);
  for (let c = inetStart; c <= inetEnd; c += 1) {
    styleSectionCell(sheet.getCell(sectionRow, c), C.internet);
  }
  sheet.getCell(sectionRow, inetStart).value = 'INTERNET POS';

  sheet.mergeCells(sectionRow, ttdStart, sectionRow, ttdEnd);
  for (let c = ttdStart; c <= ttdEnd; c += 1) {
    styleSectionCell(sheet.getCell(sectionRow, c), C.ttd);
  }
  sheet.getCell(sectionRow, ttdStart).value = 'TTD LEADER';
  sheet.getRow(sectionRow).height = 22;
  row += 1;

  // Column headers
  const headerRow = row;
  styleColHeader(sheet.getCell(headerRow, 1), 'NAMA LOKASI');
  styleColHeader(sheet.getCell(headerRow, 2), 'NO');

  let col = 3;
  for (const item of allItems) {
    sheet.mergeCells(headerRow, col, headerRow, col + 1);
    styleColHeader(sheet.getCell(headerRow, col), item.label);
    styleColHeader(sheet.getCell(headerRow, col + 1), '');
    sheet.getCell(headerRow, col).value = item.label;
    col += 2;
  }
  sheet.mergeCells(headerRow, ttdStart, headerRow, ttdEnd);
  styleColHeader(sheet.getCell(headerRow, ttdStart), '');
  styleColHeader(sheet.getCell(headerRow, ttdEnd), '');
  sheet.getRow(headerRow).height = 26;
  row += 1;

  const sorted = [...dayReports].sort(
    (a, b) =>
      new Date(a.completedAt || a.createdAt).getTime() -
      new Date(b.completedAt || b.createdAt).getTime(),
  );

  for (const report of sorted) {
    for (const unit of report.units || []) {
      const locCell = sheet.getCell(row, 1);
      locCell.value = (unit.name || report.locationName || '').toUpperCase();
      applyDataBorder(locCell);
      locCell.font = { bold: true, color: { argb: C.text }, size: 10 };
      locCell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      };

      const noCell = sheet.getCell(row, 2);
      noCell.value = unit.no;
      applyDataBorder(noCell);
      noCell.font = { bold: true, color: { argb: C.text } };

      let itemCol = 3;
      for (const item of allItems) {
        const check = getCheck(unit, item.key);
        const status = check.status || '';
        const inactive = status === '-';
        const linkCell = sheet.getCell(row, itemCol);
        const statusCell = sheet.getCell(row, itemCol + 1);
        applyDataBorder(linkCell);
        applyDataBorder(statusCell);

        const photoLink = absoluteUrl(baseUrl, check.photoUrl);
        if (inactive) {
          linkCell.value = '-';
          linkCell.font = { color: { argb: C.muted } };
          applyStatusBadge(statusCell, '-');
        } else {
          const label = item.linkLabel || item.label;
          if (photoLink) {
            linkCell.value = { text: label, hyperlink: photoLink };
          } else {
            linkCell.value = label;
          }
          linkCell.font = {
            color: { argb: C.link },
            underline: true,
            bold: true,
            size: 9,
          };
          applyStatusBadge(statusCell, status);
        }
        itemCol += 2;
      }

      sheet.mergeCells(row, ttdStart, row, ttdEnd);
      const ttdCell = sheet.getCell(row, ttdStart);
      ttdCell.value = report.leaderSign || '';
      applyDataBorder(ttdCell);
      applyDataBorder(sheet.getCell(row, ttdEnd));
      sheet.getRow(row).height = 24;
      row += 1;
    }
  }

  const notes = sorted
    .map(item => String(item.note || '').trim())
    .filter(Boolean);
  sheet.getCell(row, 1).value = 'NOTE :';
  sheet.getCell(row, 1).font = { bold: true, color: { argb: C.text } };
  applyDataBorder(sheet.getCell(row, 1));
  sheet.mergeCells(row, 2, row, lastCol);
  sheet.getCell(row, 2).value = notes.join(' | ') || '';
  sheet.getCell(row, 2).font = { color: { argb: C.text } };
  applyDataBorder(sheet.getCell(row, 2));
  sheet.getRow(row).height = 30;
  const groupEnd = row;

  applyGroupOuterBorder(sheet, groupStart, groupEnd, 1, lastCol);
  return groupEnd + 2;
}

export async function generateMonthGroupedExcel(
  reports,
  baseUrl,
  monthDate = new Date(),
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Hardware Check', {
    views: [{ state: 'frozen', ySplit: 0 }],
    properties: { defaultRowHeight: 18 },
  });

  const hardware =
    CHECKLIST_SECTIONS.find(s => s.id === 'hardware')?.items || [];
  const software =
    CHECKLIST_SECTIONS.find(s => s.id === 'software')?.items || [];
  const internet =
    CHECKLIST_SECTIONS.find(s => s.id === 'internet')?.items || [];
  const allItems = [...hardware, ...software, ...internet];

  const lastDataCol = 2 + allItems.length * 2;
  const ttdStart = lastDataCol + 1;
  const ttdEnd = ttdStart + 1;
  const lastCol = ttdEnd;

  const byDay = new Map();
  for (const report of reports) {
    const key = dayKeyFromDate(report.completedAt || report.createdAt);
    const list = byDay.get(key) || [];
    list.push(report);
    byDay.set(key, list);
  }

  const dayKeys = Array.from(byDay.keys()).sort();
  let row = 1;

  for (const dayKey of dayKeys) {
    row = writeDayGroup(
      sheet,
      row,
      byDay.get(dayKey) || [],
      dayKey,
      allItems,
      lastCol,
      ttdStart,
      ttdEnd,
      baseUrl,
      hardware,
      software,
      internet,
    );
  }

  sheet.getColumn(1).width = 30;
  sheet.getColumn(2).width = 8;
  for (let c = 3; c <= lastCol; c += 1) {
    sheet.getColumn(c).width = c % 2 === 1 ? 12 : 11;
  }

  const { dir, relativeDir, month } = ensureExcelMonthDir(monthDate);
  const fileName = `IT-Report-${month}.xlsx`;
  const filePath = path.join(dir, fileName);
  await workbook.xlsx.writeFile(filePath);

  return {
    excelPath: filePath,
    excelUrl: `/uploads/${relativeDir}/${fileName}`,
    month,
    dayKeys,
  };
}

export async function generateReportExcel(report, baseUrl) {
  return generateMonthGroupedExcel(
    [report],
    baseUrl,
    report.completedAt || new Date(),
  );
}
