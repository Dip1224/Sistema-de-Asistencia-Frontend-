import API_BASE_URL from "../config/api.js";

export async function fetchDepartamentos() {
  const response = await fetch(`${API_BASE_URL}/departamentos`, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body?.error || "No se pudieron obtener los departamentos");
  }

  return body?.departamentos || [];
}
