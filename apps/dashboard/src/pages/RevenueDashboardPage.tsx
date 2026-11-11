import { AnalyticsReportPage } from "../components/AnalyticsReportPage";

export function RevenueDashboardPage() {
  return (
    <AnalyticsReportPage
      title="Revenue Dashboard"
      description="Review invoice totals, payment methods, and unpaid balances in INR."
      makeCharts={(data) => [
        {
          title: "Monthly Revenue",
          description: "Invoice totals by month, past 12 months",
          points: data.revenue.monthlyRevenue,
          style: "bar",
          format: "currency",
        },
        {
          title: "Daily Revenue",
          description: "Invoice totals by day, past 30 days",
          points: data.revenue.dailyRevenue,
          style: "line",
          format: "currency",
        },
        {
          title: "Payment Method",
          description: "Invoiced amount by recorded payment method",
          points: data.revenue.paymentMethods,
          style: "horizontal",
          format: "currency",
        },
        {
          title: "Outstanding Payments",
          description: "Total invoice amount still unpaid",
          points: data.revenue.outstandingPayments,
          style: "horizontal",
          format: "currency",
        },
      ]}
    />
  );
}
