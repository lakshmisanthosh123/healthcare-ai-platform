import axios from "axios";
import {
  ACCESS_TOKEN_KEY,
  AUTH_SESSION_KEY,
  clearStoredAuthSession,
  getStoredAccessToken,
  notifyAuthSessionChanged,
} from "@healthcare-platform/utils";
import type { AuthUser } from "../types/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001",
  timeout: 10000,
});

export interface StoredSession {
  accessToken: string;
  user: AuthUser;
}

export const getStoredSession = (): StoredSession | null => {
  try {
    const value = localStorage.getItem(AUTH_SESSION_KEY);
    if (!value) return null;
    const session = JSON.parse(value) as StoredSession;
    return session.accessToken && session.user ? session : null;
  } catch {
    return null;
  }
};

export const setStoredSession = (session: StoredSession) => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  setStoredToken(session.accessToken);
  notifyAuthSessionChanged();
};

export const setStoredToken = (accessToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const clearStoredSession = () => {
  clearStoredAuthSession();
};

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearStoredSession();
    return Promise.reject(error);
  },
);
