import API_BASE_URL from "../config/api.js";

export async function registrarIncidencia({ id_asistencia, descripcion, tipo }) {
  const response = await fetch(`${API_BASE_URL}/incidencias/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_asistencia,
      descripcion,
      tipo
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "No se pudo registrar la incidencia");
  }

  return data.incidencia;
}
