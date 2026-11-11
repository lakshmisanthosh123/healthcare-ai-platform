Yes. Here is the **simple version**, matching your Auth, Doctor, and Patient prompts, with **Redux Toolkit + complete translator + reusable delete confirmation popup + doctor creation + patient/doctor search/filter**.

```text
Role:
You are a Senior React and TypeScript Software Engineer.

Context:
I am building a Healthcare AI Platform using React, TypeScript, Vite, pnpm, and Turborepo with a Microfrontend architecture.

Task:
Create the Admin Module.

Application Location:
apps/admin

Create pages:

- Users
- Roles
- Permissions
- Settings
- Audit Logs

Users:

Create a Users page.

Show:

- All Patients
- All Doctors

Patient List:

- Show all patients in a table.
- Add Search at the top.
- Add Filter at the top.
- Search patients by name, email, phone, etc.
- Filter patients by status, gender, etc.
- Add Delete action.
- Add View action if required.

Doctor List:

- Show all doctors in a table.
- Add Search at the top.
- Add Filter at the top.
- Search doctors by name, email, specialization, etc.
- Filter doctors by specialization, department, status, etc.
- Add Create Doctor button.
- Add Edit action.
- Add Delete action.
- Add View action if required.

Create Doctor:

Admin should be able to create a doctor.

Doctor form:

- First Name
- Last Name
- Email
- Phone
- Specialization
- Qualification
- Experience
- Department
- License Number
- Status

Validate the form using:

@healthcare/validation

After creating the doctor:

- Save using API.
- Update Redux.
- Refresh doctor list.
- Show success message.

Delete:

When admin clicks Delete:

Show a reusable confirmation popup.

Example:

"Are you sure you want to delete this doctor?"

Buttons:

- Cancel
- Delete

Create the popup as a reusable component.

Use the same popup for:

- Delete Patient
- Delete Doctor
- Other delete actions

Do not create separate delete popup components for each page.

After delete:

- Call delete API.
- Update Redux.
- Remove item from the table.
- Show success/error message.

Search and Filter:

Place Search and Filter at the top of:

- Patient List
- Doctor List
- Users page

Search should work with the table data.

Filter should work with the table data.

Roles:

Create Roles page.

Show:

- Role name
- Description
- Status

Roles:

- Patient
- Doctor
- Admin

Allow admin to view roles.

Allow create/edit/delete only if the API supports it.

Permissions:

Create Permissions page.

Show:

- Permission name
- Description
- Module
- Status

Allow admin to view and manage permissions if API supports it.

Settings:

Create Settings page.

Include:

- Application settings
- Language
- User settings
- Other existing admin settings

Use:

@healthcare/translator

for language support.

Audit Logs:

Create Audit Logs page.

Show logs in a table.

Display:

- User
- Action
- Module
- Date
- Time
- Status

Add:

- Search
- Filter
- Date filter

Use API data.

Do not use dummy data.

Profile:

Add a Profile button in the top header.

Profile menu should contain:

- Profile
- Edit Profile
- Change Password
- Change Language
- Logout

Use the existing Admin authentication.

Translator:

Use:

@healthcare/translator

Use translator for ALL visible text.

Translate:

- Sidebar
- Header
- Buttons
- Tables
- Forms
- Labels
- Search
- Filters
- Delete popup
- Success messages
- Error messages
- Validation messages
- Settings
- Roles
- Permissions
- Audit Logs
- Profile
- Logout

Add language selector.

When language changes:

- Change complete application language.
- Update all visible text.
- Persist language if supported.

Do not create separate translation logic inside each page.

Redux Toolkit:

Use Redux Toolkit for Admin Module state.

Create:

- Admin slice
- Patient slice
- Doctor slice
- Role slice
- Permission slice
- Settings slice
- Audit Log slice

Use:

- configureStore
- createSlice
- createAsyncThunk

Redux should manage:

- Patients
- Doctors
- Roles
- Permissions
- Settings
- Audit Logs
- Loading
- Errors

Create async actions for:

- Get patients
- Delete patient
- Get doctors
- Create doctor
- Update doctor
- Delete doctor
- Get roles
- Get permissions
- Get settings
- Update settings
- Get audit logs

API:

Use Axios.

Create services:

- api.ts
- patientService.ts
- doctorService.ts
- roleService.ts
- permissionService.ts
- settingsService.ts
- auditLogService.ts

Use:

VITE_API_BASE_URL

Do not hardcode the API URL.

Authentication:

Use the existing Auth module and JWT authentication.

Do not create another authentication system.

Only authenticated users with:

role = admin

can access the Admin Module.

If user is not authenticated:

→ Redirect to Login.

If user is:

patient → Patient Module

doctor → Doctor Module

admin → Admin Module

Protected Routes:

Protect all Admin pages.

Admin pages:

- /users
- /roles
- /permissions
- /settings
- /audit-logs
- /profile

Only authenticated admin users can access these pages.

Shared Packages:

Use:

- @healthcare/ui
- @healthcare/theme
- @healthcare/translator
- @healthcare/validation
- @healthcare/types
- @healthcare/utils

UI:

Use @healthcare/ui for:

- Button
- Input
- Table
- Select
- Modal
- Dropdown
- Card
- Form
- Alert
- Confirmation Popup

Create reusable components for common functionality.

Especially create one reusable:

DeleteConfirmationModal

Use it for:

- Delete Patient
- Delete Doctor
- Delete Role if supported
- Delete Permission if supported

Theme:

Use:

@healthcare/theme

Use existing:

- Colors
- Typography
- Spacing
- Design system

Validation:

Use:

@healthcare/validation

for:

- Doctor form
- Settings form
- Other forms

Types:

Use:

@healthcare/types

for:

- User
- Patient
- Doctor
- Role
- Permission
- Audit Log

Do not create duplicate types if they already exist.

Utils:

Use:

@healthcare/utils

for common utilities.

Routing:

Create:

- /
- /users
- /roles
- /permissions
- /settings
- /audit-logs
- /profile

Default:

/ → /users

Folder Structure:

apps/admin/

src/

├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ProfileMenu.tsx
│   ├── SearchBar.tsx
│   ├── Filter.tsx
│   ├── DataTable.tsx
│   ├── DeleteConfirmationModal.tsx
│   ├── DoctorForm.tsx
│   └── PatientTable.tsx
│
├── pages/
│   ├── UsersPage.tsx
│   ├── RolesPage.tsx
│   ├── PermissionsPage.tsx
│   ├── SettingsPage.tsx
│   ├── AuditLogsPage.tsx
│   └── ProfilePage.tsx
│
├── services/
│   ├── api.ts
│   ├── patientService.ts
│   ├── doctorService.ts
│   ├── roleService.ts
│   ├── permissionService.ts
│   ├── settingsService.ts
│   └── auditLogService.ts
│
├── store/
│   ├── index.ts
│   ├── hooks.ts
│   └── slices/
│       ├── adminSlice.ts
│       ├── patientSlice.ts
│       ├── doctorSlice.ts
│       ├── roleSlice.ts
│       ├── permissionSlice.ts
│       ├── settingsSlice.ts
│       └── auditLogSlice.ts
│
├── routes/
│   └── appRoutes.tsx
│
├── types/
│   └── admin.ts
│
├── utils/
│   └── adminUtils.ts
│
├── styles/
│   ├── global.css
│   ├── header.css
│   ├── users.css
│   ├── roles.css
│   ├── permissions.css
│   ├── settings.css
│   ├── audit-logs.css
│   └── profile.css
│
├── App.tsx
└── main.tsx

Also create:

- index.html
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
- Handle loading.
- Handle errors.
- Responsive UI.

Important:

Before creating files:

1. Check the existing Turborepo structure.
2. Check apps/admin.
3. Check the existing Auth module.
4. Check existing JWT authentication.
5. Check @healthcare/ui.
6. Check @healthcare/theme.
7. Check @healthcare/translator.
8. Check @healthcare/validation.
9. Check @healthcare/types.
10. Check @healthcare/utils.
11. Reuse existing components and functionality.

Do not create duplicate:

- Authentication
- JWT
- UI components
- Theme
- Translator
- Validation
- Types
- Utils

Do not modify unrelated applications.

Only create the Admin Module inside:

apps/admin

Output:

Generate:

- Complete folder structure
- All source code
- Users
- Patient list
- Doctor list
- Create doctor
- Edit doctor
- Delete patient
- Delete doctor
- Search
- Filter
- Reusable delete confirmation popup
- Roles
- Permissions
- Settings
- Audit Logs
- Profile
- Change password
- Language change
- Complete translator integration
- Redux Toolkit
- Redux slices
- Axios
- API services
- Protected routes
- Admin role protection
- Logout
- package.json
- tsconfig.json
- vite.config.ts
- .env.example
- Plain CSS

Finally, explain every file in simple language.
```
