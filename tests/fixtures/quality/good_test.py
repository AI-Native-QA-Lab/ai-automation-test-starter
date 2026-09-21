def test_service_status():
    response = {"status": "ok"}

    assert response["status"] == "ok"
