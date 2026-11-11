import { useEffect, useMemo, useState } from "react";
import { Button, PageHeader, Table } from "@healthcare-platform/ui";
import type { Doctor, Patient, Staff } from "@healthcare-platform/types";
import { DoctorModal } from "../components/DoctorModal";
import { StaffModal } from "../components/StaffModal";
import {
  createDoctor,
  createStaff,
  deleteAdminStaff,
  deleteDoctor,
  getAdminDoctors,
  getAdminPatients,
  getAdminStaff,
  updateAdminStaff,
  updateDoctor,
} from "../services/adminService";
import type { NewDoctorPayload, NewStaffPayload } from "../types/admin";

type ActiveTab = "patients" | "doctors" | "staff";
type CsvValue = string | number | boolean | null | undefined;

interface PatientRow extends Patient {
  name: string;
  status: string;
}

interface DoctorRow extends Doctor {
  name: string;
  status: string;
  actions: string;
}

interface StaffRow extends Staff {
  name: string;
  actions: string;
}

function exportCsv(
  filename: string,
  headers: string[],
  rows: CsvValue[][],
): void {
  const escapeCell = (value: CsvValue) => {
    const text = String(value ?? "");
    const safeText = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safeText.replaceAll('"', '""')}"`;
  };
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

const normalize = (value: string | undefined) => (value ?? "").toLowerCase();

