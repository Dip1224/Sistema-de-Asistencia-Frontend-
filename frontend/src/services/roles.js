import API_BASE_URL from "../config/api.js";

export async function fetchRoles() {
  const response = await fetch(`${API_BASE_URL}/roles`, {
    headers: { "Content-Type": "application/json" }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "No se pudieron obtener los roles");
  }

  return data?.roles || [];
}
