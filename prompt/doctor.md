```text
Role:
You are a Senior React and TypeScript Developer.

Context:
I am building a Healthcare AI Platform using React, TypeScript, Vite, pnpm, and Turborepo with Microfrontend architecture.

Task:
Create the Doctor Module.

Application Location:
apps/doctor

Create these pages:

1. Doctor List
2. Patients List
3. Prescription
4. Schedule
5. Profile

Doctor List:

- Show doctors in a table.
- Add Search at the top.
- Add Filter at the top.
- Search by doctor name, email, specialization, etc.
- Filter by specialization, department, status, etc.
- Add View and Edit actions if needed.

Patients List:

- Show patients in a table.
- Add Search at the top.
- Add Filter at the top.
- Search by patient name, email, phone, etc.
- Filter by status, gender, department, etc.
- Add View Patient Details.

Prescription:

- Doctor can select a patient.
- Doctor can create a prescription.
- Doctor can view prescriptions.
- Doctor can edit prescriptions.
- Doctor can delete prescriptions if the API allows it.

Prescription fields:

- Patient
- Medicine
- Dosage
- Duration
- Instructions
- Prescription Date

Schedule:

- Show doctor's appointments.
- When the page opens, show today's appointments first.
- Show today's date as the selected date.
- Allow doctor to select another date.
- When the date changes, show appointments for that selected date.
- Do not show appointments from other dates.

Example:

Today:
→ Show today's appointments.

Select Monday:
→ Show Monday's appointments.

Select Tuesday:
→ Show Tuesday's appointments.

Appointment information:

- Time
- Patient name
- Reason
- Status
- Appointment details

Profile:

Add a Profile button in the top header.

When the doctor clicks Profile, show:

- Doctor Details
- Edit Profile
- Change Password
- Change Language
- Logout

Doctor Details:

Show:

- Name
- Email
- Phone
- Specialization
- Qualification
- Experience
- Department
- License Number

Edit Doctor Details:

- Doctor can edit their profile.
- Load existing doctor information.
- Show the information in a form.
- Validate the form.
- Save changes using API.
- Update Redux after successful update.
- Show success and error messages.

Change Password:

Create a Change Password form.

Fields:

- Current Password
- New Password
- Confirm New Password

Requirements:

- Validate all fields.
- New password and confirm password must match.
- Show success message.
- Show error message.
- Never store passwords in Redux or localStorage.

Language:

Use:

@healthcare/translator

Add a language selector inside the Profile menu.

When the doctor changes language:

- Change the application language.
- Update all visible text.
- Save the selected language if supported by the translator package.

Logout:

Add Logout in the Profile menu.

When logout is clicked:

- Clear Redux data.
- Clear authentication data.
- Clear required localStorage data.
- Redirect to Login/Auth module.

Shared Packages:

Use:

- @healthcare/ui
- @healthcare/theme
- @healthcare/translator
- @healthcare/validation
- @healthcare/types
- @healthcare/utils

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

Redux Toolkit:

Create Redux Toolkit store.

Create slices for:

- Doctor
- Patients
- Appointments
- Prescriptions

Use:

- configureStore
- createSlice
- createAsyncThunk

Redux should manage:

- Doctor information
- Patient list
- Doctor list
- Appointments
- Selected appointment date
- Prescriptions
- Loading
- Errors

API Services:

Create Axios API services for:

Doctor:

- Get doctors
- Get doctor details
- Update doctor details

Patients:

- Get patients
- Get patient details

Appointments:

- Get appointments
- Get appointments by selected date
- Get appointment details
- Update appointment status if API supports it

Prescription:

- Get prescriptions
- Get prescription details
- Create prescription
- Update prescription
- Delete prescription if API supports it

Profile:

- Get doctor profile
- Update doctor profile
- Change password

Use:

VITE_API_BASE_URL

Do not hardcode the API URL.

Authentication:

Use the existing Auth module and JWT authentication.

Do not create another authentication system.

Only authenticated users with:

role = "doctor"

can access the Doctor module.

If the user is not a doctor:

patient → Patient Module
doctor → Doctor Module
admin → Admin Module

Protected Routes:

Protect all Doctor module pages.

Doctor-only pages:

- /doctors
- /patients
- /prescriptions
- /schedule
- /profile

If the user is not authenticated:

→ Redirect to Login.

If the user is authenticated but is not a doctor:

→ Redirect to the correct module based on their role.

Routing:

Create:

- /
- /doctors
- /patients
- /prescriptions
- /schedule
- /profile


UI:

Use @healthcare/ui for reusable components.



Do not create duplicate components if they already exist.

T

Translator:

Use @healthcare/translator for all text.

Validation:

Use @healthcare/validation for:

- Doctor profile
- Change password
- Prescription
- Other forms

Types:

Use @healthcare/types for:

- Doctor
- Patient
- Appointment
- Prescription
- User

Do not create duplicate types if they already exist.

Constraints:

- Functional components only.
- Associate-level code.
- Plain CSS.
- Reusable components.
- No placeholders.
- No dummy data.
- No hardcoded API data.
- No unnecessary libraries.
- No duplicate shared functionality.
- Use TypeScript.
- Avoid any.
- Handle loading states.
- Handle error states.
- Responsive UI.
- Clean and simple code.

Important:

Before creating files:

1. Check the existing Turborepo structure.
2. Check apps/doctor.
3. Check existing @healthcare packages.
4. Reuse existing UI components.
5. Reuse existing theme.
6. Reuse existing translator.
7. Reuse existing validation.
8. Reuse existing types.
9. Reuse existing JWT authentication.
10. Reuse existing API configuration.

Do not modify unrelated applications.

Only create/update the Doctor module:

apps/doctor

Output:

Generate the complete folder structure and all required source code.

Include:

- Pages
- Components
- Redux Toolkit
- Redux slices
- Axios API
- API services
- Routing
- Protected routes
- Doctor role protection
- Search
- Filters
- Date-based appointments
- Prescription
- Doctor profile editing
- Change password
- Language change
- Logout
- package.json
- tsconfig.json
- vite.config.ts
- .env.example
- CSS
```
