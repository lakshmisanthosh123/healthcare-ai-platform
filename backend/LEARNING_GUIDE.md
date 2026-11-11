# Healthcare Backend: Beginner Setup and Learning Path

This project connects Django, FastAPI, PostgreSQL, a React frontend, and a VS Code
MCP server. Work through one step at a time. Use fake information only; this is a
local learning project, not a system for real patient records.

## What each part does

```text
Browser -> Django (accounts, login, admin) ---------+
Browser -> FastAPI (healthcare APIs) ---------------+-> shared Django ORM database
VS Code -> MCP server (approved AI tools) -> health endpoints
```

- **Django** handles users, password hashing, registration, login, password reset,
  permissions for admin endpoints, and the Django admin interface.
- **FastAPI** handles doctor, patient, staff, appointment, medical-history,
  prescription, and dashboard HTTP APIs. It verifies the access token Django
  issued before serving protected requests.
- **Django ORM** defines and migrates the shared database models. FastAPI uses
  those same models so both services read and write the same records.
- **PostgreSQL** is the recommended shared database. SQLite can be used to learn
  locally without setting a PostgreSQL password.
- **MCP** lets VS Code discover and call specific tools. The current MCP tools
  only check whether Django and FastAPI are healthy; they do not read patient data.
- **React frontend** runs separately and calls Django on port 8001 and FastAPI on
  port 8000.

## Step 1: Install/check prerequisites

Install Python 3.12+, Node.js, and pnpm. PostgreSQL is optional for the first
SQLite learning run. Open a PowerShell terminal in the project root:

```powershell
py --version
node --version
pnpm --version
```

If a command is not found, install that tool and restart VS Code.

