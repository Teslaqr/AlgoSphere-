const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function createContest(payload) {
  const resp = await fetch(`${API_BASE}/api/contests/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error("Failed to create contest");
  return resp.json();
}
