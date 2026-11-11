import axios from "axios";

export const patientApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.PROD
      ? "https://healthcare-fastapi-api.onrender.com/api"
      : "http://localhost:8000/api"),
  timeout: 10000,
});

patientApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

patientApi.interceptors.response.use(
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
