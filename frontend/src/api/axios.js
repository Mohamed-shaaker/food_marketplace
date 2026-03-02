import axios from "axios";

// Create an instance of axios with a custom config
const api = axios.create({
  baseURL: "http://localhost:8000", // Your FastAPI URL
});

// REQUEST INTERCEPTOR: Automatically add JWT token to every request
api.interceptors.request.use(
  (config) => {
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

export default api;
