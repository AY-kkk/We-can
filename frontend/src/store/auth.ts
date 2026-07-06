import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/api/auth";
import type { UserInfo } from "@/api/authTypes";
import { configureAuth } from "@/api/client";

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  fetchMe: () => Promise<void>;
  isAuthed: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hydrated: false,

      login: async (email, password) => {
        const res = await authApi.login(email, password);
        set({
          user: res.user,
          accessToken: res.tokens.access_token,
          refreshToken: res.tokens.refresh_token,
        });
      },

      register: async (email, username, password) => {
        const res = await authApi.register(email, username, password);
        set({
          user: res.user,
          accessToken: res.tokens.access_token,
          refreshToken: res.tokens.refresh_token,
        });
      },

      logout: async () => {
        const rt = get().refreshToken;
        try {
          if (rt) await authApi.logout(rt);
        } catch {
          /* ignore */
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshSession: async () => {
        const rt = get().refreshToken;
        if (!rt) throw new Error("no refresh token");
        const tokens = await authApi.refresh(rt);
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });
      },

      fetchMe: async () => {
        const user = await authApi.me();
        set({ user });
      },

      isAuthed: () => !!get().accessToken,
      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "wecan-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

// Wire the axios client to the store (token + 401 handling with one retry).
configureAuth(
  () => useAuthStore.getState().accessToken,
  () => {
    // On hard 401, drop session so guards redirect to login.
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
  },
);
