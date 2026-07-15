import { API_BASE_URL } from '../shared/constants';

export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/`);
  if (!response.ok) {
    throw new Error('Failed to reach API');
  }
  return response.json();
}
