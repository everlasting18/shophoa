import { createRootRouteWithContext, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient } from "@tanstack/react-query";
import { ToastProvider } from "@/lib/toast";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFound() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-stone-700 mb-4">404</p>
        <p className="text-stone-400 mb-6">Trang không tồn tại</p>
        <Link to="/" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
          Về Dashboard
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  notFoundComponent: NotFound,
  component: () => (
    <ToastProvider>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </ToastProvider>
  ),
});
