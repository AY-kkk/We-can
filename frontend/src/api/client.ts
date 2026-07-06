import axios, { type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const http = axios.create({ baseURL, timeout: 60000 });

// --- token accessors wired by the auth store ---
let accessTokenGetter: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureAuth(
  getter: () => string | null,
  unauthorized: () => void,
) {
  accessTokenGetter = getter;
  onUnauthorized = unauthorized;
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = accessTokenGetter();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend returns {code,message,data}. Unwrap to data, surface errors.
http.interceptors.response.use(
  (resp) => {
    const body = resp.data;
    if (body && typeof body === "object" && "code" in body) {
      if (body.code !== 0) {
        return Promise.reject(new Error(body.message || "请求失败"));
      }
      return { ...resp, data: body.data };
    }
    return resp;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401) onUnauthorized();
    const msg =
      error?.response?.data?.message || error?.message || "网络错误，请稍后重试";
    return Promise.reject(new Error(msg));
  },
);
