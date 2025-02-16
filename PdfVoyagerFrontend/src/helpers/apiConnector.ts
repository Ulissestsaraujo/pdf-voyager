import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const refreshToken = async () => {
  await api.post("/api/auth/refresh");
};

export const logout = async () => {
  await api.post("/api/auth/logout");
  window.location.href = "/login";
};

let isRefreshing = false;
let failedRequests: (() => void)[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          failedRequests.push(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshToken();
        isRefreshing = false;
        failedRequests.forEach((cb) => cb());
        failedRequests = [];
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        await logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
