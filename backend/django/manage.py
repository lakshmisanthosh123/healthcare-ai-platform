import os
import sys
from pathlib import Path


if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    project_root = Path(__file__).resolve().parents[2]
    sys.path.insert(0, str(project_root))
    sys.path.insert(1, str(project_root / "backend" / "django"))

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
