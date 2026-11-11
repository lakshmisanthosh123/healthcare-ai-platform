import { Button, Modal } from "@healthcare-platform/ui";
import { formatDate } from "@healthcare-platform/utils";
import type { Staff, StaffStatus } from "@healthcare-platform/types";
import { useTranslator } from "../hooks/useTranslator";
import translator from "@healthcare-platform/translator";

const statusTranslation: Record<StaffStatus, string> = {
  active: "staff.active",
  inactive: "staff.inactive",
  on_leave: "staff.onLeave",
};

interface StaffDetailsModalProps {
  staff: Staff | null;
  canEdit?: boolean;
  onClose: () => void;
  onEdit: (staff: Staff) => void;
}

export function StaffDetailsModal({
  staff,
  canEdit = false,
  onClose,
  onEdit,
}: StaffDetailsModalProps) {
  const t = useTranslator();
  if (!staff) return null;

  return (
    <Modal
      isOpen={Boolean(staff)}
      title={t("staff.staffDetails")}
      onClose={onClose}
      footer={
        <div className="staff-form__actions">
          <Button
            label={t("staff.cancel")}
            variant="secondary"
            onClick={onClose}
          />
          {canEdit && (
            <Button label={t("staff.edit")} onClick={() => onEdit(staff)} />
          )}
        </div>
      }
    >
      <dl className="staff-details">
        <div>
          <dt>{t("staff.name")}</dt>
          <dd>{`${staff.firstName} ${staff.lastName}`}</dd>
        </div>
        <div>
          <dt>{t("staff.employeeId")}</dt>
          <dd>{staff.employeeId || t("staff.notAvailable")}</dd>
        </div>
        <div>
          <dt>{t("staff.email")}</dt>
          <dd>{staff.email}</dd>
        </div>
        <div>
          <dt>{t("staff.phone")}</dt>
          <dd>{staff.phone || t("staff.notAvailable")}</dd>
        </div>
        <div>
          <dt>{t("staff.jobTitle")}</dt>
          <dd>{staff.jobTitle}</dd>
        </div>
        <div>
          <dt>{t("staff.department")}</dt>
          <dd>{staff.department}</dd>
        </div>
        <div>
          <dt>{t("staff.status")}</dt>
          <dd>{t(statusTranslation[staff.employmentStatus])}</dd>
        </div>
        <div>
          <dt>{t("staff.hireDate")}</dt>
          <dd>
            {staff.hireDate
              ? formatDate(
                  new Date(`${staff.hireDate.slice(0, 10)}T00:00:00`),
                  translator.language,
                )
              : t("staff.notAvailable")}
          </dd>
        </div>
      </dl>
    </Modal>
  );
}
