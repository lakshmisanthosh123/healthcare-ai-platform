import axios from "axios";

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8001/api",
  timeout: 10000,
});

export function getAdminApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === "object") {
      const detail = "detail" in data ? data.detail : undefined;
      const message = "message" in data ? data.message : undefined;
      for (const value of [detail, message]) {
        if (typeof value === "string" && value.length > 0) {
          return value;
        }
      }
    }
    return error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("healthcare-auth-session");
      window.location.href =
        import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001/login";
    }
    return Promise.reject(error);
  },
);

export const unwrapData = <T>(payload: T | { data: T }): T =>
  payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
