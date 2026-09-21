from api_client import DemoApiClient


def test_health_error_response_is_explicit() -> None:
    response = DemoApiClient().get_health_error()

    assert response["status"] == "error"
