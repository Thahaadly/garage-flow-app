import { isAxiosError, create } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import type { ApiResponse } from '@/src/types';
import { deleteToken, getToken } from './token';

type ApiErrorPayload = {
  meta?: {
    message?: string;
  };
  data?: {
    errors?: Record<string, string[] | string>;
  };
};

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname || '127.0.0.1';
    return `http://${hostname}:8000/api`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:8000/api`;
  }

  return 'http://127.0.0.1:8000/api';
};

export const api = create({
  baseURL: getBaseUrl(),
  headers: {
    Accept: 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const apiGet = async <T>(url: string, params?: Record<string, unknown>) => {
  const response = await api.get<ApiResponse<T>>(url, { params });
  return response.data.data;
};

export const apiGetRaw = async <T>(url: string, params?: Record<string, unknown>) => {
  const response = await api.get<T>(url, { params });
  return response.data;
};

export const apiPost = <T>(url: string, data?: unknown) => api.post<T>(url, data);

export const apiPut = <T>(url: string, data?: unknown) => api.put<T>(url, data);

export const apiDelete = <T>(url: string, params?: Record<string, unknown>) =>
  api.delete<T>(url, { params });

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError<ApiErrorPayload>(error)) {
    return fallback;
  }

  const payload = error.response?.data;
  const metaMessage = payload?.meta?.message;

  if (metaMessage) {
    return metaMessage;
  }

  const errors = payload?.data?.errors;

  if (errors) {
    const firstValue = Object.values(errors)[0];

    if (Array.isArray(firstValue)) {
      return firstValue[0] ?? fallback;
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return fallback;
};

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  // Bypass DOM Cloud Safe Page on native devices
  if (Platform.OS !== 'web') {
    config.headers.set('Referer', 'https://garageflow-api.sgp.dom.my.id/');
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      await deleteToken();
      router.replace('/login');
    }

    return Promise.reject(error);
  }
);
