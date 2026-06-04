import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import AdminLayout from "@/components/layout/admin-layout";
import pb from "@/lib/pb";

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    const { isLoggedIn, token } = useAuthStore.getState();
    if (!isLoggedIn || !token) throw redirect({ to: "/login" });
    // Restore pb.authStore from persisted Zustand token on every page load/navigation
    pb.authStore.save(token, null);
    // If token is expired, pb.authStore.isValid will be false after save
    if (!pb.authStore.isValid) {
      useAuthStore.getState().logout();
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});
