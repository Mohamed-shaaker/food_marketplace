import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://tibibu-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 60000,
});

// REQUEST INTERCEPTOR: Automatically add JWT token to every request
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

// RESPONSE INTERCEPTOR: Handle expired tokens or unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401 (Unauthorized), the token is likely expired
    if (error.response && error.response.status === 401) {
      console.warn("Token expired or invalid. Redirecting to login...");
      localStorage.removeItem("token"); // Clear the "bad" token

      // Redirect to login page if we aren't already there
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
