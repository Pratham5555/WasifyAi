import io
import pytest
from PIL import Image


def _make_image_bytes(color=(100, 150, 100)) -> bytes:
    """Create a minimal test image."""
    img = Image.new("RGB", (100, 100), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_list_detections_empty(client, auth_headers):
    resp = client.get("/detections", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_classify_image(client, auth_headers):
    image_bytes = _make_image_bytes(color=(60, 140, 60))  # green → organic
    resp = client.post(
        "/detections/classify",
        headers=auth_headers,
        files={"image": ("test.jpg", image_bytes, "image/jpeg")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "category" in data
    assert "confidence" in data
    assert "disposal_guide" in data
    assert "points_earned" in data
    assert data["points_earned"] > 0
    assert 0 < data["confidence"] <= 1.0


def test_classify_updates_user_points(client, auth_headers):
    image_bytes = _make_image_bytes()
    client.post(
        "/detections/classify",
        headers=auth_headers,
        files={"image": ("test.jpg", image_bytes, "image/jpeg")},
    )
    me = client.get("/users/me", headers=auth_headers).json()
    assert me["total_points"] > 0
    assert me["scan_count"] == 1


def test_create_detection_on_device(client, auth_headers):
    image_bytes = _make_image_bytes()
    resp = client.post(
        "/detections",
        headers=auth_headers,
        data={"category": "Plastic", "confidence": "0.88", "source": "on_device"},
        files={"image": ("test.jpg", image_bytes, "image/jpeg")},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["category"] == "Plastic"
    assert data["source"] == "on_device"
    assert data["points_earned"] == 10


def test_list_detections_after_scan(client, auth_headers):
    image_bytes = _make_image_bytes()
    client.post(
        "/detections/classify",
        headers=auth_headers,
        files={"image": ("test.jpg", image_bytes, "image/jpeg")},
    )
    resp = client.get("/detections", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_classify_invalid_file_type(client, auth_headers):
    resp = client.post(
        "/detections/classify",
        headers=auth_headers,
        files={"image": ("test.txt", b"not an image", "text/plain")},
    )
    assert resp.status_code == 400


def test_leaderboard(client, auth_headers):
    resp = client.get("/leaderboard", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["rank"] == 1
