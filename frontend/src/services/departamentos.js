import API_BASE_URL from "../config/api.js";

function getAuthToken() {
  try {
    const raw = localStorage.getItem("sr_auth_info");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.token || null;
  } catch (err) {
    console.error("No se pudo leer el token", err);
    return null;
  }
}

export async function fetchDepartamentos() {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/departamentos`, { headers });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (!token && response.status === 401) {
      throw new Error("Token no proporcionado. Inicia sesion para continuar.");
    }
    throw new Error(body?.error || "No se pudieron obtener los departamentos");
  }

  return body?.departamentos || [];
}
