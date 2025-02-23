/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const refreshToken = async () => {
  try {
    const resp = await api.post("/api/auth/refresh");
    return resp.data.expiresIn;
  } catch (e) {
    console.log("Error", e);
    throw e;
  }
};

export const logout = async () => {
  await api.post("/api/auth/logout");
  window.location.href = "/login";
};
