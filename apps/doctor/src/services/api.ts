import axios from "axios";

const tokenKey = "access_token";

export const doctorApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  timeout: 10000,
});

doctorApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

doctorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(tokenKey);
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
