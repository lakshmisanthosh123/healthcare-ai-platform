import axios from "axios";

const authSessionKey = "healthcare-auth-session";
const accessTokenKey = "access_token";
export const staffApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.PROD
      ? "https://healthcare-fastapi-api.onrender.com/api"
      : "http://localhost:8000/api"),
  timeout: 10000,
});

function getStoredAccessToken(): string | null {
  const token = localStorage.getItem(accessTokenKey);
  if (token) return token;

  try {
    const rawSession = localStorage.getItem(authSessionKey);
    if (!rawSession) return null;
    const session: unknown = JSON.parse(rawSession);
    if (
      session &&
      typeof session === "object" &&
      "accessToken" in session &&
      typeof session.accessToken === "string"
    ) {
      return session.accessToken;
    }
  } catch {
    return null;
  }
  return null;
}

staffApi.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

staffApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(accessTokenKey);
      localStorage.removeItem(authSessionKey);
      window.location.assign(
        import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login",
      );
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const { message } = data;
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }
    if (data && typeof data === "object" && "detail" in data) {
      const { detail } = data;
      if (typeof detail === "string" && detail.length > 0) {
        return detail;
      }
    }
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) {
    return {};
  }
  const data: unknown = error.response?.data;
  if (!data || typeof data !== "object" || !("errors" in data)) {
    return {};
  }

  const errors = data.errors;
  if (!errors || typeof errors !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).flatMap(([field, value]) => {
      if (typeof value === "string") {
        return [[field, value]];
      }
      if (Array.isArray(value) && typeof value[0] === "string") {
        return [[field, value[0]]];
      }
      return [];
    }),
  );
}

interface DataEnvelope<T> {
  data: T;
}

function isDataEnvelope<T>(
  response: T | DataEnvelope<T>,
): response is DataEnvelope<T> {
  return Boolean(
    response && typeof response === "object" && "data" in response,
  );
}

export function unwrapResponse<T>(response: T | DataEnvelope<T>): T {
  return isDataEnvelope(response) ? response.data : response;
}
