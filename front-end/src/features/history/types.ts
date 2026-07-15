export type HistoryStatus =
  | 'all'
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'pending'
  | 'approved'
  | 'rejected';

export type HistoryItem = {
  id: string;
  title: string;
  status: Exclude<HistoryStatus, 'all'>;
  createdAt: string; // ISO date
  description?: string;
};

export type MonthFolder = {
  key: string;
  label: string;
  items: HistoryItem[];
};

export const REPORT_FILTERS: { label: string; value: HistoryStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export const REQUEST_FILTERS: { label: string; value: HistoryStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];
