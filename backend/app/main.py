"""FastAPI app exposing tic-tac-toe game logic and an optional AI opponent."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from .game import (
    Board,
    apply_move,
    best_move,
    empty_board,
    evaluate,
    other,
)

app = FastAPI(title="Tic Tac Toe API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BoardModel(BaseModel):
    board: list[str] = Field(..., min_length=9, max_length=9)

    @field_validator("board")
    @classmethod
    def _check_cells(cls, value: list[str]) -> list[str]:
        for cell in value:
            if cell not in ("", "X", "O"):
                raise ValueError(f"invalid cell value: {cell!r}")
        return value


class MoveRequest(BoardModel):
    index: int = Field(..., ge=0, le=8)
    player: str = Field(..., pattern="^[XO]$")


class AIRequest(BoardModel):
    player: str = Field("O", pattern="^[XO]$")


class GameStateResponse(BaseModel):
    board: list[str]
    winner: str | None
    line: list[int] | None
    is_draw: bool
    is_over: bool
    next_player: str | None


def _state_response(board: Board, last_player: str | None = None) -> GameStateResponse:
    status = evaluate(board)
    next_player: str | None
    if status.is_over:
        next_player = None
    elif last_player is not None:
        next_player = other(last_player)
    else:
        x_count = sum(1 for c in board if c == "X")
        o_count = sum(1 for c in board if c == "O")
        next_player = "X" if x_count == o_count else "O"
    return GameStateResponse(
        board=board,
        winner=status.winner,
        line=list(status.line) if status.line else None,
        is_draw=status.is_draw,
        is_over=status.is_over,
        next_player=next_player,
    )


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/new", response_model=GameStateResponse)
def new_game() -> GameStateResponse:
    return _state_response(empty_board())


@app.post("/api/move", response_model=GameStateResponse)
def move(req: MoveRequest) -> GameStateResponse:
    status = evaluate(req.board)
    if status.is_over:
        raise HTTPException(status_code=400, detail="game is already over")
    try:
        new_board = apply_move(req.board, req.index, req.player)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _state_response(new_board, last_player=req.player)


@app.post("/api/ai-move", response_model=GameStateResponse)
def ai_move(req: AIRequest) -> GameStateResponse:
    status = evaluate(req.board)
    if status.is_over:
        raise HTTPException(status_code=400, detail="game is already over")
    try:
        idx = best_move(req.board, req.player)
        new_board = apply_move(req.board, idx, req.player)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _state_response(new_board, last_player=req.player)
