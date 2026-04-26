from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_new_game():
    r = client.get("/api/new")
    assert r.status_code == 200
    data = r.json()
    assert data["board"] == [""] * 9
    assert data["next_player"] == "X"
    assert data["is_over"] is False


def test_move_then_ai_move():
    r = client.post(
        "/api/move",
        json={"board": [""] * 9, "index": 4, "player": "X"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["board"][4] == "X"
    assert data["next_player"] == "O"

    r2 = client.post("/api/ai-move", json={"board": data["board"], "player": "O"})
    assert r2.status_code == 200
    after = r2.json()
    assert after["board"].count("O") == 1
    assert after["next_player"] == "X"


def test_invalid_move_rejected():
    r = client.post(
        "/api/move",
        json={"board": ["X"] + [""] * 8, "index": 0, "player": "O"},
    )
    assert r.status_code == 400
