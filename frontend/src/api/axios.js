import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://tibibu-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
  timeout: 30000, // 30 s — allows Render free-tier cold start to wake up
});

api.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      delete config.headers.Authorization;
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired or invalid. Redirecting to login...");
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function pingBackend() {
  return api.get("/health", { skipAuth: true });
}

export default api;
