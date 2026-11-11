import type { ChartDataPoint } from "../types/dashboard";

export type DashboardChartStyle = "line" | "area" | "bar" | "horizontal";

interface DashboardChartProps {
  title: string;
  description: string;
  points: ChartDataPoint[];
  style: DashboardChartStyle;
  format?: "number" | "currency" | "rating";
  scaleMax?: number;
}

const chartWidth = 640;
const chartHeight = 260;
const plotLeft = 48;
const plotRight = 620;
const plotTop = 24;
const plotBottom = 212;

function getCoordinates(points: ChartDataPoint[]) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const step =
    points.length > 1 ? (plotRight - plotLeft) / (points.length - 1) : 0;
  return points.map((point, index) => ({
    ...point,
    x: plotLeft + index * step,
    y: plotBottom - (point.value / maxValue) * (plotBottom - plotTop),
  }));
}

export function DashboardChart({
  title,
  description,
  points,
  style,
  format = "number",
  scaleMax,
}: DashboardChartProps) {
  const hasData = points.length > 0;
  const formatValue = (value: number) => {
    if (format === "currency") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (format === "rating") return `${value.toFixed(2)} / 5`;
    return value.toLocaleString();
  };
  const coordinates = getCoordinates(points);
  const linePath = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = hasData
    ? `${linePath} L ${coordinates.at(-1)?.x} ${plotBottom} L ${coordinates[0].x} ${plotBottom} Z`
    : "";
  const horizontalHeight = Math.max(220, points.length * 38 + 28);
  const maxHorizontalValue = Math.max(
    ...points.map((point) => point.value),
    scaleMax ?? 1,
  );

  return (
    <section className="dashboard-chart" aria-labelledby={`${style}-${title}`}>
      <header className="dashboard-chart__header">
        <div>
          <h2 id={`${style}-${title}`}>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      {!hasData ? (
        <p className="dashboard-chart__empty">No data available yet.</p>
      ) : style === "horizontal" ? (
        <svg
          className="dashboard-chart__svg"
          viewBox={`0 0 640 ${horizontalHeight}`}
          role="img"
          aria-label={`${title}: ${points.map(({ label, value }) => `${label}, ${formatValue(value)}`).join("; ")}`}
        >
          {points.map((point, index) => {
            const y = index * 38 + 12;
            const width = (point.value / maxHorizontalValue) * 390;
            return (
              <g key={`${point.label}-${index}`}>
                <text
                  x="146"
                  y={y + 17}
                  textAnchor="end"
                  className="dashboard-chart__label"
                >
                  {point.label}
                </text>
                <rect
                  x="158"
                  y={y}
                  width={width}
                  height="24"
                  rx="6"
                  className="dashboard-chart__bar"
                >
                  <title>{`${point.label}: ${formatValue(point.value)}`}</title>
                </rect>
                <text
                  x={Math.min(158 + width + 8, 610)}
                  y={y + 17}
                  className="dashboard-chart__value"
                >
                  {formatValue(point.value)}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <svg
          className="dashboard-chart__svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`${title}: ${points.map(({ label, value }) => `${label}, ${formatValue(value)}`).join("; ")}`}
        >
          {[0, 1, 2, 3].map((line) => {
            const y = plotTop + ((plotBottom - plotTop) / 3) * line;
            return (
              <line
                key={line}
                x1={plotLeft}
                x2={plotRight}
                y1={y}
                y2={y}
                className="dashboard-chart__gridline"
              />
            );
          })}
          {style === "area" && (
            <path d={areaPath} className="dashboard-chart__area" />
          )}
          {style === "bar" ? (
            coordinates.map((point, index) => {
              const barWidth = Math.min(
                30,
                (plotRight - plotLeft) / points.length - 8,
              );
              return (
                <rect
                  key={`${point.label}-${index}`}
                  x={
                    plotLeft +
                    index * ((plotRight - plotLeft) / points.length) +
                    4
                  }
                  y={point.y}
                  width={barWidth}
                  height={plotBottom - point.y}
                  rx="4"
                  className="dashboard-chart__bar"
                >
                  <title>{`${point.label}: ${formatValue(point.value)}`}</title>
                </rect>
              );
            })
          ) : (
            <>
              <path
                d={linePath}
                className={
                  style === "area"
                    ? "dashboard-chart__line dashboard-chart__line--area"
                    : "dashboard-chart__line"
                }
              />
              {coordinates.map((point, index) => (
                <circle
                  key={`${point.label}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  className="dashboard-chart__point"
                >
                  <title>{`${point.label}: ${formatValue(point.value)}`}</title>
                </circle>
              ))}
            </>
          )}
          {coordinates.map((point, index) => (
            <text
              key={`${point.label}-${index}`}
              x={point.x}
              y="242"
              textAnchor="middle"
              className="dashboard-chart__label"
            >
              {point.label}
            </text>
          ))}
        </svg>
      )}
    </section>
  );
}
