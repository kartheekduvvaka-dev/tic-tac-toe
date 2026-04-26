"""Pure game logic for Tic Tac Toe.

The board is a list of 9 cells indexed 0-8 in row-major order:

    0 | 1 | 2
   ---+---+---
    3 | 4 | 5
   ---+---+---
    6 | 7 | 8

Each cell is either "X", "O", or "" (empty).
"""

from __future__ import annotations

import math
from dataclasses import dataclass

Player = str  # "X" or "O"
Board = list[str]

WINNING_LINES: tuple[tuple[int, int, int], ...] = (
    (0, 1, 2), (3, 4, 5), (6, 7, 8),  # rows
    (0, 3, 6), (1, 4, 7), (2, 5, 8),  # cols
    (0, 4, 8), (2, 4, 6),             # diagonals
)


@dataclass(frozen=True)
class GameStatus:
    winner: Player | None  # "X", "O", or None
    line: tuple[int, int, int] | None  # winning line indices, if any
    is_draw: bool

    @property
    def is_over(self) -> bool:
        return self.winner is not None or self.is_draw


def empty_board() -> Board:
    return [""] * 9


def evaluate(board: Board) -> GameStatus:
    for a, b, c in WINNING_LINES:
        if board[a] and board[a] == board[b] == board[c]:
            return GameStatus(winner=board[a], line=(a, b, c), is_draw=False)
    if all(cell for cell in board):
        return GameStatus(winner=None, line=None, is_draw=True)
    return GameStatus(winner=None, line=None, is_draw=False)


def apply_move(board: Board, index: int, player: Player) -> Board:
    if not (0 <= index < 9):
        raise ValueError(f"index {index} out of range")
    if player not in ("X", "O"):
        raise ValueError(f"invalid player {player!r}")
    if board[index]:
        raise ValueError(f"cell {index} is already taken")
    new_board = list(board)
    new_board[index] = player
    return new_board


def other(player: Player) -> Player:
    return "O" if player == "X" else "X"


def best_move(board: Board, player: Player) -> int:
    """Return the optimal move index for `player` using minimax.

    Falls back to the first empty cell if the board is already terminal.
    """
    status = evaluate(board)
    if status.is_over:
        raise ValueError("game is already over")

    best_score = -math.inf
    best_index = -1
    for i in range(9):
        if board[i]:
            continue
        score = _minimax(apply_move(board, i, player), other(player), player, depth=1)
        if score > best_score:
            best_score = score
            best_index = i
    return best_index


def _minimax(board: Board, to_move: Player, ai: Player, depth: int) -> float:
    status = evaluate(board)
    if status.winner == ai:
        return 10 - depth
    if status.winner == other(ai):
        return depth - 10
    if status.is_draw:
        return 0

    if to_move == ai:
        best = -math.inf
        for i in range(9):
            if board[i]:
                continue
            score = _minimax(apply_move(board, i, to_move), other(to_move), ai, depth + 1)
            best = max(best, score)
        return best
    else:
        best = math.inf
        for i in range(9):
            if board[i]:
                continue
            score = _minimax(apply_move(board, i, to_move), other(to_move), ai, depth + 1)
            best = min(best, score)
        return best
