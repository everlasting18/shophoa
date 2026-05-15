import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "owner" | "staff";

interface AuthState {
  token: string | null;
  adminEmail: string | null;
  role: Role | null;
  isLoggedIn: boolean;
  login: (token: string, email: string, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      adminEmail: null,
      role: null,
      isLoggedIn: false,
      login: (token, email, role) => set({ token, adminEmail: email, role, isLoggedIn: true }),
      logout: () => set({ token: null, adminEmail: null, role: null, isLoggedIn: false }),
    }),
    { name: "vht-admin-auth" }
  )
);
