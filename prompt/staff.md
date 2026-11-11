================================================== 2. TECHNOLOGY STACK
==================================================

1. Frontend:
   - React.js 19
   - TypeScript
   - JavaScript (ES6+)
   - React Router

2. State Management:
   - Zustand
   - TanStack React Query

3. API & Forms:
   - Axios
   - REST API Integration
   - React Hook Form
   - Zod

4. Shared Packages:

   - @healthcare/ui
   - @healthcare/theme
   - @healthcare/translator
   - @healthcare/validation
   - @healthcare/types
   - @healthcare/utils

================================================== 3. STATE MANAGEMENT ARCHITECTURE
==================================================

Use Zustand for global client-side state.

Use TanStack React Query for server-side state.

ZUSTAND:

Manage:

- Selected staff member (if needed globally)
- Search and filter UI state
- Sidebar state
- Modal visibility
- Profile menu state
- Other shared UI state

TANSTACK REACT QUERY:

Manage:

- Staff list
- Staff details
- Staff profile
- Staff dashboard statistics
- API loading states
- API error states
- Server-side caching
- Mutations
- Query invalidation

Use:

- useQuery
- useMutation
- useQueryClient

After successful mutations:

- Invalidate relevant queries.
- Refresh staff lists when necessary.
- Update cached staff details when appropriate.

Do not duplicate server data in Zustand.

================================================== 4. API SERVICES
==================================================

Use Axios for REST API communication.

Requirements:

- Reuse the existing Axios instance.
- Reuse existing authentication interceptors.
- Use VITE_API_BASE_URL.
- Keep API services separate from components.
- Use TypeScript request and response types.
- Handle API errors properly.

Create services for:

- Staff
- Staff Profile
- Staff Dashboard

================================================== 5. FORM MANAGEMENT
==================================================

Use:

- React Hook Form
- Zod
- @healthcare/validation

Apply validation to:

- Add Staff
- Edit Staff
- Edit Profile
- Change Password

Requirements:

- Use zodResolver if available.
- Reuse existing shared validation schemas.
- Display field-level validation messages.
- Prevent duplicate submissions.
- Handle API validation errors.
