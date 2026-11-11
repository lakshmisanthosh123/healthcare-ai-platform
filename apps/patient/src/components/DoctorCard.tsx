import type { Doctor } from "@healthcare-platform/types";
import "../styles/components.css";

interface DoctorCardProps {
  doctor: Doctor;
  onSelect?: (doctor: Doctor) => void;
  showDetails?: boolean;
}

export const DoctorCard = ({
  doctor,
  onSelect,
  showDetails = true,
}: DoctorCardProps) => {
  return (
    <div className="doctor-card">
      <div className="doctor-avatar">👨‍⚕️</div>
      <div className="doctor-info">
        <h3>
          Dr. {doctor.firstName} {doctor.lastName}
        </h3>
        <p className="specialty">{doctor.specialty}</p>

        {showDetails && (
          <>
            <div className="doctor-details">
              {doctor.email && <p>📧 {doctor.email}</p>}
              {doctor.phone && <p>📞 {doctor.phone}</p>}
            </div>
          </>
        )}
      </div>

      {onSelect && (
        <button onClick={() => onSelect(doctor)} className="btn btn-primary">
          Select
        </button>
      )}
    </div>
  );
};
