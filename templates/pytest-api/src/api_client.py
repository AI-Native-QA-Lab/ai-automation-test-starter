"""Small client-shaped seam for the deterministic local API fixture."""

import os

from demo_api import error_response, health_response


class DemoApiClient:
    """Expose native client methods without inventing a remote endpoint."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or os.getenv("API_BASE_URL") or "local://demo"

    def get_health(self) -> dict[str, str]:
        return health_response()

    def get_health_error(self) -> dict[str, str]:
        return error_response()
