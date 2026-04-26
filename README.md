# Tic Tac Toe

A Tic Tac Toe game with a Python (FastAPI) backend and a React + CSS frontend.

- **Backend** validates moves, detects winners, and serves an unbeatable AI opponent (minimax).
- **Frontend** is a small Vite + React app with a polished CSS UI. It calls the backend over HTTP and falls back to a local minimax implementation if the API is unreachable.

## Project layout

```
backend/    FastAPI app + game logic + tests
frontend/   Vite + React app (HTML/CSS/JSX)
```

## Running locally

### Backend

Requires Python 3.10+.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

Endpoints:

- `GET  /api/health` — health check
- `GET  /api/new` — return an empty board
- `POST /api/move` — apply a human move (`{ board, index, player }`)
- `POST /api/ai-move` — let the AI play the next move (`{ board, player }`)

### Frontend

Requires Node 18+.

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on http://localhost:5173 and proxies `/api/*` to `http://localhost:8000`.

For a production build:

```bash
npm run build
npm run preview
```

## Tests & lint

```bash
# Backend
cd backend
.venv/bin/pytest
.venv/bin/ruff check .

# Frontend
cd frontend
npm run lint
npm run build
```

## Game modes

- **You (X) vs AI (O)** — the AI uses minimax and never loses.
- **Two players** — local hot-seat play on the same board.
