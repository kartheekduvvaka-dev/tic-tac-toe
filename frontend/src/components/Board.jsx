import Cell from "./Cell.jsx";

export default function Board({ board, winningLine, onCellClick, disabled }) {
  const winSet = new Set(winningLine ?? []);
  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          highlight={winSet.has(index)}
          disabled={disabled || Boolean(value)}
          onClick={() => onCellClick(index)}
        />
      ))}
    </div>
  );
}
