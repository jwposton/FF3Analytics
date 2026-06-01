"""Tests for GET /health (D-05 presence-only booleans)."""

import json
import os

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(monkeypatch):
    monkeypatch.delenv("FIREFLY_BASE_URL", raising=False)
    monkeypatch.delenv("FIREFLY_API_TOKEN", raising=False)
    from main import app

    return TestClient(app)


def test_health_status_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_health_env_presence_booleans_unset(client):
    response = client.get("/health")
    data = response.json()
    assert data["firefly_base_url_configured"] is False
    assert data["firefly_api_token_configured"] is False


def test_health_env_presence_booleans_set(monkeypatch):
    monkeypatch.setenv("FIREFLY_BASE_URL", "https://firefly.example/")
    monkeypatch.setenv("FIREFLY_API_TOKEN", "secret-token")
    from main import app

    response = TestClient(app).get("/health")
    data = response.json()
    assert data["firefly_base_url_configured"] is True
    assert data["firefly_api_token_configured"] is True


def test_health_does_not_leak_secrets(client, monkeypatch):
    monkeypatch.setenv("FIREFLY_BASE_URL", "https://firefly.example/")
    monkeypatch.setenv("FIREFLY_API_TOKEN", "secret-token")
    from main import app

    response = TestClient(app).get("/health")
    body = json.dumps(response.json())
    assert "secret-token" not in body
    assert "https://firefly.example" not in body
    assert "firefly_base_url" not in response.json()
    assert "firefly_api_token" not in response.json()
    assert "FIREFLY_API_TOKEN" not in body
