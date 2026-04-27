import pytest


def test_register_success(client):
    resp = client.post("/auth/register", json={
        "email": "new@wasify.com",
        "password": "securePass1",
        "full_name": "New User",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "new@wasify.com"
    assert data["full_name"] == "New User"
    assert data["total_points"] == 0
    assert "hashed_password" not in data


def test_register_duplicate_email(client, registered_user):
    resp = client.post("/auth/register", json={
        "email": "test@wasify.com",
        "password": "anotherPass",
        "full_name": "Dupe User",
    })
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"]


def test_login_success(client, registered_user):
    resp = client.post("/auth/login", json={
        "email": "test@wasify.com",
        "password": "password123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, registered_user):
    resp = client.post("/auth/login", json={
        "email": "test@wasify.com",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


def test_login_wrong_email(client):
    resp = client.post("/auth/login", json={
        "email": "nobody@wasify.com",
        "password": "anypassword",
    })
    assert resp.status_code == 401


def test_get_me(client, auth_headers):
    resp = client.get("/users/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@wasify.com"
    assert "id" in data


def test_get_me_unauthorized(client):
    resp = client.get("/users/me")
    assert resp.status_code == 403  # No bearer token


def test_refresh_token(client, registered_user):
    login = client.post("/auth/login", json={
        "email": "test@wasify.com",
        "password": "password123",
    })
    refresh_token = login.json()["refresh_token"]

    resp = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_refresh_with_invalid_token(client):
    resp = client.post("/auth/refresh", json={"refresh_token": "not.a.real.token"})
    assert resp.status_code == 401
