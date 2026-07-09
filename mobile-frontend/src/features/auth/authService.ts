import { router } from 'expo-router';

import { apiPost, setAuthToken } from '@/src/lib/api';
import { deleteToken } from '@/src/lib/token';

export const logout = async () => {
  try {
    await apiPost('/logout');
  } catch {
    // Ignore logout errors and clear local session.
  }

  await deleteToken();
  setAuthToken(null);
  router.replace('/login');
};
