const DEFAULT_LOCAL_BASE =
  typeof window !== "undefined" && window.location?.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_LOCAL_BASE).trim();

export default API_BASE_URL;