## Step 2: Create the Python environment and install packages

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\django\requirements.txt
.\.venv\Scripts\python.exe -m pip install -r backend\fastapi\requirements.txt
.\.venv\Scripts\python.exe -m pip install -r backend\mcp_server\requirements.txt
.\.venv\Scripts\python.exe -m pip check
```

A **virtual environment** keeps this project's Python packages separate from
other projects. The requirements files list what each backend process needs.

## Step 3: Prepare the local database and demo accounts

The `pnpm dev` workflow in Step 5 migrates the local SQLite database
automatically. To add fake staff, doctor, patient, and admin accounts, run this
from the project root:

```powershell
$env:DJANGO_SQLITE_NAME = "backend\django\learning.sqlite3"
.\.venv\Scripts\python.exe backend\django\manage.py check
.\.venv\Scripts\python.exe backend\django\manage.py migrate
.\.venv\Scripts\python.exe backend\django\manage.py seed_demo_data
```

`manage.py` is Django's command-line entry point. `check` validates project
configuration, `migrate` creates tables, and `seed_demo_data` creates repeatable
fake role accounts.

Demo login: `admin@example.com`, `doctor@example.com`, `patient@example.com`, or
`staff@example.com`; password: `DemoPass123!`. Set
`$env:DEMO_ACCOUNT_PASSWORD` before seeding to choose another password.

Try [Django health](http://localhost:8001/health) and
[Django admin](http://localhost:8001/admin/). The root URL `/` is not a homepage.

## Step 4: Optional manual backend startup

Skip this step when using the one-command startup in Step 5. To start the APIs
manually, use separate PowerShell terminals in the project root and set the
**same database setting** in each:

```powershell
$env:DJANGO_SQLITE_NAME = "backend\django\learning.sqlite3"
.\.venv\Scripts\python.exe backend\django\manage.py runserver 8001
```

```powershell
$env:DJANGO_SQLITE_NAME = "backend\django\learning.sqlite3"
.\.venv\Scripts\python.exe -m uvicorn backend.fastapi.main:app --reload --port 8000
```

Visit [Django health](http://localhost:8001/health),
[FastAPI health](http://localhost:8000/health), or
[interactive API docs](http://localhost:8000/docs).

## Step 5: Start the application

From the project root, run:

```powershell
pnpm dev
```

This starts Django on port 8001, FastAPI on port 8000, and the frontends. The
frontends use ports 3000–3006 when available; if those ports are occupied, the
startup script selects the next available block of seven ports and wires the
module URLs together. Set `$env:HEALTHCARE_PORT_BASE` to choose a specific
available starting port. The script prints the URLs. Do not start the APIs
manually in Step 4 at the same time. It runs database migrations before
starting. The shell uses Vite's development server; federated app modules are
built and served with Vite preview, with builds refreshed when their source
files change. If no PostgreSQL environment variables are set, it uses
`backend\django\learning.sqlite3`; set `DJANGO_SQLITE_NAME` or your PostgreSQL
environment variables to select a different database. Python dependencies must
already be installed as described in Step 2. Stop all servers with Ctrl+C.

If the frontend apps are already running in separate terminals, start only the
APIs with `pnpm dev:backend` instead.

Open [http://localhost:3000](http://localhost:3000). Patients can create an
account and sign in. Staff and doctor accounts must be created by an
administrator (or by running the demo seed command in Step 3); they sign in
through the same login page.

## Step 6: Understand authentication across both frameworks

1. The frontend sends an email and password to Django's `POST /auth/login`.
2. Django checks the password hash and signs a time-limited JWT (JSON Web Token).
3. The frontend sends `Authorization: Bearer <token>` with FastAPI requests.
4. FastAPI verifies the token's signature, expiration, and role before returning
   protected data.

The shared signing secret is `SECRET_KEY`. For local use, both processes have a
development default. If you set a custom value, set the same secret in Django and
FastAPI. Never commit a production secret.

Try `GET /auth/me` in FastAPI docs without authorization; it should return HTTP 401. Select **Authorize**, enter a valid Django token, and try again.

## Step 7: Password recovery and email

The OTP flow stores only a hashed, expiring code, limits attempts, requires
verification before resetting, and consumes the code after reset. By default,
Django prints development emails (including the OTP) to the Django terminal. Do
not use this mode for real accounts.

For an SMTP provider, configure these environment variables before starting
Django: `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`,
`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`,
`EMAIL_USE_TLS`, and `DEFAULT_FROM_EMAIL`. Keep mail credentials private.

## Step 8: Connect MCP in VS Code

The server configuration is [.vscode/mcp.json](../.vscode/mcp.json). VS Code
starts `backend.mcp_server.main` as a stdio process; stdio is a process input and
output channel, not another HTTP port. Start `healthcare-platform` using VS Code's
MCP controls.

Its read-only tools are:

- `check_django_health`
- `check_fastapi_health`

They call the two `/health` endpoints. MCP is an AI integration interface, not a
replacement for either API, and it currently does not expose clinical records.

## Step 9: Learn the code in order

1. [Django manage.py](django/manage.py) — how a command starts Django.
2. [Django settings](django/config/settings.py) — installed apps, database, CORS,
   password validation, email, and file storage settings.
3. [Django models](django/healthcare/models.py) — the shared data structures.
4. [Django migrations](django/healthcare/migrations) — versioned database schema.
5. [Django URLs](django/config/urls.py) and [Django API](django/config/api.py) —
   route matching, authentication, user creation, OTP, and admin endpoints.
6. [FastAPI main](fastapi/main.py) — application setup and route registration.
7. [FastAPI auth](fastapi/auth.py) — token verification and role checks.
8. [FastAPI APIs](fastapi/routers) — each healthcare feature and dashboard.
9. [MCP server](mcp_server/main.py) — registering tools for VS Code.
10. [Integration tests](django/config/tests.py) — proof that requests work across
    frameworks.

Key terms: a **request** is what a client sends; a **response** is what the
server returns; an **endpoint** is an HTTP method plus a URL; **authentication**
checks identity; **authorization** checks permission; a **migration** changes a
database schema; **dependency injection** lets FastAPI reuse checks such as
authentication.

## Step 10: Run tests

The test runner uses an in-memory SQLite database:

```powershell
$env:DJANGO_SQLITE_NAME = ":memory:"
.\.venv\Scripts\python.exe backend\django\manage.py test config
Remove-Item Env:\DJANGO_SQLITE_NAME
```

Tests cover health checks, account registration and login, OTP password reset,
role restrictions, appointment booking, admin/dashboard responses, demo data,
file attachments, and prescription PDF export.

## Use PostgreSQL instead of SQLite

If PostgreSQL is installed in its default Windows location, open PowerShell and
create the database once (skip this if it already exists):

```powershell
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
& $psql -U postgres -d postgres -W -c "CREATE DATABASE healthcare_platform;"
```

Enter the PostgreSQL password when prompted. If your PostgreSQL version is not
18 or it is installed elsewhere, change the executable path to match. The VS
Code backend tasks use these defaults and prompt for the password without
echoing it or saving it in the project:

```powershell
Terminal > Run Task > Healthcare: Inspect PostgreSQL
```

Inspect the connection and existing tables first. If the Django tables do not
exist, run `Terminal > Run Task > Healthcare: Apply database migrations` once.
Do not run `seed_demo_data` unless you specifically want the fake learning
accounts and sample appointment inserted into this database. Start the Django
and FastAPI tasks from the same menu; each prompts for the PostgreSQL password
unless `PGPASSWORD` is already available to VS Code. Both services use the same
PostgreSQL database.

## Current project limitations

- The local development servers, demo password, development secret, and console
  email are not production security settings.
- Uploaded avatars and medical attachments are stored on local disk. Production
  deployments need private object storage, backups, access controls, and HTTPS.
- Analytics are database summaries; the demo contains very few records.
- This project is for learning with fake data. Do not use real patient information.
