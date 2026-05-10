import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminStore } from "@/schema";

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      adminEmail: "",
      login: (email) => set({ isLoggedIn: true, adminEmail: email }),
      logout: () => set({ isLoggedIn: false, adminEmail: "" }),
    }),
    { name: "vht-admin-auth" }
  )
);
