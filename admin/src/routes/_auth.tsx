import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import AdminLayout from "@/components/layout/admin-layout";
import pb from "@/lib/pb";

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    const { isLoggedIn, token } = useAuthStore.getState();
    if (!isLoggedIn || !token) throw redirect({ to: "/login" });
    // Restore pb.authStore from persisted Zustand token on every page load/navigation
    if (!pb.authStore.isValid) {
      pb.authStore.save(token, null);
    }
  },
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});
