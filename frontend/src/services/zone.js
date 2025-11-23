import API_BASE_URL from "../config/api.js";

export async function fetchZone(branchId) {
  const response = await fetch(`${API_BASE_URL}/api/zone?branch_id=${branchId}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) throw new Error("No se pudo obtener la zona");

  const data = await response.json();
  return data.zone;
}

export async function saveZone(payload) {
  const response = await fetch(`${API_BASE_URL}/api/zone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo guardar la zona");
  }

  return data.zone;
}
