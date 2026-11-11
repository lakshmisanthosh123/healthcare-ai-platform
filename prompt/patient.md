Of course. 👍 You want the **prompt itself to be very simple**, like your original prompt, but still include the important features.

```text
Role:
You are a Senior React and TypeScript Software Engineer.

Context:
I am building a Healthcare AI Platform using React, TypeScript, Vite, pnpm, and Turborepo with Microfrontend architecture.

Task:
Create the Patient Module.

Application Location:
apps/patient

Create pages:

- Patient Details
- Medical History
- Prescription
- Appointment
- Profile

Patient Details:

- Show patient details.
- Allow patient to edit details.
- Save updated details using API.

Profile:

Add a Profile button in the top.

Profile should have:

- Edit Profile
- Change Password
- Change Language
- Logout

Change Password:

- Current Password
- New Password
- Confirm Password

Language:

Use @healthcare/translator.

- Add language selector.
- Change the complete application language.
- Use translator for all text.

Medical History:

- Show patient's medical history.
- Show diseases, allergies, surgeries, treatments, and reports.
- Get data from API.

Prescription:

- Show patient's prescriptions.
- Show doctor name.
- Show medicine.
- Show dosage.
- Show duration.
- Show instructions.
- Show prescription date.

Appointment:

Patient should be able to book an appointment with a particular doctor.

Flow:

- Show doctors.
- Search doctors.
- Filter doctors.
- Select doctor.
- Show doctor details.
- Show available dates.
- Select date.
- Show available time.
- Select time.
- Enter appointment reason.
- Book appointment.
- Show booking success.

After booking:

- Save appointment.
- Update Redux.
- Show appointment details.

Redux Toolkit:

Use Redux Toolkit.

Create:

- Patient slice
- Doctor slice
- Medical History slice
- Prescription slice
- Appointment slice

Use:

- configureStore
- createSlice
- createAsyncThunk

Redux should manage:

- Patient data
- Doctors
- Medical History
- Prescriptions
- Appointments
- Selected doctor
- Selected date
- Selected time
- Loading
- Error

API:

Use Axios.

Create services for:

- Patient
- Doctor
- Medical History
- Prescription
- Appointment
- Profile

Use:

VITE_API_BASE_URL

Do not hardcode API URL.

Authentication:

Use the existing Auth module and JWT.

Do not create another authentication system.

Only:

role = patient

can access the Patient Module.

If user is not authenticated:

→ Login

If user is:

patient → Patient Module

doctor → Doctor Module

admin → Admin Module

Routing:

Create:

- /
- /patient
- /medical-history
- /prescriptions
- /appointments
- /profile

Default:

/ → /patient

Protect all Patient routes.

Shared Packages:

Use:

- @healthcare/ui
- @healthcare/theme
- @healthcare/translator
- @healthcare/validation
- @healthcare/types
- @healthcare/utils

Use @healthcare/ui for:

- Button
- Input
- Table
- Card
- Modal
- Form
- Dropdown

Use @healthcare/theme for styling/theme.

Use @healthcare/translator for ALL visible text.

Use @healthcare/validation for forms.

Use @healthcare/types for:

- Patient
- Doctor
- Appointment
- Prescription
- Medical History

Use @healthcare/utils for common utilities.

Folder Structure:

apps/patient/

src/

├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ProfileMenu.tsx
│   ├── DoctorList.tsx
│   ├── AppointmentForm.tsx
│   ├── MedicalHistoryCard.tsx
│   ├── PrescriptionCard.tsx
│   ├── PatientProfileForm.tsx
│   └── ChangePasswordForm.tsx
│
├── pages/
│   ├── PatientPage.tsx
│   ├── MedicalHistoryPage.tsx
│   ├── PrescriptionPage.tsx
│   ├── AppointmentPage.tsx
│   └── ProfilePage.tsx
│
├── services/
│   ├── api.ts
│   ├── patientService.ts
│   ├── doctorService.ts
│   ├── medicalHistoryService.ts
│   ├── prescriptionService.ts
│   ├── appointmentService.ts
│   └── profileService.ts
│
├── store/
│   ├── index.ts
│   ├── hooks.ts
│   └── slices/
│       ├── patientSlice.ts
│       ├── doctorSlice.ts
│       ├── medicalHistorySlice.ts
│       ├── prescriptionSlice.ts
│       └── appointmentSlice.ts
│
├── routes/
│   └── appRoutes.tsx
│
├── types/
│   └── patient.ts
│
├── styles/
│   ├── global.css
│   ├── patient.css
│   ├── medical-history.css
│   ├── prescription.css
│   ├── appointment.css
│   └── profile.css
│
├── App.tsx
└── main.tsx

Also create:

- package.json
- tsconfig.json
- vite.config.ts
- .env.example

Requirements:

- React
- TypeScript
- Vite
- React Router
- Axios
- Redux Toolkit
- React Redux
- Shared UI
- Shared Theme
- Shared Translator
- Shared Validation

Constraints:

- Functional components only.
- Associate-level code.
- Simple code.
- Plain CSS.
- Reusable components.
- No placeholders.
- No dummy data.
- No hardcoded API data.
- No unnecessary libraries.
- Avoid any.
- Handle loading and errors.
- Responsive UI.

Important:

First check the existing Turborepo and @healthcare packages.

Reuse existing:

- UI
- Theme
- Translator
- Validation
- Types
- Utils
- JWT Authentication

Do not create duplicate functionality.

Do not modify other applications.

Only create the Patient Module inside:

apps/patient

Output:

Generate:

- Complete folder structure
- All source code
- Pages
- Components
- Redux Toolkit
- API services
- Routing
- Protected routes
- Patient role protection
- Patient profile editing
- Change password
- Language change
- Medical History
- Prescription
- Doctor search
- Doctor filter
- Doctor selection
- Appointment booking
- Logout
- package.json
- tsconfig.json
- vite.config.ts
- .env.example
- Plain CSS

Finally, explain every file in simple language.
```
