import axios from "axios";
import type { ApiResponse } from "@healthcare-platform/types";
import type {
  DashboardAnalytics,
  MetricCardData,
  PowerBIEmbedConfig,
  ReportItem,
  NotificationItem,
} from "../types/dashboard";
import { getStoredAccessToken } from "@healthcare-platform/utils";

const client = axios.create({
  baseURL:
    import.meta.env.VITE_DASHBOARD_API_URL ?? "http://localhost:8000/dashboard",
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getMetrics(): Promise<MetricCardData[]> {
  const response = await client.get<ApiResponse<MetricCardData[]>>("/metrics");
  if (!Array.isArray(response.data.data)) {
    throw new Error("The dashboard metrics response was invalid.");
  }
  return response.data.data;
}

export async function getAnalytics(): Promise<DashboardAnalytics> {
  const response =
    await client.get<ApiResponse<DashboardAnalytics>>("/analytics");
  const overview = response.data.data;
  if (
    !overview ||
    !overview.executive ||
    !Array.isArray(overview.executive.kpis) ||
    !Array.isArray(overview.executive.monthlyRevenue) ||
    !Array.isArray(overview.executive.monthlyAppointments) ||
    !Array.isArray(overview.executive.patientGrowth) ||
    !overview.doctors ||
    !overview.patients ||
    !overview.revenue ||
    !overview.appointments
  ) {
    throw new Error("The dashboard analytics response was invalid.");
  }
  return overview;
}

export async function getPowerBIEmbedConfig(): Promise<PowerBIEmbedConfig> {
  try {
    const response = await client.get<ApiResponse<PowerBIEmbedConfig>>(
      "/powerbi/embed-config",
    );
    const config = response.data.data;
    if (
      !config ||
      typeof config.reportId !== "string" ||
      typeof config.embedUrl !== "string" ||
      typeof config.accessToken !== "string"
    ) {
      throw new Error("The Power BI embed configuration was invalid.");
    }
    return config;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const detail: unknown = error.response?.data?.detail;
      if (typeof detail === "string") {
        throw new Error(detail);
      }
    }
    throw error;
  }
}

export async function getReports(): Promise<ReportItem[]> {
  const response = await client.get<ApiResponse<ReportItem[]>>("/reports");
  if (!Array.isArray(response.data.data)) {
    throw new Error("The dashboard reports response was invalid.");
  }
  return response.data.data;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const response =
    await client.get<ApiResponse<NotificationItem[]>>("/notifications");
  if (!Array.isArray(response.data.data)) {
    throw new Error("The dashboard notifications response was invalid.");
  }
  return response.data.data;
}
