import API_BASE_URL from "../config/api.js";

export async function fetchBranches() {
  const response = await fetch(`${API_BASE_URL}/api/branches`);
  if (!response.ok) throw new Error("No se pudieron obtener las sucursales");
  const data = await response.json();
  return data.branches || [];
}

export async function createBranch(payload) {
  const response = await fetch(`${API_BASE_URL}/api/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "No se pudo crear la sucursal");
  }

  return data.branch;
}
