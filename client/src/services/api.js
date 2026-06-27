import axios from "axios";

// Base URL for the FindIt API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Example: health check (useful for testing API connection)
export const checkHealth = () => api.get("/health");

export default api;