export function UsersPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientStatus, setPatientStatus] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorSpecialty, setDoctorSpecialty] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [staffDepartment, setStaffDepartment] = useState("");
  const [staffStatus, setStaffStatus] = useState("");
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("patients");

  useEffect(() => {
    let isCurrent = true;
    void Promise.allSettled([
      getAdminPatients(),
      getAdminDoctors(),
      getAdminStaff(),
    ]).then(([patientResult, doctorResult, staffResult]) => {
      if (!isCurrent) return;
      const failures: string[] = [];

      if (patientResult.status === "fulfilled") {
        setPatients(patientResult.value);
      } else {
        console.error("Failed to load patients:", patientResult.reason);
        failures.push("patients");
      }
      if (doctorResult.status === "fulfilled") {
        setDoctors(doctorResult.value);
      } else {
        console.error("Failed to load doctors:", doctorResult.reason);
        failures.push("doctors");
      }
      if (staffResult.status === "fulfilled") {
        setStaff(staffResult.value);
      } else {
        console.error("Failed to load staff:", staffResult.reason);
        failures.push("staff");
      }
      if (failures.length) {
        setErrorMessage(`Failed to load ${failures.join(", ")} records.`);
      }
      setIsLoading(false);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesSearch = [
        patient.id,
        patient.firstName,
        patient.lastName,
        patient.email,
        patient.phone,
      ].some((value) => normalize(value).includes(query));
      const isActive = patient.isActive !== false;
      return (
        matchesSearch &&
        (!patientStatus || (patientStatus === "active" ? isActive : !isActive))
      );
    });
  }, [patients, patientSearch, patientStatus]);

  const filteredDoctors = useMemo(() => {
    const query = doctorSearch.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSearch = [
        doctor.id,
        doctor.firstName,
        doctor.lastName,
        doctor.email,
        doctor.phone,
        doctor.specialty,
        doctor.department,
        doctor.licenseNumber,
      ].some((value) => normalize(value).includes(query));
      return (
        matchesSearch &&
        (!doctorSpecialty || doctor.specialty === doctorSpecialty)
      );
    });
  }, [doctors, doctorSearch, doctorSpecialty]);

  const filteredStaff = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    return staff.filter((member) => {
      const matchesSearch = [
        member.id,
        member.employeeId,
        member.firstName,
        member.lastName,
        member.email,
        member.phone,
        member.jobTitle,
        member.department,
      ].some((value) => normalize(value).includes(query));
      return (
        matchesSearch &&
        (!staffDepartment || member.department === staffDepartment) &&
        (!staffStatus || member.employmentStatus === staffStatus)
      );
    });
  }, [staff, staffSearch, staffDepartment, staffStatus]);

  const doctorSpecialties = useMemo(
    () =>
      [
        ...new Set(
          doctors.flatMap((doctor) =>
            doctor.specialty ? [doctor.specialty] : [],
          ),
        ),
      ].sort(),
    [doctors],
  );
  const staffDepartments = useMemo(
    () =>
      [...new Set(staff.map((member) => member.department))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [staff],
  );

  const handleDoctorSubmit = async (
    data: NewDoctorPayload | Partial<Doctor>,
  ) => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      if (editingDoctor) {
        const updated = await updateDoctor(editingDoctor.id, data);
        setDoctors((current) =>
          current.map((doctor) =>
            doctor.id === updated.id ? updated : doctor,
          ),
        );
        setSuccessMessage("Doctor updated successfully.");
        setEditingDoctor(null);
      } else if ("password" in data) {
        const doctor = await createDoctor(data);
        setDoctors((current) => [doctor, ...current]);
        setSuccessMessage("Doctor added successfully.");
      } else {
        throw new Error("A password is required when creating a doctor.");
      }
      setIsDoctorModalOpen(false);
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save doctor:", error);
      setErrorMessage("Failed to save doctor.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleStaffSubmit = async (
    data: NewStaffPayload | Omit<NewStaffPayload, "password">,
  ) => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      if (editingStaff) {
        const updated = await updateAdminStaff(editingStaff.id, data);
        setStaff((current) =>
          current.map((member) =>
            member.id === updated.id ? updated : member,
          ),
        );
        setSuccessMessage("Staff member updated successfully.");
        setEditingStaff(null);
      } else if ("password" in data) {
        const newStaff = await createStaff(data);
        setStaff((current) => [newStaff, ...current]);
        setSuccessMessage(
          "Staff member added. They can now sign in with the email and temporary password.",
        );
      } else {
        throw new Error(
          "A password is required when creating a staff account.",
        );
      }
      setIsStaffModalOpen(false);
      window.setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Failed to save staff member:", error);
      setErrorMessage("Failed to save staff member.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStaff = async (member: Staff) => {
    const shouldActivate = member.isActive === false;
    if (
      !shouldActivate &&
      !window.confirm(`Deactivate ${member.firstName} ${member.lastName}?`)
    ) {
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    try {
      if (shouldActivate) {
        await updateAdminStaff(member.id, { isActive: true });
      } else {
        await deleteAdminStaff(member.id);
      }
      setStaff((current) =>
        current.map((item) =>
          item.id === member.id ? { ...item, isActive: shouldActivate } : item,
        ),
      );
      setSuccessMessage(
        `Staff account ${shouldActivate ? "reactivated" : "deactivated"} successfully.`,
      );
      window.setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Failed to deactivate staff member:", error);
      setErrorMessage("Failed to deactivate staff member.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDoctor = async (doctor: Doctor) => {
    const shouldActivate = doctor.isActive === false;
    if (
      !shouldActivate &&
      !window.confirm(`Deactivate ${doctor.firstName} ${doctor.lastName}?`)
    ) {
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    try {
      if (shouldActivate) {
        const updated = await updateDoctor(doctor.id, { isActive: true });
        setDoctors((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        await deleteDoctor(doctor.id);
        setDoctors((current) =>
          current.map((item) =>
            item.id === doctor.id ? { ...item, isActive: false } : item,
          ),
        );
      }
      setSuccessMessage(
        `Doctor account ${shouldActivate ? "reactivated" : "deactivated"} successfully.`,
      );
      window.setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Failed to update doctor account:", error);
      setErrorMessage("Failed to update doctor account.");
    } finally {
      setIsSaving(false);
    }
  };

  const patientRows: PatientRow[] = filteredPatients.map((patient) => ({
    ...patient,
    name: `${patient.firstName} ${patient.lastName}`,
    status: patient.isActive === false ? "Inactive" : "Active",
  }));
  const doctorRows: DoctorRow[] = filteredDoctors.map((doctor) => ({
    ...doctor,
    name: `${doctor.firstName} ${doctor.lastName}`,
    status: doctor.isActive === false ? "Inactive" : "Active",
    actions: "",
  }));
  const staffRows: StaffRow[] = filteredStaff.map((member) => ({
    ...member,
    name: `${member.firstName} ${member.lastName}`,
    actions: "",
  }));

  const exportPatients = () =>
    exportCsv(
      `patients-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Patient ID",
        "Name",
        "Email",
        "Phone",
        "Date of birth",
        "Gender",
        "Blood type",
        "Status",
      ],
      patientRows.map((patient) => [
        patient.id,
        patient.name,
        patient.email,
        patient.phone,
        patient.dateOfBirth,
        patient.gender,
        patient.bloodType,
        patient.status,
      ]),
    );
  const exportDoctors = () =>
    exportCsv(
      `doctors-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Doctor ID",
        "Name",
        "Email",
        "Phone",
        "Specialty",
        "Department",
        "License number",
        "Status",
      ],
      doctorRows.map((doctor) => [
        doctor.id,
        doctor.name,
        doctor.email,
        doctor.phone,
        doctor.specialty,
        doctor.department,
        doctor.licenseNumber,
        doctor.status,
      ]),
    );
  const exportStaff = () =>
    exportCsv(
      `staff-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Employee ID",
        "Name",
        "Email",
        "Phone",
        "Job title",
        "Department",
        "Status",
        "Hire date",
      ],
      staffRows.map((member) => [
        member.employeeId,
        member.name,
        member.email,
        member.phone,
        member.jobTitle,
        member.department,
        member.employmentStatus,
        member.hireDate,
      ]),
    );

  const actions =
    activeTab === "patients" ? (
      <Button
        label="Export Patients"
        variant="secondary"
        disabled={filteredPatients.length === 0}
        onClick={exportPatients}
      />
    ) : activeTab === "doctors" ? (
      <div className="admin-users__actions">
        <Button
          label="Export Doctors"
          variant="secondary"
          disabled={filteredDoctors.length === 0}
          onClick={exportDoctors}
        />
        <Button
          label="Add Doctor"
          variant="primary"
          onClick={() => {
            setEditingDoctor(null);
            setIsDoctorModalOpen(true);
          }}
        />
      </div>
    ) : (
      <div className="admin-users__actions">
        <Button
          label="Export Staff"
          variant="secondary"
          disabled={filteredStaff.length === 0}
          onClick={exportStaff}
        />
        <Button
          label="Add Staff"
          variant="primary"
          onClick={() => {
            setEditingStaff(null);
            setIsStaffModalOpen(true);
          }}
        />
      </div>
    );

  return (
    <section className="admin-page">
      <PageHeader
        title="Patients, Doctors & Staff"
        subtitle="View, search, filter, and export each directory separately."
        actions={actions}
      />
      <div className="admin-content__body">
        {successMessage && (
          <div className="admin-users__success" role="status">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="admin-users__error" role="alert">
            {errorMessage}
          </div>
        )}

        <div
          className="admin-users__tabs"
          role="tablist"
          aria-label="Directories"
        >
          {(["patients", "doctors", "staff"] as const).map((tab) => (
            <button
              key={tab}
              id={`admin-${tab}-tab`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls="admin-directory-panel"
              className={activeTab === tab ? "is-active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <section
          className="admin-page-grid"
          id="admin-directory-panel"
          role="tabpanel"
          aria-labelledby={`admin-${activeTab}-tab`}
        >
          {activeTab === "patients" ? (
            <div className="admin-page-card">
              <div className="admin-users__filters">
                <label>
                  Search patients
                  <input
                    type="search"
                    value={patientSearch}
                    onChange={(event) => setPatientSearch(event.target.value)}
                    placeholder="Name, email, phone, or ID"
                  />
                </label>
                <label>
                  Status
                  <select
                    value={patientStatus}
                    onChange={(event) => setPatientStatus(event.target.value)}
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>
              {isLoading ? (
                <p role="status">Loading patients...</p>
              ) : (
                <Table
                  columns={[
                    { header: "Patient ID", key: "id" },
                    { header: "Name", key: "name" },
                    { header: "Email", key: "email" },
                    { header: "Phone", key: "phone" },
                    { header: "Date of birth", key: "dateOfBirth" },
                    { header: "Gender", key: "gender" },
                    { header: "Blood type", key: "bloodType" },
                    { header: "Status", key: "status" },
                  ]}
                  data={patientRows}
                />
              )}
            </div>
          ) : activeTab === "doctors" ? (
            <div className="admin-page-card">
              <div className="admin-users__filters">
                <label>
                  Search doctors
                  <input
                    type="search"
                    value={doctorSearch}
                    onChange={(event) => setDoctorSearch(event.target.value)}
                    placeholder="Name, email, specialty, or license"
                  />
                </label>
                <label>
                  Specialty
                  <select
                    value={doctorSpecialty}
                    onChange={(event) => setDoctorSpecialty(event.target.value)}
                  >
                    <option value="">All specialties</option>
                    {doctorSpecialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {isLoading ? (
                <p role="status">Loading doctors...</p>
              ) : (
                <Table
                  columns={[
                    { header: "Doctor ID", key: "id" },
                    { header: "Name", key: "name" },
                    { header: "Email", key: "email" },
                    { header: "Phone", key: "phone" },
                    { header: "Specialty", key: "specialty" },
                    { header: "Department", key: "department" },
                    { header: "License number", key: "licenseNumber" },
                    { header: "Status", key: "status" },
                    {
                      header: "Actions",
                      key: "actions",
                      render: (_value, doctor) => (
                        <div className="admin-users__actions">
                          <Button
                            label="Edit"
                            variant="secondary"
                            onClick={() => {
                              setEditingDoctor(doctor);
                              setIsDoctorModalOpen(true);
                            }}
                          />
                          <Button
                            label={
                              doctor.isActive === false
                                ? "Reactivate"
                                : "Deactivate"
                            }
                            variant="secondary"
                            disabled={isSaving}
                            onClick={() => void handleToggleDoctor(doctor)}
                          />
                        </div>
                      ),
                    },
                  ]}
                  data={doctorRows}
                />
              )}
            </div>
          ) : (
            <div className="admin-page-card">
              <div className="admin-users__filters">
                <label>
                  Search staff
                  <input
                    type="search"
                    value={staffSearch}
                    onChange={(event) => setStaffSearch(event.target.value)}
                    placeholder="Name, email, job title, or ID"
                  />
                </label>
                <label>
                  Department
                  <select
                    value={staffDepartment}
                    onChange={(event) => setStaffDepartment(event.target.value)}
                  >
                    <option value="">All departments</option>
                    {staffDepartments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    value={staffStatus}
                    onChange={(event) => setStaffStatus(event.target.value)}
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On leave</option>
                  </select>
                </label>
              </div>
              {isLoading ? (
                <p role="status">Loading staff...</p>
              ) : (
                <Table
                  columns={[
                    { header: "Employee ID", key: "employeeId" },
                    { header: "Name", key: "name" },
                    { header: "Email", key: "email" },
                    { header: "Phone", key: "phone" },
                    { header: "Job title", key: "jobTitle" },
                    { header: "Department", key: "department" },
                    {
                      header: "Status",
                      key: "isActive",
                      render: (_value, member) =>
                        member.isActive === false
                          ? "Locked"
                          : member.employmentStatus,
                    },
                    { header: "Hire date", key: "hireDate" },
                    {
                      header: "Actions",
                      key: "actions",
                      render: (_value, member) => (
                        <div className="admin-users__actions">
                          <Button
                            label="Edit"
                            variant="secondary"
                            onClick={() => {
                              setEditingStaff(member);
                              setIsStaffModalOpen(true);
                            }}
                          />
                          <Button
                            label={
                              member.isActive === false
                                ? "Reactivate"
                                : "Deactivate"
                            }
                            variant="secondary"
                            disabled={isSaving}
                            onClick={() => void handleToggleStaff(member)}
                          />
                        </div>
                      ),
                    },
                  ]}
                  data={staffRows}
                />
              )}
            </div>
          )}
        </section>

        <DoctorModal
          isOpen={isDoctorModalOpen}
          doctor={editingDoctor}
          onClose={() => {
            setIsDoctorModalOpen(false);
            setEditingDoctor(null);
          }}
          onSubmit={handleDoctorSubmit}
          loading={isSaving}
        />
        <StaffModal
          isOpen={isStaffModalOpen}
          loading={isSaving}
          staff={editingStaff}
          onClose={() => {
            setIsStaffModalOpen(false);
            setEditingStaff(null);
          }}
          onSubmit={handleStaffSubmit}
        />
      </div>
    </section>
  );
}
