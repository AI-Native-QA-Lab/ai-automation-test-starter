from api_client import DemoApiClient


def test_health_response_proves_service_is_ready() -> None:
    response = DemoApiClient().get_health()

    assert response["status"] == "ok"
    assert response["service"] == "pytest-api-starter"
