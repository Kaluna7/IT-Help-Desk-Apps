import { API_BASE_URL } from '../shared/constants';

export type LocationItem = {
  _id: string;
  name: string;
};

export type CheckItem = {
  status: string;
  photoUrl?: string;
  photoPath?: string;
};

export type ReportUnit = {
  _id: string;
  no: string;
  name: string;
  checklist: Record<string, CheckItem>;
};

export type ReportItem = {
  _id: string;
  locationId: string;
  locationName: string;
  createdById: string;
  createdByName: string;
  checkedBy?: string;
  contributors?: Array<{ userId: string; userName: string }>;
  note?: string;
  leaderSign?: string;
  units?: ReportUnit[];
  status: string;
  excelUrl?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_BASE_URL}. Pastikan backend jalan dan MANUAL_HOST benar.`,
    );
  }

  const data = await response.json().catch(() => ({} as { message?: string }));
  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status}) ${path}`,
    );
  }
  return data as T;
}

export function getLocations() {
  return request<LocationItem[]>('/locations');
}

export function createLocation(name: string) {
  return request<LocationItem>('/locations', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function getReports(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request<ReportItem[]>(`/reports${query}`);
}

export function getReport(id: string) {
  return request<ReportItem>(`/reports/${id}`);
}

export function createReport(payload: {
  locationId: string;
  createdById: string;
  createdByName: string;
}) {
  return request<ReportItem>('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateReport(
  id: string,
  payload: Partial<{
    checkedBy: string;
    note: string;
    leaderSign: string;
    userId: string;
    userName: string;
    units: Array<{
      _id?: string;
      no: string;
      name: string;
      checklist: Record<string, CheckItem>;
    }>;
    status: string;
  }>,
) {
  return request<ReportItem>(`/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function uploadCheckPhoto(
  reportId: string,
  unitId: string,
  key: string,
  imageBase64: string,
  actor?: { userId: string; userName: string },
) {
  return request<ReportItem>(
    `/reports/${reportId}/units/${unitId}/checks/${key}/photo`,
    {
      method: 'POST',
      body: JSON.stringify({
        imageBase64,
        userId: actor?.userId,
        userName: actor?.userName,
      }),
    },
  );
}

export function completeReport(
  id: string,
  payload?: {
    checkedBy?: string;
    userId?: string;
    note?: string;
    leaderSign?: string;
  },
) {
  return request<ReportItem>(`/reports/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export function reopenReport(id: string) {
  return request<ReportItem>(`/reports/${id}/reopen`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function fileUrl(pathOrUrl?: string) {
  if (!pathOrUrl) {
    return '';
  }
  if (
    pathOrUrl.startsWith('http') ||
    pathOrUrl.startsWith('file:') ||
    pathOrUrl.startsWith('content:') ||
    pathOrUrl.startsWith('data:')
  ) {
    return pathOrUrl;
  }
  return `${API_BASE_URL}${pathOrUrl}`;
}
