Role:
You are a Senior React and TypeScript Software Engineer.

Context:
I am building a Healthcare AI Platform using React, TypeScript, Vite, pnpm, and Turborepo with a Microfrontend architecture.

Task:
Create the shell module
Application Location

apps/shell

The Shell should:
The Shell is the Host application.

The Shell must contain only:

- Navbar
- Sidebar
- Header
- Footer
- Main Layout
- Routing
- Authentication Guard
- Lazy Loading
- Error Boundary
- Loading Component
- Not Found Page

The Shell must NOT contain business logic.

The Shell loads the following remote applications:

- Auth
- Dashboard
- Patient
- Doctor
- Admin
  take sidebar navnar mainlayout footder from resuseable component
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
- Shared UI
- Shared Theme
- Shared Translator
- Shared Validation

Constraints:

- Functional components only.
- Associate-level code.
- Plain CSS.
- Reusable components.
- No placeholders.

Output Format:
Generate the complete folder structure, all source code, routing, API services, package.json, tsconfig.json, and explain every file.
