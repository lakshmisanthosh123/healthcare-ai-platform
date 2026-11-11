# Healthcare backend

The backend uses Django for accounts/admin and database models, FastAPI for
healthcare APIs, PostgreSQL (or SQLite for learning), and a separate MCP server
for VS Code health-check tools.

The beginner guide includes installation, Windows PowerShell run commands,
database setup, test instructions, an explanation of each framework, and the
learning order:

- [Backend learning guide](LEARNING_GUIDE.md)

## Current API areas

- Django: health, register/login, profile, logout, OTP password reset, admin users,
  doctors, staff, roles, settings, and audit log endpoints.
- FastAPI: doctor and patient profiles, staff, appointments, medical history,
  prescriptions, dashboard analytics, health, and token inspection.
- MCP: read-only Django and FastAPI health checks configured in
  [`.vscode/mcp.json`](../.vscode/mcp.json).

## Dashboard database and Power BI

The analytics API reads the Django healthcare models from the database selected
by `backend/django/config/settings.py`. The `pnpm dev` launcher uses SQLite for
local development when no PostgreSQL connection variable is set. To use
PostgreSQL, set `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`
in the environment before starting the services. The launcher passes these
settings to Django and FastAPI; database credentials must not be committed.

The dashboard's Power BI embed endpoint is
`GET /dashboard/powerbi/embed-config`. It is restricted to admin and staff
users and obtains a short-lived embed token on the server. Configure these
server-only environment variables before starting FastAPI:

- `POWERBI_TENANT_ID`
- `POWERBI_CLIENT_ID`
- `POWERBI_CLIENT_SECRET`
- `POWERBI_WORKSPACE_ID`
- `POWERBI_REPORT_ID`

The Entra application must be authorized for the Power BI REST API and have
access to the workspace/report. Configure the Power BI semantic model to read
from the same PostgreSQL source as the application; Power BI Service may
require a gateway and separately configured data-source credentials. Never
expose the client secret through a `VITE_` variable or commit it to source
control. Missing Power BI settings cause the embed endpoint to return a clear
configuration error while the database-backed React analytics remain usable.

Run the integration tests with:

```powershell
$env:DJANGO_SQLITE_NAME = ":memory:"
.\.venv\Scripts\python.exe backend\django\manage.py test config
Remove-Item Env:\DJANGO_SQLITE_NAME
```

Use fake data only. This learning project is not intended for protected health
information or production deployment without a security and privacy review.
