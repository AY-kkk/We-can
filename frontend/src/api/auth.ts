import { http } from "./client";
import type {
  AuthResult,
  DashboardStats,
  TokenPair,
  UserInfo,
  UserListResult,
} from "./authTypes";

export const authApi = {
  register: async (email: string, username: string, password: string) => {
    const { data } = await http.post<AuthResult>("/api/v1/auth/register", {
      email,
      username,
      password,
    });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await http.post<AuthResult>("/api/v1/auth/login", {
      email,
      password,
    });
    return data;
  },
  refresh: async (refresh_token: string) => {
    const { data } = await http.post<TokenPair>("/api/v1/auth/refresh", {
      refresh_token,
    });
    return data;
  },
  logout: async (refresh_token: string) => {
    await http.post("/api/v1/auth/logout", { refresh_token });
  },
  me: async () => {
    const { data } = await http.get<UserInfo>("/api/v1/auth/me");
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await http.post<{ reset_token: string; message: string }>(
      "/api/v1/auth/forgot-password",
      { email },
    );
    return data;
  },
  resetPassword: async (reset_token: string, new_password: string) => {
    await http.post("/api/v1/auth/reset-password", {
      reset_token,
      new_password,
    });
  },
};

export const adminApi = {
  dashboard: async () => {
    const { data } = await http.get<DashboardStats>("/api/v1/admin/dashboard");
    return data;
  },
  users: async (q: string, page: number, pageSize: number) => {
    const { data } = await http.get<UserListResult>("/api/v1/admin/users", {
      params: { q, page, page_size: pageSize },
    });
    return data;
  },
  updateUser: async (id: number, payload: { is_active?: boolean; role?: string }) => {
    const { data } = await http.patch(`/api/v1/admin/users/${id}`, payload);
    return data;
  },
  resetPassword: async (id: number, new_password: string) => {
    await http.post(`/api/v1/admin/users/${id}/reset-password`, { new_password });
  },
  deleteUser: async (id: number) => {
    await http.delete(`/api/v1/admin/users/${id}`);
  },
};
