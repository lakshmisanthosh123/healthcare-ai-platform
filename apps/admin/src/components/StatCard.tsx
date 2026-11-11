import type { ReactNode } from "react";
import { Card } from "@healthcare-platform/ui";
import "./StatCard.css";

interface StatCardProps {
  title: string;
  value: string;
  detail: string;
  icon?: ReactNode;
}

export function StatCard({ title, value, detail, icon }: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__title">{title}</span>
        {icon ? <span className="stat-card__icon">{icon}</span> : null}
      </div>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__detail">{detail}</p>
    </Card>
  );
}
