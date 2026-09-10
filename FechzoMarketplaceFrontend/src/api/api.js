import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;

    console.error(
      "API Error:",
      error?.response?.data || error?.message
    );

    // ========================================================
    // TOKEN EXPIRED / UNAUTHORIZED
    // ========================================================
    if (status === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("userProfile");

      // Tell Header and other components that auth changed
      window.dispatchEvent(new Event("auth-changed"));

      // Don't force redirect for every API call if you don't want
      // to interrupt pages like wishlist/cart.
    }

    return Promise.reject(error);
  }
);

export default api;