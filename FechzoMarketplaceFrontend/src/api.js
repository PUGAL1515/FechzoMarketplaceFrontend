import axios from "axios";

// ============================================================
// Axios instance
// ============================================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ============================================================
// Automatically attach token (User + Store)
// ============================================================
api.interceptors.request.use(
  (config) => {
    // Priority: storeToken → authToken → jwt_token → token
    const token =
      localStorage.getItem("storeToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwt_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Handle 401
// ============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear both user and store tokens
      localStorage.removeItem("storeToken");
      localStorage.removeItem("authToken");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("token");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("store");
      localStorage.removeItem("storeId");

      window.dispatchEvent(new Event("auth-changed"));
    }
    return Promise.reject(error);
  }
);

export default api;