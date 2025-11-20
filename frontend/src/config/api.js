const DEPLOYED_BASE = "https://sistema-reconocimiento-backend.onrender.com";

function resolveBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Por defecto usa el backend desplegado para evitar intentos a localhost en producción
  return DEPLOYED_BASE;
}

export const API_BASE_URL = resolveBaseUrl().trim();

export default API_BASE_URL;
