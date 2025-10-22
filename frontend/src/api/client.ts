// src/api/client.ts
import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,       // <— send cookies
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (!refresh) throw error;
      const { data } = await api.post("/token/refresh/", { refresh });
      localStorage.setItem("access", data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    }
    throw error;
  }
);

export default api;
