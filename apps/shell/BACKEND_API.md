# Backend API connections

The frontend uses the real API servers in development and production builds. It does not include fixture-backed API responses.

| Frontend modules | Backend | Default URL |
|---|---|---|
| Auth, admin | Django | `http://localhost:8001` |
| Patient, doctor, staff, dashboard | FastAPI | `http://localhost:8000` |

Set the corresponding `VITE_API_URL`, `VITE_API_BASE_URL`, `VITE_DASHBOARD_API_URL`, and `VITE_AUTH_URL` values before building when using different hosts. API failures are shown in the affected screens instead of being replaced with sample values.

For fake local accounts and database records, run Django's `seed_demo_data` management command. See [the backend setup guide](../../backend/README.md).
