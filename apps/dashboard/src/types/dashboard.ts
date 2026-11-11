export interface MetricCardData {
  title: string;
  value: string;
  detail: string;
}

export interface OverviewKpi {
  title: string;
  value: number;
  detail: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface AnalyticsSeries {
  label: string;
  value: number;
}

export interface ExecutiveAnalytics {
  kpis: OverviewKpi[];
  monthlyRevenue: AnalyticsSeries[];
  monthlyAppointments: AnalyticsSeries[];
  patientGrowth: AnalyticsSeries[];
}

export interface DoctorAnalytics {
  patientsPerDoctor: AnalyticsSeries[];
  doctorRating: AnalyticsSeries[];
  revenuePerDoctor: AnalyticsSeries[];
  appointmentStatus: AnalyticsSeries[];
}

export interface PatientAnalytics {
  genderDistribution: AnalyticsSeries[];
  ageDistribution: AnalyticsSeries[];
  newPatients: AnalyticsSeries[];
  returningPatients: AnalyticsSeries[];
}

export interface RevenueAnalytics {
  monthlyRevenue: AnalyticsSeries[];
  dailyRevenue: AnalyticsSeries[];
  paymentMethods: AnalyticsSeries[];
  outstandingPayments: AnalyticsSeries[];
}

export interface AppointmentAnalytics {
  appointmentStatus: AnalyticsSeries[];
  noShowAnalysis: AnalyticsSeries[];
  appointmentTrend: AnalyticsSeries[];
  peakBookingHours: AnalyticsSeries[];
}

export interface DashboardAnalytics {
  executive: ExecutiveAnalytics;
  doctors: DoctorAnalytics;
  patients: PatientAnalytics;
  revenue: RevenueAnalytics;
  appointments: AppointmentAnalytics;
}

export interface PowerBIEmbedConfig {
  reportId: string;
  embedUrl: string;
  accessToken: string;
  expiration?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  owner: string;
  status: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
}
