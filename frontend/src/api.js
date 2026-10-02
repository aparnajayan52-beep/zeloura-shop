// One place that knows how to talk to the Django backend.
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: API_URL });

// Before EVERY request: if we are logged in, attach the token so Django knows who we are.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// Turn Django's error JSON ({"price": ["..."]} or {"detail": "..."}) into one readable string.
export function errorMessage(error) {
  const data = error?.response?.data;
  if (!data) return "Cannot reach the server. Is the Django backend running?";
  if (typeof data === "string") return "Server error. Check the Django terminal.";
  if (data.detail) return data.detail;
  return Object.entries(data)
    .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(" ")}`)
    .join("  |  ");
}

export default api;
