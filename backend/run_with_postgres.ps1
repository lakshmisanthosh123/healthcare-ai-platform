param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("django", "fastapi", "inspect", "migrate")]
    [string]$Service
)

$ErrorActionPreference = "Stop"

if (-not $env:PGHOST) { $env:PGHOST = "localhost" }
if (-not $env:PGPORT) { $env:PGPORT = "5432" }
if (-not $env:PGDATABASE) { $env:PGDATABASE = "healthcare_platform" }
if (-not $env:PGUSER) { $env:PGUSER = "postgres" }

Remove-Item Env:\DJANGO_SQLITE_NAME -ErrorAction SilentlyContinue

if (-not $env:PGPASSWORD) {
    $securePassword = Read-Host "PostgreSQL password for $env:PGUSER@$env:PGDATABASE" -AsSecureString
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    try {
        $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
        $securePassword.Dispose()
    }
}

try {
    switch ($Service) {
        "django" {
            & .\.venv\Scripts\python.exe backend\django\manage.py runserver 127.0.0.1:8001
        }
        "fastapi" {
            & .\.venv\Scripts\python.exe -m uvicorn backend.fastapi.main:app --reload --host 127.0.0.1 --port 8000
        }
        "inspect" {
            & .\.venv\Scripts\python.exe backend\django\manage.py shell -c "from django.db import connection; connection.ensure_connection(); print('Connected:', connection.vendor, connection.settings_dict['NAME']); print('Tables:', ', '.join(connection.introspection.table_names()))"
        }
        "migrate" {
            & .\.venv\Scripts\python.exe backend\django\manage.py migrate --noinput
        }
    }
    exit $LASTEXITCODE
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
