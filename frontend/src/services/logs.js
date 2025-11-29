import API_BASE_URL from "../config/api.js";

export async function fetchEmployeeLogs(limit = 200) {
  const params = new URLSearchParams();
  if (limit) {
    params.set("limit", limit);
  }

  const response = await fetch(`${API_BASE_URL}/logs/empleados?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body?.error || "No se pudieron obtener los logs");
  }

  return body?.logs || [];
}
