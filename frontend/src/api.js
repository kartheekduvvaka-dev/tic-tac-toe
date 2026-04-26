const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  newGame: () => request("/api/new"),
  move: (board, index, player) =>
    request("/api/move", {
      method: "POST",
      body: JSON.stringify({ board, index, player }),
    }),
  aiMove: (board, player) =>
    request("/api/ai-move", {
      method: "POST",
      body: JSON.stringify({ board, player }),
    }),
};
