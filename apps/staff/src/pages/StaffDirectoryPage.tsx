import { useDeferredValue, useState } from "react";
import { Card } from "@healthcare-platform/ui";
import { getStoredAuthSession } from "@healthcare-platform/utils";
import type { Staff, StaffStatus } from "@healthcare-platform/types";
import { useTranslator } from "../hooks/useTranslator";
import {
  useDeleteStaff,
  useStaffList,
  useUpdateStaff,
} from "../hooks/useStaffQueries";
import { getApiErrorMessage } from "../services/api";
import { useStaffUiStore } from "../store/staffUiStore";
import type { StaffFormValues } from "@healthcare-platform/validation";
import { StaffDetailsModal } from "../components/StaffDetailsModal";
import { StaffForm } from "../components/StaffForm";

const statusTranslation: Record<StaffStatus, string> = {
  active: "staff.active",
  inactive: "staff.inactive",
  on_leave: "staff.onLeave",
};

export function StaffDirectoryPage() {
  const t = useTranslator();
  const canManageStaff =
    getStoredAuthSession()?.user?.role?.toLowerCase() === "admin";
  const filters = useStaffUiStore((state) => state.filters);
  const setSearch = useStaffUiStore((state) => state.setSearch);
  const setDepartment = useStaffUiStore((state) => state.setDepartment);
  const setEmploymentStatus = useStaffUiStore(
    (state) => state.setEmploymentStatus,
  );
  const isFormOpen = useStaffUiStore((state) => state.isStaffFormOpen);
  const setFormOpen = useStaffUiStore((state) => state.setStaffFormOpen);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [feedback, setFeedback] = useState("");
  const [requestError, setRequestError] = useState("");
  const search = useDeferredValue(filters.search.trim());
  const activeFilters = {
    ...(search ? { search } : {}),
    ...(filters.department ? { department: filters.department } : {}),
    ...(filters.employmentStatus
      ? { employmentStatus: filters.employmentStatus }
      : {}),
  };
  const staffList = useStaffList(activeFilters);
  const allStaff = useStaffList({});
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const isPending = updateStaff.isPending;

  const openEditForm = (staff: Staff) => {
    setEditingStaff(staff);
    setViewingStaff(null);
    setRequestError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isPending) return;
    setFormOpen(false);
    setEditingStaff(null);
  };

  const saveStaff = async (values: StaffFormValues) => {
    setRequestError("");
    if (!editingStaff) return;
    await updateStaff.mutateAsync({ id: editingStaff.id, payload: values });
    setFeedback(t("staff.updateSuccess"));
    setFormOpen(false);
    setEditingStaff(null);
    setTimeout(() => setFeedback(""), 3500);
  };

  const removeStaff = async (staff: Staff) => {
    if (!window.confirm(t("staff.deleteConfirm"))) return;
    setRequestError("");
    setFeedback("");
    try {
      await deleteStaff.mutateAsync(staff.id);
      setFeedback(t("staff.deleteSuccess"));
      setTimeout(() => setFeedback(""), 3500);
    } catch (error) {
      setRequestError(getApiErrorMessage(error, t("staff.loadError")));
    }
  };

  const departments = [
    ...new Set((allStaff.data ?? []).map((staff) => staff.department)),
  ].sort((a, b) => a.localeCompare(b));

  return (
    <section className="staff-page">
      <header className="staff-page-heading">
        <div>
          <p className="staff-eyebrow">{t("staff.directory")}</p>
          <h1>{t("staff.directory")}</h1>
          <p>{t("staff.directoryDescription")}</p>
        </div>
      </header>

      {feedback && (
        <div className="staff-alert staff-alert--success" role="status">
          {feedback}
        </div>
      )}
      {requestError && (
        <div className="staff-alert staff-alert--error" role="alert">
          {requestError}
        </div>
      )}
      {allStaff.isError && !staffList.isError && (
        <div className="staff-alert staff-alert--error" role="alert">
          {getApiErrorMessage(allStaff.error, t("staff.loadError"))}
        </div>
      )}

      <Card className="staff-directory-card">
        <div className="staff-filters">
          <label className="staff-search">
            <span>{t("staff.search")}</span>
            <input
              type="search"
              value={filters.search}
              placeholder={t("staff.searchPlaceholder")}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span>{t("staff.department")}</span>
            <select
              value={filters.department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="">{t("staff.allDepartments")}</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("staff.status")}</span>
            <select
              value={filters.employmentStatus}
              onChange={(event) => setEmploymentStatus(event.target.value)}
            >
              <option value="">{t("staff.allStatuses")}</option>
              <option value="active">{t("staff.active")}</option>
              <option value="inactive">{t("staff.inactive")}</option>
              <option value="on_leave">{t("staff.onLeave")}</option>
            </select>
          </label>
        </div>

        {staffList.isPending ? (
          <p className="staff-state" role="status">
            {t("staff.loading")}
          </p>
        ) : staffList.isError ? (
          <div className="staff-alert staff-alert--error" role="alert">
            {getApiErrorMessage(staffList.error, t("staff.loadError"))}
            <button type="button" onClick={() => void staffList.refetch()}>
              {t("staff.retry")}
            </button>
          </div>
        ) : staffList.data.length === 0 ? (
          <p className="staff-state">{t("staff.noStaff")}</p>
        ) : (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>{t("staff.employeeId")}</th>
                  <th>{t("staff.name")}</th>
                  <th>{t("staff.email")}</th>
                  <th>{t("staff.phone")}</th>
                  <th>{t("staff.jobTitle")}</th>
                  <th>{t("staff.department")}</th>
                  <th>{t("staff.status")}</th>
                  <th>{t("staff.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {staffList.data.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.employeeId || t("staff.notAvailable")}</td>
                    <td>{`${staff.firstName} ${staff.lastName}`}</td>
                    <td>{staff.email}</td>
                    <td>{staff.phone || t("staff.notAvailable")}</td>
                    <td>{staff.jobTitle}</td>
                    <td>{staff.department}</td>
                    <td>
                      <span
                        className={`staff-status staff-status--${staff.employmentStatus}`}
                      >
                        {t(statusTranslation[staff.employmentStatus])}
                      </span>
                    </td>
                    <td>
                      <div className="staff-row-actions">
                        <button
                          type="button"
                          className="staff-link-button"
                          onClick={() => setViewingStaff(staff)}
                        >
                          {t("staff.view")}
                        </button>
                        {canManageStaff && (
                          <>
                            <button
                              type="button"
                              className="staff-link-button"
                              onClick={() => openEditForm(staff)}
                            >
                              {t("staff.edit")}
                            </button>
                            <button
                              type="button"
                              className="staff-link-button staff-link-button--danger"
                              disabled={deleteStaff.isPending}
                              onClick={() => void removeStaff(staff)}
                            >
                              {t("staff.delete")}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editingStaff && (
        <StaffForm
          isOpen={isFormOpen}
          staff={editingStaff}
          isPending={isPending}
          onClose={closeForm}
          onSubmit={saveStaff}
        />
      )}
      <StaffDetailsModal
        staff={viewingStaff}
        canEdit={canManageStaff}
        onClose={() => setViewingStaff(null)}
        onEdit={openEditForm}
      />
    </section>
  );
}
