import { API_BASE_URL } from '../shared/constants';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

async function request<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string>) || {}),
  };

  if (init?.token) {
    headers.Authorization = `Bearer ${init.token}`;
  }

  const { token: _token, ...rest } = init || {};

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_BASE_URL}. Pastikan backend jalan.`,
    );
  }

  const data = await response.json().catch(() => ({} as { message?: string }));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data as T;
}

export function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchMe(token: string) {
  return request<{ user: AuthUser }>('/auth/me', {
    method: 'GET',
    token,
  });
}

export function updateProfile(
  token: string,
  payload: { name?: string; avatar?: string },
) {
  return request<{ user: AuthUser }>('/auth/profile', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}
