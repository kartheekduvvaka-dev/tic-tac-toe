import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api.js";
import { bestMove, emptyBoard, evaluate, nextPlayer } from "./game.js";
import Board from "./components/Board.jsx";
import StatusBanner from "./components/StatusBanner.jsx";

const HUMAN = "X";
const AI = "O";

export default function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [mode, setMode] = useState("ai"); // "ai" | "pvp"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const aiInFlight = useRef(false);

  const status = useMemo(() => evaluate(board), [board]);
  const turn = useMemo(() => (status.isOver ? null : nextPlayer(board)), [board, status]);

  const recordResult = useCallback((finalStatus) => {
    if (!finalStatus.isOver) return;
    setScores((s) => {
      if (finalStatus.isDraw) return { ...s, draws: s.draws + 1 };
      return { ...s, [finalStatus.winner]: s[finalStatus.winner] + 1 };
    });
  }, []);

  // Trigger AI move when it's its turn. We guard with a ref (not the `busy`
  // state) so that calling setBusy doesn't re-fire this effect and cancel the
  // in-flight request.
  useEffect(() => {
    if (mode !== "ai" || status.isOver || turn !== AI || aiInFlight.current) return;
    aiInFlight.current = true;
    setBusy(true);
    (async () => {
      try {
        const data = await api.aiMove(board, AI);
        setBoard(data.board);
        setError(null);
      } catch (err) {
        // Fallback to local minimax if backend is unreachable.
        const idx = bestMove(board, AI);
        if (idx >= 0) {
          const next = board.slice();
          next[idx] = AI;
          setBoard(next);
        }
        setError(`Offline mode: ${err.message}`);
      } finally {
        aiInFlight.current = false;
        setBusy(false);
      }
    })();
  }, [board, mode, status.isOver, turn]);

  // Record score whenever the game ends.
  useEffect(() => {
    if (status.isOver) recordResult(status);
  }, [status, recordResult]);

  const handleCellClick = useCallback(
    async (index) => {
      if (status.isOver || board[index] || busy) return;
      const player = turn;
      if (mode === "ai" && player !== HUMAN) return;

      // Optimistic update.
      const next = board.slice();
      next[index] = player;
      setBoard(next);

      try {
        const data = await api.move(board, index, player);
        setBoard(data.board);
        setError(null);
      } catch (err) {
        setError(`Offline mode: ${err.message}`);
      }
    },
    [board, busy, mode, status.isOver, turn],
  );

  const reset = useCallback(() => {
    setBoard(emptyBoard());
    setError(null);
  }, []);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draws: 0 });
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Tic Tac Toe</h1>
        <p className="app__subtitle">
          Python + FastAPI backend &middot; React + CSS frontend
        </p>
      </header>

      <section className="controls" aria-label="Game controls">
        <fieldset className="controls__mode">
          <legend>Mode</legend>
          <label>
            <input
              type="radio"
              name="mode"
              value="ai"
              checked={mode === "ai"}
              onChange={() => {
                setMode("ai");
                reset();
              }}
            />
            <span>You (X) vs AI (O)</span>
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="pvp"
              checked={mode === "pvp"}
              onChange={() => {
                setMode("pvp");
                reset();
              }}
            />
            <span>Two players</span>
          </label>
        </fieldset>

        <div className="controls__buttons">
          <button type="button" onClick={reset} className="btn btn--primary">
            New game
          </button>
          <button type="button" onClick={resetScores} className="btn">
            Reset scores
          </button>
        </div>
      </section>

      <StatusBanner status={status} turn={turn} mode={mode} />

      <Board
        board={board}
        winningLine={status.line}
        onCellClick={handleCellClick}
        disabled={status.isOver || busy}
      />

      <section className="scoreboard" aria-label="Scoreboard">
        <div className="scoreboard__item">
          <span className="scoreboard__label">X wins</span>
          <span className="scoreboard__value">{scores.X}</span>
        </div>
        <div className="scoreboard__item">
          <span className="scoreboard__label">Draws</span>
          <span className="scoreboard__value">{scores.draws}</span>
        </div>
        <div className="scoreboard__item">
          <span className="scoreboard__label">O wins</span>
          <span className="scoreboard__value">{scores.O}</span>
        </div>
      </section>

      {error && (
        <p className="app__error" role="status">
          {error}
        </p>
      )}

      <footer className="app__footer">
        <span>Built with FastAPI &amp; React</span>
      </footer>
    </div>
  );
}
