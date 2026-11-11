Role:
You are a Senior React and TypeScript Software Engineer.

Context:
I am building a Healthcare AI Platform using React, TypeScript, Vite, pnpm, and Turborepo with a Microfrontend architecture.

Task:
Create the Auth module.

Application Location:
apps/auth

Create the following pages:

- Login
- Register
- Forgot Password
- Reset Password
- OTP Verification
- Profile

Use the shared packages:

- @healthcare/ui
- @healthcare/theme
- @healthcare/translator
- @healthcare/validation
- @healthcare/types
- @healthcare/utils

Requirements:

- React
- TypeScript
- React Router
- Axios
- Redux Toolkit
- JWT Authentication
- Shared UI
- Shared Theme
- Shared Translator
- Shared Validation
- Functional components only
- Plain CSS
- Reusable components
- No placeholders

Authentication:

- Implement Login using Axios.
- After successful login, receive the JWT token.
- Store the JWT token using Redux Toolkit.
- Store the token in localStorage.
- Add JWT token automatically to Axios Authorization header.
- After login, call the user API to get the logged-in user's data.
- Store the user data in Redux Toolkit.
- Persist authentication after page refresh.
- Implement Logout.
- Clear JWT token and user data on logout.

User Data:

After login or registration, get the authenticated user data.

Example:

{
id: 1,
name: "John",
email: "john@gmail.com",
role: "patient"
}

The user role can be:

- patient
- doctor
- admin

Role Based Navigation:

If user role is:

patient
→ navigate to Patient module

doctor
→ navigate to Doctor module

admin
→ navigate to Admin module

Use the existing Microfrontend URLs/configuration from the project.

Do not hardcode URLs if they are already configured in the project.

Registration:

- Only Patient users can register.
- Do not provide Doctor registration.
- Do not provide Admin registration.
- Registration should always use role = "patient".
- After successful registration, get the user data.
- If the user is a patient, navigate to the Patient module.

Security:

- Frontend must not allow Doctor or Admin registration.
- Backend must also validate that public registration is only for patients.
- Protect authenticated routes.
- If JWT is missing or invalid, redirect to Login.
- Handle 401 Unauthorized responses.
- Clear authentication when JWT expires or becomes invalid.

Redux Toolkit:

Create:

- Redux store
- Auth slice
- Auth actions
- Login thunk
- Register thunk
- Get current user thunk
- Logout action

Auth state should contain:

- accessToken
- user
- isAuthenticated
- loading
- error

API Services:

Create reusable Axios API services for:

- Login
- Register
- Forgot Password
- Reset Password
- OTP Verification
- Resend OTP
- Get Current User
- Logout

Use Axios interceptors to attach:

Authorization: Bearer <JWT>

Routing:

Create routes for:

- /
- /login
- /register
- /forgot-password
- /reset-password
- /otp
- /profile

Redirect:

- / → /login
- Unauthenticated user → /login
- Authenticated user → appropriate module based on role

Profile:

- Display logged-in user data from Redux.
- Show name.
- Show email.
- Show role.
- Add Logout button.

Folder Structure:

Create a clean folder structure inside:

apps/auth

Include:

- pages
- components
- services
- store
- routes
- utils
- types
- styles

Output Format:

Generate:

- Complete folder structure
- All source code
- Routing
- Redux Toolkit
- JWT authentication
- Axios configuration
- API services
- Role-based navigation
- Protected routes
- package.json
- tsconfig.json
- vite.config.ts
- .env.example
- Plain CSS
- Explain every file

Important:

First inspect the existing Turborepo structure and shared @healthcare packages.

Reuse existing components, types, theme, validation, translator, and utilities.

Do not create duplicate shared functionality.

Do not modify unrelated applications.

Only implement the Auth module inside:

apps/auth

```

```
