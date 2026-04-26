export default function StatusBanner({ status, turn, mode }) {
  let message;
  let tone = "info";

  if (status.isOver) {
    if (status.isDraw) {
      message = "It's a draw.";
      tone = "draw";
    } else {
      tone = "win";
      if (mode === "ai") {
        message = status.winner === "X" ? "You win!" : "AI wins.";
      } else {
        message = `${status.winner} wins!`;
      }
    }
  } else if (turn) {
    if (mode === "ai") {
      message = turn === "X" ? "Your turn (X)" : "AI is thinking…";
    } else {
      message = `${turn}'s turn`;
    }
  } else {
    message = "Ready to play.";
  }

  return (
    <div className={`status status--${tone}`} role="status">
      {message}
    </div>
  );
}
