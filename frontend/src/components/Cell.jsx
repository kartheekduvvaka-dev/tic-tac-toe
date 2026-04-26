export default function Cell({ index, value, highlight, disabled, onClick }) {
  const className = [
    "cell",
    value ? `cell--${value.toLowerCase()}` : "",
    highlight ? "cell--win" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ", empty"}`}
      role="gridcell"
    >
      {value}
    </button>
  );
}
