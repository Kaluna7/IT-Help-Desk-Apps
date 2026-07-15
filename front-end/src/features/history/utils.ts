import { HistoryItem, HistoryStatus, MonthFolder } from './types';

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function filterHistoryItems(
  items: HistoryItem[],
  search: string,
  status: HistoryStatus,
): HistoryItem[] {
  const query = search.trim().toLowerCase();

  return items.filter(item => {
    const matchStatus = status === 'all' || item.status === status;
    const matchSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });
}

export function groupByMonth(items: HistoryItem[]): MonthFolder[] {
  const map = new Map<string, HistoryItem[]>();

  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  for (const item of sorted) {
    const date = new Date(item.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }

  return Array.from(map.entries()).map(([key, folderItems]) => {
    const [year, month] = key.split('-');
    const label = `${MONTH_LABELS[Number(month) - 1]} ${year}`;
    return { key, label, items: folderItems };
  });
}

export function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatItemDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
