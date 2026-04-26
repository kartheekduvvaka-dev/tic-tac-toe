// Mirror of the backend logic so the UI can play offline if the API is unreachable.

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function emptyBoard() {
  return Array(9).fill("");
}

export function evaluate(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line, isDraw: false, isOver: true };
    }
  }
  if (board.every((cell) => cell)) {
    return { winner: null, line: null, isDraw: true, isOver: true };
  }
  return { winner: null, line: null, isDraw: false, isOver: false };
}

export function nextPlayer(board) {
  const x = board.filter((c) => c === "X").length;
  const o = board.filter((c) => c === "O").length;
  return x === o ? "X" : "O";
}

function other(p) {
  return p === "X" ? "O" : "X";
}

function minimax(board, toMove, ai, depth) {
  const status = evaluate(board);
  if (status.winner === ai) return 10 - depth;
  if (status.winner && status.winner !== ai) return depth - 10;
  if (status.isDraw) return 0;

  let best = toMove === ai ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    const next = board.slice();
    next[i] = toMove;
    const score = minimax(next, other(toMove), ai, depth + 1);
    best = toMove === ai ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

export function bestMove(board, player) {
  let bestScore = -Infinity;
  let bestIdx = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    const next = board.slice();
    next[i] = player;
    const score = minimax(next, other(player), player, 1);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}
