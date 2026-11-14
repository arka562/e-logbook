import axios from "axios";

// API base URL is configurable at build time via VITE_API_BASE_URL
// (see .env.example in this folder). Vite bakes the value into the
// bundle, so changing it requires a rebuild. The fallback keeps the
// local dev setup working with zero configuration.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;