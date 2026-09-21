"""Deterministic local API-shaped fixture used to teach API assertions."""


def health_response() -> dict[str, str]:
    return {"service": "pytest-api-starter", "status": "ok"}


def error_response() -> dict[str, str]:
    return {"service": "pytest-api-starter", "status": "error"}
