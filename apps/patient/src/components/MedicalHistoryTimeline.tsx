import type { MedicalRecord } from "@healthcare-platform/types";
import "../styles/components.css";

interface MedicalHistoryTimelineProps {
  records: MedicalRecord[];
  loading?: boolean;
  onRecordClick?: (record: MedicalRecord) => void;
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    diagnosis: "#667eea",
    treatment: "#2ed573",
    test: "#ffa502",
    vaccination: "#764ba2",
    surgery: "#ff4757",
    checkup: "#00b8d4",
  };
  return colors[type] || "#667eea";
};

export const MedicalHistoryTimeline = ({
  records,
  loading = false,
  onRecordClick,
}: MedicalHistoryTimelineProps) => {
  if (loading) {
    return <div className="timeline loading">Loading medical history...</div>;
  }

  if (!records || records.length === 0) {
    return <div className="timeline empty">No medical records found</div>;
  }

  return (
    <div className="timeline">
      {records.map((record) => (
        <div
          key={record.id}
          className="timeline-item"
          onClick={() => onRecordClick?.(record)}
          style={{ cursor: onRecordClick ? "pointer" : "default" }}
        >
          <div
            className="timeline-marker"
            style={{ backgroundColor: getTypeColor(record.type) }}
          />
          <div className="timeline-content">
            <div className="timeline-header">
              <h3 className="timeline-title">{record.type}</h3>
              <span className="timeline-date">
                {new Date(record.date).toLocaleDateString()}
              </span>
            </div>
            <p className="timeline-description">{record.description}</p>
            {record.doctorName && (
              <p className="timeline-doctor">Dr. {record.doctorName}</p>
            )}
            {record.notes && (
              <p className="timeline-notes">
                <strong>Notes:</strong> {record.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
