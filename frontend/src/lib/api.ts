import axios from "axios";

// In production (Vercel), always use /api to avoid mixed content errors
// NEVER use hardcoded HTTP backend URL from env variables
const isProduction = process.env.NODE_ENV === "production";
const baseURL = isProduction ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "/api");

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Public API (no auto redirect on 401)
export const publicApi = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor untuk menambahkan token
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
  }
);

// Response interceptor untuk handle errors (ONLY auto redirect on api, not publicApi)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
