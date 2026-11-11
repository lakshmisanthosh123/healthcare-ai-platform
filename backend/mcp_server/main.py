import asyncio
import json
from urllib.error import URLError
from urllib.request import urlopen

from mcp.server.fastmcp import FastMCP


mcp = FastMCP("Healthcare Platform")


def _read_health(url: str) -> dict[str, str]:
    try:
        with urlopen(url, timeout=3) as response:
            result = json.load(response)
    except (TimeoutError, URLError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Health check failed for {url}: {error}") from error

    if not isinstance(result, dict) or result.get("status") != "ok":
        raise RuntimeError(f"Unexpected health response from {url}.")
    return result


@mcp.tool()
async def check_django_health() -> dict[str, str]:
    """Check whether the local Django service is responding."""
    return await asyncio.to_thread(_read_health, "http://localhost:8001/health")


@mcp.tool()
async def check_fastapi_health() -> dict[str, str]:
    """Check whether the local FastAPI service is responding."""
    return await asyncio.to_thread(_read_health, "http://localhost:8000/health")


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
